import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { renameWorkspace, changePassword, deleteAccount } from "./actions";

export const metadata = { robots: { index: false } };
const inp = "w-full rounded-md border px-3 py-2";

export default async function Settings({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string }> }) {
  const q = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: ws } = await sb.from("workspaces").select("name,plan").eq("owner_id", user.id).maybeSingle();

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <a href="/dashboard" className="text-sm text-neutral-600">← Projects</a>
      <h1 className="mb-6 mt-2 text-2xl font-semibold">Account settings</h1>
      {q.error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{q.error}</p>}
      {q.ok && <p role="status" className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{q.ok}</p>}

      <section className="mb-8">
        <h2 className="font-semibold">Account</h2>
        <p className="text-sm text-neutral-600">Signed in as {user.email} · Plan: {ws?.plan ?? "free"}</p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 font-semibold">Workspace name</h2>
        {ws ? (
          <form action={renameWorkspace} className="flex gap-2">
            <input name="name" required maxLength={120} defaultValue={ws.name} className={inp} aria-label="Workspace name" />
            <button className="rounded-md border px-4 py-2">Save</button>
          </form>
        ) : <p className="text-sm text-neutral-500">Your workspace is created when you add your first project.</p>}
      </section>

      <section className="mb-8">
        <h2 className="mb-2 font-semibold">Change password</h2>
        <form action={changePassword} className="grid gap-2">
          <input name="password" type="password" required minLength={8} placeholder="New password (8+ characters)" className={inp} autoComplete="new-password" />
          <input name="confirm" type="password" required minLength={8} placeholder="Repeat new password" className={inp} autoComplete="new-password" />
          <button className="w-fit rounded-md border px-4 py-2">Update password</button>
        </form>
      </section>

      <section className="rounded-lg border border-red-200 p-4">
        <h2 className="font-semibold text-red-700">Delete account</h2>
        <p className="mt-1 text-sm text-neutral-700">This permanently deletes your account and everything in it: projects, scopes and all versions, change requests, client decisions, activity history and every client link. Links you already sent will stop working. This cannot be undone. PDFs you already downloaded are not affected.</p>
        <form action={deleteAccount} className="mt-3 grid gap-2">
          <input name="confirm" required autoComplete="off" placeholder="Type DELETE to confirm" className={inp} aria-label="Type DELETE to confirm" />
          <button className="w-fit rounded-md bg-red-600 px-4 py-2 text-white">Delete my account permanently</button>
        </form>
      </section>
    </main>
  );
}