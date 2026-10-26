"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const to = (q: Record<string, string>): never => redirect(`/dashboard/settings?${new URLSearchParams(q).toString()}`);

export async function renameWorkspace(fd: FormData) {
  const p = z.object({ name: z.string().trim().min(1).max(120) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return to({ error: "Workspace name must be 1–120 characters." });
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return redirect("/login");
  const { error } = await sb.from("workspaces").update({ name: p.data.name }).eq("owner_id", user.id);
  to(error ? { error: "Could not save." } : { ok: "Workspace name saved." });
}

export async function changePassword(fd: FormData) {
  const p = z.object({ password: z.string().min(8).max(200), confirm: z.string() })
    .refine((v) => v.password === v.confirm, { message: "Passwords do not match." }).safeParse(Object.fromEntries(fd));
  if (!p.success) return to({ error: p.error.issues[0].message });
  const sb = await supabaseServer();
  const { error } = await sb.auth.updateUser({ password: p.data.password });
  to(error ? { error: error.message } : { ok: "Password updated." });
}

export async function deleteAccount(fd: FormData) {
  const p = z.object({ confirm: z.literal("DELETE") }).safeParse(Object.fromEntries(fd));
  if (!p.success) return to({ error: 'Type DELETE (capitals) to confirm.' });
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return redirect("/login");
  const { error } = await sb.rpc("delete_my_account");
  if (error) return to({ error: "Could not delete the account. Nothing was changed; please try again." });
  try { await sb.auth.signOut(); } catch { /* user no longer exists; cookies are cleared below */ }
  redirect("/?account=deleted");
}