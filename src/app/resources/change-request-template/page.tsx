import type { Metadata } from "next";
import Link from "next/link";
import { Nav, Footer, Prose } from "@/components/marketing";
export const metadata: Metadata = {
  title: "Client change request template for web projects — ScopeGuard",
  description: "A free change request template and a simple way to price extra website work so scope creep does not eat your margin.",
  alternates: { canonical: "/resources/change-request-template" },
};
const template = `CHANGE REQUEST
Project: [project name]            Client: [client name]
Date: [date]                       Based on scope version: [v1 / date agreed]

1. What is being requested
[Describe the extra work in plain language.]

2. Why this is outside the agreed scope
[Quote or reference the deliverable list / exclusions / revision limit.]

3. Additional deliverables
- [item]
- [item]

4. Cost and timeline
Additional price: [amount + currency]   (basis: [hours x rate / fixed])
Added time: [n days]   New delivery date: [date]

5. Decision
Work on this change starts only after written approval.
[ ] Approved   [ ] Declined      Date: [date]   Comment: [optional]`;

export default function Page() {
  return (
    <>
      <Nav />
      <Prose>
        <h1>Client change request template</h1>
        <p>Scope creep usually starts with a friendly &ldquo;could you also...&rdquo;. A short written change request keeps things friendly: the client sees the cost and the timeline before you start, and you both have a record.</p>
        <h2>The template</h2>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border bg-neutral-50 p-4 text-sm">{template}</pre>
        <h2>How to price extra work</h2>
        <ul>
          <li>Check the original scope first: is it an exclusion, or beyond the included revision rounds? If it is in scope, it is not a change request.</li>
          <li>Price from the work, not the relationship: estimated hours times your rate, plus a buffer for review and testing, or a fixed price if the task is well defined.</li>
          <li>State the schedule impact. Extra work often moves the delivery date, and clients should hear that up front.</li>
          <li>Wait for a written yes before you start. A reply to the request is enough; &ldquo;sure, go ahead&rdquo; in a chat is easy to lose.</li>
        </ul>
        <h2>Included revisions versus new work</h2>
        <p>Define a revision round in your scope (for example: one consolidated round of feedback on each milestone). Changes to approved content or new features after that point become change requests.</p>
        <p>This template is general information, not legal advice. Have a lawyer review your contract terms.</p>
        <p><Link href="/login" className="underline">Try ScopeGuard free</Link> to send change requests with a private approval link instead of copying this by hand.</p>
      </Prose>
      <Footer />
    </>
  );
}
