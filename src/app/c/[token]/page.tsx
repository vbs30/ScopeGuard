import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabase/public";
import { decide } from "./actions";
export const metadata = { robots: { index: false, follow: false }, title: "Change request" };
export const dynamic = "force-dynamic";

const banner: Record<string, string> = {
  approved: "Thank you. You approved this change. The decision has been recorded with the time and scope version.",
  rejected: "Thank you. You declined this change. The decision has been recorded.",
  already: "This request has already been decided or withdrawn, so nothing was changed.",
  failed: "Something went wrong. Please try again.", invalid: "Please check your input and try again.",
};

export default async function PublicChange({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { token } = await params; const { msg } = await searchParams;
  const { data: r } = await supabasePublic().rpc("public_get_change_request", { raw_token: token });
  if (!r) notFound();
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <p className="text-sm text-neutral-500">Change request · {r.project} · based on scope v{r.scope_version}</p>
      <h1 className="mt-1 text-3xl font-semibold">{r.title}</h1>
      <p className="text-neutral-600">For {r.client}</p>
      {msg && banner[msg] && <p role="status" className="mt-4 rounded-md bg-neutral-100 px-3 py-2 text-sm">{banner[msg]}</p>}
      <p className="mt-6 whitespace-pre-wrap">{r.description}</p>
      {r.reason && <p className="mt-4 whitespace-pre-wrap text-neutral-700"><b>Reason:</b> {r.reason}</p>}
      <p className="mt-6 text-lg font-semibold">Additional cost: {(r.extra_price_cents / 100).toLocaleString()} {r.currency}</p>
      <p className="text-neutral-700">Additional time: {r.extra_days} day(s)</p>
      <p className="mt-2 text-sm">Status: <b>{r.status}</b></p>
      {r.status === "pending" ? (
        <form action={decide} className="mt-8 grid gap-3">
          <input type="hidden" name="token" value={token} />
          <textarea name="comment" maxLength={2000} placeholder="Optional comment" className="rounded-md border px-3 py-2" rows={3} />
          <div className="flex gap-3">
            <button name="decision" value="approved" className="rounded-md bg-neutral-900 px-5 py-2 text-white">Approve</button>
            <button name="decision" value="rejected" className="rounded-md border px-5 py-2">Decline</button>
          </div>
          <p className="text-xs text-neutral-500">Your decision is recorded with a timestamp. It is a record of agreement, not a legally certified signature.</p>
        </form>) : <p className="mt-6 text-sm text-neutral-600">No further action is needed.</p>}
    </main>
  );
}
