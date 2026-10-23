import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { createProject, archiveProject } from "./actions";
import Metrics from "./metrics";

export const metadata = { robots: { index: false } };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: projects } = await sb.from("projects")
    .select("id,name,client_name,price_cents,currency,status,created_at").order("created_at", { ascending: false });

  const active = (projects ?? []).filter((p) => p.status === "active");
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <form action="/auth/signout" method="post"><button className="text-sm text-neutral-600">Sign out ({user.email})</button></form>
      </header>
      <Metrics />
      {error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <form action={createProject} className="mb-10 grid grid-cols-2 gap-3 rounded-lg border p-4">
        <input name="name" required placeholder="Project name" className="col-span-2 rounded-md border px-3 py-2" />
        <input name="client_name" required placeholder="Client name" className="rounded-md border px-3 py-2" />
        <input name="client_email" type="email" placeholder="Client email (optional)" className="rounded-md border px-3 py-2" />
        <input name="price" type="number" step="0.01" min="0" required placeholder="Agreed price" className="rounded-md border px-3 py-2" />
        <input name="currency" required maxLength={3} defaultValue="USD" className="rounded-md border px-3 py-2 uppercase" />
        <button className="col-span-2 rounded-md bg-neutral-900 px-4 py-2 text-white">Create project</button>
      </form>
      {active.length === 0 && <p className="text-neutral-500">No active projects yet. Create your first one above.</p>}
      <ul className="flex flex-col gap-3">
        {(projects ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium"><a href={`/dashboard/projects/${p.id}`} className="underline">{p.name}</a> {p.status === "archived" && <span className="text-xs text-neutral-500">(archived)</span>}</p>
              <p className="text-sm text-neutral-600">{p.client_name} · {(p.price_cents / 100).toLocaleString()} {p.currency}</p>
            </div>
            {p.status === "active" && (
              <form action={archiveProject}><input type="hidden" name="id" value={p.id} /><button className="text-sm text-neutral-600">Archive</button></form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
