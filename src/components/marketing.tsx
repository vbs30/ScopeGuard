import Link from "next/link";
const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Nav() {
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-5">
      <Link href="/" className="font-semibold tracking-tight">ScopeGuard</Link>
      <nav aria-label="Main" className="flex flex-wrap items-center gap-5 text-sm text-neutral-600">
        <Link href="/#how">How it works</Link><Link href="/pricing">Pricing</Link>
        <Link href="/resources/change-request-template">Free template</Link><Link href="/login">Sign in</Link>
        <Link href="/login" className="rounded-md bg-neutral-900 px-4 py-2 text-white">Start free</Link>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="mx-auto mt-24 flex max-w-5xl flex-wrap justify-between gap-4 border-t px-6 py-8 text-sm text-neutral-500">
      <p>© {new Date().getFullYear()} ScopeGuard</p>
      <nav aria-label="Footer" className="flex gap-5">
        <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
        {contact && <a href={`mailto:${contact}`}>Contact</a>}
      </nav>
    </footer>
  );
}
export function Prose({ children }: { children: React.ReactNode }) {
  return <article className="mx-auto max-w-2xl px-6 py-10 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-3 [&_p]:text-neutral-700 [&_ul]:ml-5 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:text-neutral-700">{children}</article>;
}
