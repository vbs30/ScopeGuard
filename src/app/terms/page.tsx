import type { Metadata } from "next";
import { Nav, Footer, Prose } from "@/components/marketing";
export const metadata: Metadata = { title: "Terms of service — ScopeGuard", alternates: { canonical: "/terms" } };
export default function Page() {
  return (
    <>
      <Nav />
      <Prose>
        <h1>Terms of service</h1>
        <p><strong>Template: this text is a starting point and must be reviewed by a qualified lawyer before launch.</strong></p>
        <h2>The service</h2>
        <p>ScopeGuard helps you document project scope, propose changes and record client decisions. It does not guarantee payment, prevent disputes or provide legally certified electronic signatures.</p>
        <h2>Your responsibilities</h2>
        <p>You are responsible for the accuracy of the documents you create and for your own contracts with clients.</p>
        <h2>Plans and billing</h2>
        <p>Free and Solo plan limits are described on the pricing page. [Add billing, refund and cancellation terms once billing is enabled.]</p>
        <h2>Liability</h2>
        <p>[Add limitation of liability and governing law after legal review.]</p>
      </Prose>
      <Footer />
    </>
  );
}
