import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
export const metadata = { robots: { index: false, follow: false }, title: "Project scope" };
export const dynamic = "force-dynamic";

const List = ({ t, a }: { t: string; a?: string[] }) => a?.length ? (<section className="mt-6"><h2 className="font-semibold">{t}</h2><ul className="ml-5 list-disc text-neutral-700">{a.map((x, i) => <li key={i}>{x}</li>)}</ul></section>) : null;

export default async function PublicScope({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data } = await supabasePublic().rpc("public_get_scope", { raw_token: token });
  if (!data) notFound();
  const c = data.content;
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm text-neutral-500">Scope of work · version {data.version} · published {new Date(data.published_at).toUTCString()}</p>
      <h1 className="mt-1 text-3xl font-semibold">{data.project}</h1>
      <p className="text-neutral-600">Prepared for {data.client} · Agreed price {(data.price_cents / 100).toLocaleString()} {data.currency}</p>
      <p className="mt-6 whitespace-pre-wrap">{c.summary}</p>
      <List t="Deliverables" a={c.deliverables} /><List t="Not included" a={c.exclusions} />
      <List t="Milestones" a={c.milestones} /><List t="Assumptions" a={c.assumptions} />
      <p className="mt-6 text-neutral-700">Included revision rounds: {c.revisions}{c.timeline && ` · Timeline: ${c.timeline}`}</p>
      {c.notes && <p className="mt-4 whitespace-pre-wrap text-neutral-700">{c.notes}</p>}
      <p className="mt-10 text-xs text-neutral-500">Any work outside this scope will be proposed as a change request for your approval before it begins. This page is a record of the agreed scope, not a legally certified signature.</p>
    </main>
  );
}
