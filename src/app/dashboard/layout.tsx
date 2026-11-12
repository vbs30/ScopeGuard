import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { Logo } from "@/components/marketing";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Logo href="/dashboard" />
            <nav className="flex gap-1 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="rounded-lg px-3 py-1.5 hover:bg-slate-100">Projects</Link>
              <Link href="/dashboard/settings" className="rounded-lg px-3 py-1.5 hover:bg-slate-100">Settings</Link>
            </nav>
          </div>
          <form action="/auth/signout" method="post" className="flex items-center gap-3 text-sm text-slate-500">
            <span className="hidden max-w-40 truncate sm:inline">{user?.email}</span>
            <button className="btn btn-secondary !px-3 !py-1.5">Sign out</button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}