-- ScopeGuard core schema. UNTESTED against a live Postgres: run via `supabase db reset` and the RLS tests before trusting.
create extension if not exists pgcrypto;

-- ---------- Tenancy ----------
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  plan text not null default 'free' check (plan in ('free','solo')),
  created_at timestamptz not null default now()
);
create unique index on workspaces(owner_id);

create or replace function is_ws_owner(ws uuid) returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from workspaces w where w.id = ws and w.owner_id = auth.uid()) $$;

-- ---------- Projects ----------
create table projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  client_name text not null,
  client_email text,
  price_cents bigint not null check (price_cents >= 0),
  currency char(3) not null default 'USD',
  status text not null default 'active' check (status in ('active','archived')),
  starts_on date, due_on date,
  created_at timestamptz not null default now()
);
create index on projects(workspace_id, status);

-- Free plan: one active project, enforced in the database (not just the UI).
create or replace function enforce_project_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare p text; n int;
begin
  if new.status <> 'active' then return new; end if;
  select plan into p from workspaces where id = new.workspace_id;
  select count(*) into n from projects
    where workspace_id = new.workspace_id and status = 'active' and id <> new.id;
  if p = 'free' and n >= 1 then
    raise exception 'free_plan_project_limit' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger trg_project_limit before insert or update of status on projects
  for each row execute function enforce_project_limit();

-- ---------- Scope versions (published = immutable) ----------
create table scope_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  version int not null,
  content jsonb not null,            -- summary, deliverables, exclusions, revisions, milestones, assumptions, notes
  price_cents bigint not null check (price_cents >= 0),
  published_at timestamptz,          -- null = working draft
  created_at timestamptz not null default now(),
  unique (project_id, version)
);
create or replace function block_published_scope_edit() returns trigger
language plpgsql as $$
begin
  if old.published_at is not null then
    raise exception 'published_scope_is_immutable' using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;
create trigger trg_scope_immutable before update or delete on scope_versions
  for each row execute function block_published_scope_edit();

-- ---------- Change requests ----------
create table change_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  scope_version_id uuid not null references scope_versions(id),  -- version this change builds on
  title text not null check (char_length(title) between 1 and 200),
  description text not null,
  reason text,
  extra_price_cents bigint not null check (extra_price_cents >= 0),
  currency char(3) not null,
  extra_days int not null default 0 check (extra_days >= 0),
  status text not null default 'draft'
    check (status in ('draft','pending','approved','rejected','withdrawn')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index on change_requests(project_id, status);

-- Only legal transitions; approved/rejected/withdrawn are terminal.
create or replace function enforce_cr_transition() returns trigger
language plpgsql as $$
begin
  if old.status = new.status then return new; end if;
  if (old.status, new.status) not in
     (('draft','pending'),('draft','withdrawn'),('pending','approved'),
      ('pending','rejected'),('pending','withdrawn')) then
    raise exception 'invalid_status_transition % -> %', old.status, new.status;
  end if;
  return new;
end $$;
create trigger trg_cr_transition before update of status on change_requests
  for each row execute function enforce_cr_transition();

-- ---------- Public links (only hashes stored) ----------
create table public_links (
  id uuid primary key default gen_random_uuid(),
  token_hash bytea not null unique,
  scope_version_id uuid references scope_versions(id) on delete cascade,
  change_request_id uuid references change_requests(id) on delete cascade,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (num_nonnulls(scope_version_id, change_request_id) = 1)
);

-- ---------- Approvals + activity (append-only) ----------
create table approvals (
  id uuid primary key default gen_random_uuid(),
  change_request_id uuid not null unique references change_requests(id),  -- one decision, ever
  scope_version_id uuid not null references scope_versions(id),
  decision text not null check (decision in ('approved','rejected')),
  comment text check (char_length(comment) <= 2000),
  decided_at timestamptz not null default now()
);
create table activity_events (
  id bigint generated always as identity primary key,
  project_id uuid not null references projects(id) on delete cascade,
  actor text not null,               -- 'owner:<uuid>' or 'client:link'
  event_type text not null,
  scope_version_id uuid,
  change_request_id uuid,
  created_at timestamptz not null default now()
);
create or replace function forbid_mutation() returns trigger language plpgsql as
$$ begin raise exception 'append_only_table'; end $$;
create trigger trg_approvals_ro before update or delete on approvals
  for each row execute function forbid_mutation();
create trigger trg_activity_ro before update or delete on activity_events
  for each row execute function forbid_mutation();

-- ---------- RLS ----------
alter table workspaces enable row level security;
alter table projects enable row level security;
alter table scope_versions enable row level security;
alter table change_requests enable row level security;
alter table public_links enable row level security;
alter table approvals enable row level security;
alter table activity_events enable row level security;

create policy ws_owner on workspaces for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy proj_owner on projects for all
  using (is_ws_owner(workspace_id)) with check (is_ws_owner(workspace_id));
create policy scope_owner on scope_versions for all
  using (exists (select 1 from projects p where p.id = project_id and is_ws_owner(p.workspace_id)))
  with check (exists (select 1 from projects p where p.id = project_id and is_ws_owner(p.workspace_id)));
create policy cr_owner on change_requests for all
  using (exists (select 1 from projects p where p.id = project_id and is_ws_owner(p.workspace_id)))
  with check (exists (select 1 from projects p where p.id = project_id and is_ws_owner(p.workspace_id)));
create policy links_owner on public_links for all
  using (exists (select 1 from change_requests c join projects p on p.id = c.project_id
                 where c.id = change_request_id and is_ws_owner(p.workspace_id))
      or exists (select 1 from scope_versions s join projects p on p.id = s.project_id
                 where s.id = scope_version_id and is_ws_owner(p.workspace_id)));
create policy approvals_read on approvals for select
  using (exists (select 1 from change_requests c join projects p on p.id = c.project_id
                 where c.id = change_request_id and is_ws_owner(p.workspace_id)));
create policy activity_read on activity_events for select
  using (exists (select 1 from projects p where p.id = project_id and is_ws_owner(p.workspace_id)));
-- No insert/update/delete policies on approvals/activity: only SECURITY DEFINER functions write them.

-- ---------- Public access: narrow RPCs, no anon table access ----------
create or replace function public_get_change_request(raw_token text) returns jsonb
language sql stable security definer set search_path = public, extensions as $$
  select jsonb_build_object('title', c.title, 'description', c.description, 'reason', c.reason,
           'extra_price_cents', c.extra_price_cents, 'currency', c.currency,
           'extra_days', c.extra_days, 'status', c.status,
           'project', p.name, 'client', p.client_name, 'scope_version', s.version)
  from public_links l
  join change_requests c on c.id = l.change_request_id
  join projects p on p.id = c.project_id
  join scope_versions s on s.id = c.scope_version_id
  where l.token_hash = digest(raw_token, 'sha256') and l.revoked_at is null
$$;

create or replace function public_decide(raw_token text, p_decision text, p_comment text)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare cr change_requests; lk public_links;
begin
  if p_decision not in ('approved','rejected') then raise exception 'bad_decision'; end if;
  select * into lk from public_links
    where token_hash = digest(raw_token, 'sha256') and revoked_at is null and change_request_id is not null;
  if not found then raise exception 'invalid_link'; end if;
  select * into cr from change_requests where id = lk.change_request_id for update;  -- serializes races
  if cr.status <> 'pending' then raise exception 'not_pending'; end if;
  update change_requests set status = p_decision, decided_at = now() where id = cr.id;
  insert into approvals(change_request_id, scope_version_id, decision, comment)
    values (cr.id, cr.scope_version_id, p_decision, left(p_comment, 2000));
  insert into activity_events(project_id, actor, event_type, scope_version_id, change_request_id)
    values (cr.project_id, 'client:link', 'change_request_' || p_decision, cr.scope_version_id, cr.id);
  return p_decision;
end $$;

revoke all on function public_get_change_request(text), public_decide(text,text,text) from public;
grant execute on function public_get_change_request(text), public_decide(text,text,text) to anon, authenticated;
