import type { Metadata } from "next";
import { Nav, Footer, Prose } from "@/components/marketing";
export const metadata: Metadata = { title: "Privacy policy — ScopeGuard", alternates: { canonical: "/privacy" } };
export default function Page() {
  return (
    <>
      <Nav />
      <Prose>
        <h1>Privacy policy</h1>
        <p><strong>Template: this text is a starting point and must be reviewed by a qualified lawyer before launch.</strong></p>
        <h2>What we collect</h2>
        <p>Account email and password (handled by our authentication provider), the projects, scopes and change requests you create, client names and emails you enter, and basic technical logs needed to run the service.</p>
        <h2>How it is used</h2>
        <p>To provide the service: storing your documents, serving private client links, and recording decisions. We do not sell personal data.</p>
        <h2>Clients using links</h2>
        <p>When a client approves or declines a change request, we store the decision, an optional comment and a timestamp.</p>
        <h2>Deletion</h2>
        <p>You can request deletion of your account and data by contacting us. [Describe retention periods and processors here.]</p>
      </Prose>
      <Footer />
    </>
  );
}
