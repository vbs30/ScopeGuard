import "./globals.css";
import type { Metadata } from "next";
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "ScopeGuard — Stop scope creep",
  description: "Define the work, document every change, and get client approval before extra work begins.",
  alternates: { canonical: "/" },
  openGraph: { title: "ScopeGuard — Stop scope creep", description: "Define the work, document every change, and get client approval before extra work begins.", type: "website", siteName: "ScopeGuard" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="min-h-screen bg-white text-neutral-900 antialiased">{children}</body></html>);
}
