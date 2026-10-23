import { supabaseServer } from "@/lib/supabase/server";

const fmt = (m: Record<string, number>) =>
  Object.keys(m).length ? Object.entries(m).map(([c, v]) => `${(v / 100).toLocaleString()} ${c}`).join(" · ") : "0";
const Card = ({ label, value, hint }: { label: string; value: string | number; hint?: string }) => (
  <div className="rounded-lg border p-4"><p className="text-sm text-neutral-500">{label}</p>
    <p className="mt-1 text-xl font-semibold">{value}</p>{hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}</div>
);

export default async function Metrics() {
  const sb = await supabaseServer();
  const [active, crs, events, projs] = await Promise.all([
    sb.from("projects").select("id", { count: "exact", head: true }).eq("status", "active"),
    sb.from("change_requests").select("id,project_id,title,status,extra_price_cents,currency"),
    sb.from("activity_events").select("id,project_id,event_type,created_at").order("created_at", { ascending: false }).limit(8),
    sb.from("projects").select("id,name"),
  ]);
  const rows = crs.data ?? [];
  const sum = (status: string) => rows.filter((r) => r.status === status)
    .reduce<Record<string, number>>((a, r) => ({ ...a, [r.currency]: (a[r.currency] ?? 0) + Number(r.extra_price_cents) }), {});
  const pending = rows.filter((r) => r.status === "pending");
  const name = new Map((projs.data ?? []).map((p) => [p.id, p.name]));

  return (
    <section className="mb-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card label="Active projects" value={active.count ?? 0} />
        <Card label="Awaiting client approval" value={pending.length} />
        <Card label="Approved changes" value={rows.filter((r) => r.status === "approved").length} />
        <Card label="Proposed value (pending)" value={fmt(sum("pending"))} hint="Not yet approved" />
        <Card label="Approved additional value" value={fmt(sum("approved"))} hint="Agreed by client. Not money collected." />
      </div>
      {pending.length > 0 && (<div className="mt-6"><h2 className="mb-2 font-semibold">Pending actions</h2>
        <ul className="text-sm">{pending.map((r) => (<li key={r.id}><a className="underline" href={`/dashboard/projects/${r.project_id}`}>{r.title}</a> · {name.get(r.project_id)} · waiting for client</li>))}</ul></div>)}
      <div className="mt-6"><h2 className="mb-2 font-semibold">Recent activity</h2>
        {(events.data ?? []).length === 0 ? <p className="text-sm text-neutral-500">No activity yet.</p> :
          <ul className="text-sm text-neutral-700">{events.data!.map((e) => (<li key={e.id}>{new Date(e.created_at).toUTCString()} · {name.get(e.project_id)} · {e.event_type.replaceAll("_", " ")}</li>))}</ul>}</div>
    </section>
  );
}
