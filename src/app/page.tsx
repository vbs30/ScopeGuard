import Link from "next/link";
import { ClipboardList, FilePlus2, BadgeCheck, Link2, History, FileDown, ShieldCheck, Lock, Check, X } from "lucide-react";
import { Nav, Footer } from "@/components/marketing";

const steps = [
  [ClipboardList, "Define the scope", "List deliverables, exclusions, revision rounds and milestones, then publish a version your client can read."],
  [FilePlus2, "Record every change", "When extra work comes up, write it as a change request with its own price and timeline impact."],
  [BadgeCheck, "Get a recorded decision", "Your client approves or declines from a private link. The decision, time and scope version are stored."],
] as const;
const features = [
  [Lock, "Immutable published scopes", "Editing a published scope creates a new version. Earlier versions are never rewritten."],
  [Link2, "Private client links", "No client account needed. Revoke or replace a link whenever you like."],
  [History, "Tamper-proof history", "Every publish, request and decision is logged and cannot be edited afterwards."],
  [FileDown, "PDF records", "Export any scope or change request with the client's decision and timestamp (Solo plan)."],
  [ShieldCheck, "Built on row-level security", "Each account can only ever read its own data, enforced in the database."],
  [BadgeCheck, "Clear status at a glance", "See what is pending, approved or declined, and the value of each, on your dashboard."],
] as const;
const without = ["Agreement buried in old emails and chats", "Extra work done for free, or argued about later", "No record of who approved what"];
const withSG = ["One published scope the client can always open", "Each extra request priced and approved first", "A timestamped decision tied to the exact scope version"];
const faq = [
  ["Is a client's approval a legal signature?", "No. ScopeGuard records a clear, timestamped decision tied to a scope version. It is not a legally certified electronic signature, and it does not guarantee payment."],
  ["Does my client need an account?", "No. They open a private link, review, and approve or decline."],
  ["What does it cost?", "Free for one active project. Solo is $19/month for multiple projects, version history and PDF export. Solo billing is not open yet; early users can be moved to Solo manually."],
  ["Who is it for?", "Freelance web and software developers, designers who build sites, and small agencies."],
];
const Plan = ({ name, price, items, cta, hot }: { name: string; price: string; items: string[]; cta?: boolean; hot?: boolean }) => (
  <div className={`card !p-7 ${hot ? "ring-2 ring-brand-600" : ""}`}>
    <h3 className="font-semibold">{name}{hot && <span className="badge ml-2 bg-brand-100 text-brand-700">Early access</span>}</h3>
    <p className="mt-2 text-4xl font-bold">{price}{price !== "$0" && <span className="text-base font-normal text-slate-500">/month</span>}</p>
    <ul className="mt-5 grid gap-2 text-sm text-slate-700">{items.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-brand-600" />{x}</li>)}</ul>
    {cta && <Link href="/login" className="btn btn-primary mt-6 w-full">Start free</Link>}
  </div>
);

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50 via-white to-white">
          <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center sm:pt-24">
            <span className="badge bg-brand-100 text-brand-700">Built for freelance developers and small agencies</span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold sm:text-6xl">Stop scope creep before it costs you money.</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">Define the work, document every change, and get client approval before extra work begins.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/login" className="btn btn-primary !px-6 !py-3 text-base">Start free</Link>
              <Link href="#how" className="btn btn-secondary !px-6 !py-3 text-base">See how it works</Link>
            </div>
            <p className="mt-3 text-sm text-slate-500">Free for one active project. No credit card needed.</p>

            <div className="relative mx-auto mt-14 max-w-xl text-left" aria-label="Example of the client approval page">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-brand-600/10">
                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="ml-3 text-xs text-slate-400">Client review page · example</span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-slate-400">Change request · based on scope v2</p>
                  <h3 className="mt-1 text-xl font-semibold">Add a blog section</h3>
                  <p className="mt-2 text-sm text-slate-600">Blog index, post template and an RSS feed, added after the original launch scope.</p>
                  <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Extra cost</dt><dd className="font-semibold">$400</dd></div>
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Extra time</dt><dd className="font-semibold">+3 days</dd></div>
                    <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Status</dt><dd className="badge bg-amber-50 text-amber-700">Pending</dd></div>
                  </dl>
                  <div className="pointer-events-none mt-5 flex gap-2" aria-hidden="true"><span className="btn btn-primary">Approve</span><span className="btn btn-secondary">Decline</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">Extra work shouldn&rsquo;t be a negotiation after the fact</h2>
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
            <div className="card !p-6"><h3 className="font-semibold text-red-700">Without a record</h3><ul className="mt-4 grid gap-3 text-sm text-slate-700">{without.map((x) => <li key={x} className="flex gap-2"><X size={16} className="mt-0.5 shrink-0 text-red-500" />{x}</li>)}</ul></div>
            <div className="card !border-brand-100 !bg-brand-50/50 !p-6"><h3 className="font-semibold text-brand-700">With ScopeGuard</h3><ul className="mt-4 grid gap-3 text-sm text-slate-700">{withSG.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-brand-600" />{x}</li>)}</ul></div>
          </div>
        </section>

        <section id="how" className="scroll-mt-16 border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-3xl font-bold">How it works</h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map(([Icon, t, d], i) => (
                <li key={t} className="card !p-6"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon size={20} /></div>
                  <p className="mt-4 text-xs font-medium text-slate-400">Step {i + 1}</p><h3 className="mt-1 font-semibold">{t}</h3><p className="mt-2 text-sm text-slate-600">{d}</p></li>))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">Everything you need, nothing you don&rsquo;t</h2>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([Icon, t, d]) => (<div key={t} className="flex gap-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon size={20} /></div><div><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div></div>))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-20">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-3xl font-bold">Simple pricing</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <Plan name="Free" price="$0" cta items={["1 active project", "Publish a scope and share a private link", "Change requests with recorded decisions", "Activity history"]} />
              <Plan name="Solo" price="$19" hot items={["Multiple active projects", "Scope version history", "PDF export", "Billing opens soon; early users are moved to Solo manually"]} />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold">Questions</h2>
          <div className="mt-8 grid gap-3">
            {faq.map(([q, a]) => (
              <details key={q} className="group card !p-0">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium">{q}<span className="text-xl text-slate-400 transition group-open:rotate-45">+</span></summary>
                <p className="px-5 pb-4 text-sm text-slate-600">{a}</p>
              </details>))}
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-4xl rounded-2xl bg-brand-600 px-6 py-14 text-center text-white">
            <h2 className="text-3xl font-bold">Get approval before the extra work begins.</h2>
            <Link href="/login" className="btn mt-7 bg-white !px-6 !py-3 text-base text-brand-700 hover:bg-brand-50">Start free</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}