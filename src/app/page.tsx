import Link from "next/link";
import { Nav, Footer } from "@/components/marketing";

const steps = [
  ["Define the scope", "List deliverables, exclusions, revision rounds and milestones, then publish a version your client can read."],
  ["Record every change", "When extra work comes up, write it as a change request with its own price and timeline impact."],
  ["Get a recorded decision", "Your client approves or declines from a private link. The decision, time and scope version are stored."],
];
const features = [
  ["Immutable published scopes", "Editing a published scope creates a new version. Earlier versions are never rewritten."],
  ["Private client links", "No client account needed. Links can be revoked or replaced at any time."],
  ["Clear decision history", "Every publish, request and decision is logged and cannot be edited afterwards."],
  ["PDF records", "Export the scope or any change request, including the client's decision and timestamp (Solo plan)."],
];
const faq = [
  ["Is a client's approval a legal signature?", "No. ScopeGuard records a clear, timestamped decision tied to a scope version. It is not a legally certified electronic signature, and it does not guarantee payment."],
  ["Does my client need an account?", "No. They open a private link, review, and approve or decline."],
  ["What does it cost?", "Free for one active project. Solo is $19/month for multiple projects, version history and PDF export. Solo billing is not open yet; see the pricing page."],
  ["Who is it for?", "Freelance web and software developers, designers who build sites, and small agencies."],
];

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-16">
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight">Stop scope creep before it costs you money.</h1>
          <p className="mt-5 max-w-2xl text-lg text-neutral-600">Define the work, document every change, and get client approval before extra work begins.</p>
          <div className="mt-8 flex gap-3">
            <Link href="/login" className="rounded-md bg-neutral-900 px-5 py-3 text-white">Start free</Link>
            <Link href="#how" className="rounded-md border px-5 py-3">See how it works</Link>
          </div>
          <div className="mt-12 max-w-xl rounded-xl border p-5" aria-label="Illustrative example of a change request">
            <p className="text-xs uppercase tracking-wide text-neutral-400">Illustrative example</p>
            <p className="mt-2 font-medium">Change request: Add a blog section</p>
            <p className="text-sm text-neutral-600">Based on scope v2 · +$400 · +3 days</p>
            <div className="mt-3 flex gap-2 text-sm"><span className="rounded bg-neutral-900 px-3 py-1 text-white">Approve</span><span className="rounded border px-3 py-1">Decline</span></div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-2xl font-semibold">The problem</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <p className="text-neutral-700">Clients ask for &ldquo;one more page&rdquo; or &ldquo;a small tweak&rdquo;. The agreement lives in old emails and chats, so extra work gets done for free or turns into an awkward argument.</p>
            <p className="text-neutral-700">ScopeGuard keeps the agreed scope in one place and turns each extra request into a priced proposal the client can accept or decline before you start.</p>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-5xl scroll-mt-8 px-6 py-12">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3">
            {steps.map(([t, d], i) => (<li key={t} className="rounded-xl border p-5"><p className="text-sm text-neutral-400">Step {i + 1}</p><h3 className="mt-1 font-semibold">{t}</h3><p className="mt-2 text-sm text-neutral-600">{d}</p></li>))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-2xl font-semibold">What you get</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {features.map(([t, d]) => (<div key={t}><h3 className="font-semibold">{t}</h3><p className="mt-1 text-sm text-neutral-600">{d}</p></div>))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-2xl font-semibold">Pricing</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border p-5"><h3 className="font-semibold">Free</h3><p className="text-2xl font-semibold">$0</p><p className="mt-2 text-sm text-neutral-600">One active project and the basic change-request workflow.</p></div>
            <div className="rounded-xl border p-5"><h3 className="font-semibold">Solo</h3><p className="text-2xl font-semibold">$19<span className="text-base font-normal text-neutral-500">/month</span></p><p className="mt-2 text-sm text-neutral-600">Multiple active projects, scope version history and PDF export.</p></div>
          </div>
          <Link href="/pricing" className="mt-4 inline-block text-sm underline">Full plan details</Link>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <dl className="mt-6 grid gap-5">{faq.map(([q, a]) => (<div key={q}><dt className="font-medium">{q}</dt><dd className="mt-1 text-neutral-600">{a}</dd></div>))}</dl>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold">Get approval before the extra work begins.</h2>
          <Link href="/login" className="mt-6 inline-block rounded-md bg-neutral-900 px-6 py-3 text-white">Start free</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
