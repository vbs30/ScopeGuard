-- Owner activity logging (owners cannot insert into activity_events directly) + public scope read.
create or replace function log_owner_event(p_project uuid, p_type text, p_scope uuid default null, p_cr uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from projects p where p.id = p_project and is_ws_owner(p.workspace_id)) then
    raise exception 'forbidden';
  end if;
  insert into activity_events(project_id, actor, event_type, scope_version_id, change_request_id)
  values (p_project, 'owner:' || auth.uid()::text, p_type, p_scope, p_cr);
end $$;
revoke all on function log_owner_event(uuid, text, uuid, uuid) from public;
grant execute on function log_owner_event(uuid, text, uuid, uuid) to authenticated;

create or replace function public_get_scope(raw_token text) returns jsonb
language sql stable security definer set search_path = public, extensions as $$
  select jsonb_build_object('content', s.content, 'price_cents', s.price_cents, 'currency', p.currency,
           'version', s.version, 'published_at', s.published_at, 'project', p.name, 'client', p.client_name)
  from public_links l
  join scope_versions s on s.id = l.scope_version_id
  join projects p on p.id = s.project_id
  where l.token_hash = digest(raw_token, 'sha256') and l.revoked_at is null and s.published_at is not null
$$;
revoke all on function public_get_scope(text) from public;
grant execute on function public_get_scope(text) to anon, authenticated;
