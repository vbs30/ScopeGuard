import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { saveScope, publishScope, replaceScopeLink, createChangeRequest, withdrawChangeRequest } from "./actions";

export const metadata = { robots: { index: false } };
const inp = "w-full rounded-md border px-3 py-2";
const money = (c: number, cur: string) => `${(c / 100).toLocaleString()} ${cur}`;

export default async function ProjectPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string; link?: string }>;
}) {
  const { id } = await params; const q = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: project } = await sb.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) notFound();
  const { data: versions } = await sb.from("scope_versions").select("*").eq("project_id", id).order("version", { ascending: false });
  const { data: crs } = await sb.from("change_requests").select("*").eq("project_id", id).order("created_at", { ascending: false });
  const { data: events } = await sb.from("activity_events").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(15);
  const latest = versions?.[0]; const hasPublished = !!versions?.some((v) => v.published_at);
  const c = (latest?.content ?? {}) as Record<string, any>;
  const join = (a?: string[]) => (a ?? []).join("\n");
  const h = await headers(); const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <a href="/dashboard" className="text-sm text-neutral-600">← Projects</a>
      <h1 className="mt-2 text-2xl font-semibold">{project.name}</h1>
      <p className="mb-6 text-neutral-600">{project.client_name} · {money(project.price_cents, project.currency)}</p>
      {q.error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{q.error}</p>}
      {q.ok && <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{q.ok}
        {q.link?.match(/^\/[sc]\/[\w-]+$/) && <input readOnly className="mt-2 w-full rounded border bg-white px-2 py-1 font-mono text-xs" value={origin + q.link} />}</div>}

      <h2 className="mb-2 mt-8 text-lg font-semibold">Original scope {latest && <span className="text-sm font-normal text-neutral-500">v{latest.version}{latest.published_at ? " (published; editing creates a new version)" : " (draft)"}</span>}</h2>
      <form className="grid gap-3">
        <input type="hidden" name="project_id" value={id} />
        <textarea name="summary" required placeholder="Project summary" defaultValue={c.summary} className={inp} rows={3} />
        <textarea name="deliverables" placeholder="Deliverables (one per line)" defaultValue={join(c.deliverables)} className={inp} rows={4} />
        <textarea name="exclusions" placeholder="Excluded features (one per line)" defaultValue={join(c.exclusions)} className={inp} rows={3} />
        <textarea name="milestones" placeholder="Milestones (one per line)" defaultValue={join(c.milestones)} className={inp} rows={3} />
        <textarea name="assumptions" placeholder="Assumptions (one per line)" defaultValue={join(c.assumptions)} className={inp} rows={3} />
        <div className="grid grid-cols-2 gap-3">
          <input name="revisions" type="number" min={0} defaultValue={c.revisions ?? 2} className={inp} aria-label="Included revision rounds" />
          <input name="timeline" placeholder="Expected timeline, e.g. 6 weeks" defaultValue={c.timeline} className={inp} />
        </div>
        <textarea name="notes" placeholder="Notes for the client" defaultValue={c.notes} className={inp} rows={2} />
        <div className="flex gap-3">
          <button formAction={saveScope} className="rounded-md border px-4 py-2">Save draft</button>
          <button formAction={publishScope} className="rounded-md bg-neutral-900 px-4 py-2 text-white">Publish &amp; get client link</button>
        </div>
      </form>
      {hasPublished && <a href={`/dashboard/projects/${id}/pdf?type=scope`} className="mt-3 inline-block text-sm underline">Download scope PDF</a>}
      {hasPublished && <form action={replaceScopeLink} className="mt-3"><input type="hidden" name="project_id" value={id} />
        <button className="text-sm text-neutral-600 underline">Revoke old links &amp; create a new scope link</button></form>}

      <h2 className="mb-2 mt-12 text-lg font-semibold">Change requests</h2>
      {!hasPublished ? <p className="text-sm text-neutral-500">Publish the original scope to start recording changes.</p> : (
        <form action={createChangeRequest} className="grid gap-3 rounded-lg border p-4">
          <input type="hidden" name="project_id" value={id} />
          <input name="title" required placeholder="Title, e.g. Add blog section" className={inp} />
          <textarea name="description" required placeholder="Additional work" className={inp} rows={3} />
          <textarea name="reason" placeholder="Reason for the change (optional)" className={inp} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <input name="price" type="number" step="0.01" min="0" required placeholder={`Extra price (${project.currency})`} className={inp} />
            <input name="extra_days" type="number" min="0" defaultValue={0} className={inp} aria-label="Extra days" />
          </div>
          <button className="rounded-md bg-neutral-900 px-4 py-2 text-white">Create &amp; get client link</button>
        </form>)}
      <ul className="mt-4 flex flex-col gap-2">
        {(crs ?? []).map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-lg border p-3">
            <div><p className="font-medium">{r.title}</p>
              <p className="text-sm text-neutral-600">+{money(r.extra_price_cents, r.currency)} · +{r.extra_days} days · <b>{r.status}</b>{r.decided_at && ` · ${new Date(r.decided_at).toUTCString()}`}</p></div>
            <a href={`/dashboard/projects/${id}/pdf?type=change&cr=${r.id}`} className="mr-3 text-sm underline">PDF</a>
            {(r.status === "pending" || r.status === "draft") && <form action={withdrawChangeRequest}>
              <input type="hidden" name="project_id" value={id} /><input type="hidden" name="id" value={r.id} />
              <button className="text-sm text-neutral-600">Withdraw</button></form>}
          </li>))}
      </ul>

      <h2 className="mb-2 mt-12 text-lg font-semibold">Activity</h2>
      {(events ?? []).length === 0 ? <p className="text-sm text-neutral-500">Nothing yet.</p> :
        <ul className="text-sm text-neutral-700">{events!.map((e) => <li key={e.id}>{new Date(e.created_at).toUTCString()} · {e.event_type.replaceAll("_", " ")} · {e.actor.startsWith("client") ? "client" : "you"}</li>)}</ul>}
    </main>
  );
}
