import Link from "next/link";
const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight text-slate-900">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#4f46e5" /><path d="M16 6l8 3v6c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V9l8-3z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" /><path d="M12.5 16l2.5 2.5 4.5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ScopeGuard
    </Link>
  );
}
export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Logo />
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium text-slate-600 sm:gap-2">
          <Link href="/#how" className="hidden rounded-lg px-3 py-2 hover:bg-slate-100 sm:block">How it works</Link>
          <Link href="/pricing" className="hidden rounded-lg px-3 py-2 hover:bg-slate-100 sm:block">Pricing</Link>
          <Link href="/resources/change-request-template" className="hidden rounded-lg px-3 py-2 hover:bg-slate-100 md:block">Free template</Link>
          <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-slate-100">Sign in</Link>
          <Link href="/login" className="btn btn-primary">Start free</Link>
        </nav>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500">
        <div className="flex items-center gap-3"><Logo /><span>© {new Date().getFullYear()}</span></div>
        <nav aria-label="Footer" className="flex gap-5">
          <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
          <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-900">Terms</Link>
          {contact && <a href={`mailto:${contact}`} className="hover:text-slate-900">Contact</a>}
        </nav>
      </div>
    </footer>
  );
}
export function Prose({ children }: { children: React.ReactNode }) {
  return <article className="mx-auto max-w-2xl px-6 py-12 [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-3 [&_p]:leading-relaxed [&_p]:text-slate-700 [&_ul]:ml-5 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:text-slate-700">{children}</article>;
}