"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const schema = z.object({
  name: z.string().trim().min(1).max(160),
  client_name: z.string().trim().min(1).max(160),
  client_email: z.string().trim().email().or(z.literal("")),
  price: z.coerce.number().min(0).max(100_000_000),
  currency: z.string().length(3).toUpperCase(),
});
const fail = (m: string): never => redirect(`/dashboard?error=${encodeURIComponent(m)}`);

export async function createProject(fd: FormData) {
  const p = schema.safeParse(Object.fromEntries(fd));
  if (!p.success) return fail("Please check the form: " + p.error.issues[0].message);
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return redirect("/login");

  let { data: ws } = await sb.from("workspaces").select("id").eq("owner_id", user.id).maybeSingle();
  if (!ws) {
    const ins = await sb.from("workspaces").insert({ owner_id: user.id, name: "My workspace" }).select("id").single();
    if (ins.error) return fail("Could not create workspace.");
    ws = ins.data;
  }
  const { error } = await sb.from("projects").insert({
    workspace_id: ws!.id, name: p.data.name, client_name: p.data.client_name,
    client_email: p.data.client_email || null, price_cents: Math.round(p.data.price * 100), currency: p.data.currency,
  });
  if (error) return fail(error.message.includes("free_plan_project_limit")
    ? "Free plan allows one active project. Archive it or upgrade to add another." : "Could not create project.");
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function archiveProject(fd: FormData) {
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success) return fail("Invalid project.");
  const sb = await supabaseServer();
  await sb.from("projects").update({ status: "archived" }).eq("id", id.data);  // RLS limits this to the owner's rows
  revalidatePath("/dashboard");
}
