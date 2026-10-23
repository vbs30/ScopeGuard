import Link from "next/link";
import type { Metadata } from "next";
import { Nav, Footer } from "@/components/marketing";
export const metadata: Metadata = { title: "Pricing — ScopeGuard", description: "Free for one active project. Solo is $19/month for multiple projects, version history and PDF export.", alternates: { canonical: "/pricing" } };

const free = ["1 active project", "Publish a scope and share a private client link", "Create change requests and record client decisions", "Activity history"];
const solo = ["Multiple active projects", "Scope version history", "PDF export of scopes and change requests", "Email notifications (coming soon)", "Client-facing document branding (coming soon)"];
const List = ({ a }: { a: string[] }) => <ul className="mt-4 grid gap-2 text-sm text-neutral-700">{a.map((x) => <li key={x}>• {x}</li>)}</ul>;

export default function Pricing() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Simple pricing</h1>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl border p-6"><h2 className="font-semibold">Free</h2><p className="text-3xl font-semibold">$0</p><List a={free} />
            <Link href="/login" className="mt-6 inline-block rounded-md bg-neutral-900 px-5 py-2 text-white">Start free</Link></section>
          <section className="rounded-xl border p-6"><h2 className="font-semibold">Solo</h2><p className="text-3xl font-semibold">$19<span className="text-base font-normal text-neutral-500">/month</span></p><List a={solo} />
            <p className="mt-6 text-sm text-neutral-600">Online billing is not open yet. Start on Free; early users can be moved to Solo manually.</p></section>
        </div>
      </main>
      <Footer />
    </>
  );
}
