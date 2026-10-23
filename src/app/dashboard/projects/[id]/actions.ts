"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { newToken } from "@/lib/token";

const back = (id: string, q: Record<string, string>): never =>
  redirect(`/dashboard/projects/${id}?${new URLSearchParams(q).toString()}`);
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const scopeSchema = z.object({
  project_id: z.string().uuid(),
  summary: z.string().trim().min(1).max(5000),
  deliverables: z.string().max(5000), exclusions: z.string().max(5000),
  milestones: z.string().max(5000), assumptions: z.string().max(5000),
  revisions: z.coerce.number().int().min(0).max(50),
  timeline: z.string().max(200), notes: z.string().max(2000),
});

async function persistScope(fd: FormData) {
  const p = scopeSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].path.join(".") + ": " + p.error.issues[0].message } as const;
  const d = p.data;
  const sb = await supabaseServer();
  const { data: proj } = await sb.from("projects").select("price_cents").eq("id", d.project_id).single();
  if (!proj) return { error: "Project not found." } as const;
  const content = { summary: d.summary, deliverables: lines(d.deliverables), exclusions: lines(d.exclusions),
    milestones: lines(d.milestones), assumptions: lines(d.assumptions), revisions: d.revisions, timeline: d.timeline, notes: d.notes };
  const { data: latest } = await sb.from("scope_versions").select("id,version,published_at")
    .eq("project_id", d.project_id).order("version", { ascending: false }).limit(1).maybeSingle();
  if (latest && !latest.published_at) {
    const { error } = await sb.from("scope_versions").update({ content, price_cents: proj.price_cents }).eq("id", latest.id);
    return error ? ({ error: "Could not save." } as const) : ({ id: latest.id, project: d.project_id, isNew: false } as const);
  }
  const { data, error } = await sb.from("scope_versions")
    .insert({ project_id: d.project_id, version: (latest?.version ?? 0) + 1, content, price_cents: proj.price_cents })
    .select("id").single();
  return error || !data ? ({ error: "Could not save." } as const) : ({ id: data.id, project: d.project_id, isNew: true } as const);
}

export async function saveScope(fd: FormData) {
  const pid = String(fd.get("project_id"));
  const r = await persistScope(fd);
  if ("error" in r) return back(pid, { error: String(r.error) });
  revalidatePath(`/dashboard/projects/${pid}`);
  back(pid, { ok: "Draft saved." });
}

export async function publishScope(fd: FormData) {
  const pid = String(fd.get("project_id"));
  if (lines(String(fd.get("deliverables") ?? "")).length === 0) return back(pid, { error: "Add at least one deliverable before publishing." });
  const r = await persistScope(fd);
  if ("error" in r) return back(pid, { error: String(r.error) });
  const sb = await supabaseServer();
  const pub = await sb.from("scope_versions").update({ published_at: new Date().toISOString() }).eq("id", r.id);
  if (pub.error) return back(pid, { error: "Could not publish." });
  const t = newToken();
  const lk = await sb.from("public_links").insert({ token_hash: t.hash, scope_version_id: r.id });
  if (lk.error) return back(pid, { error: "Published, but the share link failed. Use 'New link'." });
  await sb.rpc("log_owner_event", { p_project: pid, p_type: "scope_published", p_scope: r.id, p_cr: null });
  back(pid, { ok: "Scope published. Copy the link now: it is shown only once.", link: `/s/${t.raw}` });
}

/** Replace the client link for the latest published scope: revokes old links, mints a new one. */
export async function replaceScopeLink(fd: FormData) {
  const pid = String(fd.get("project_id"));
  const sb = await supabaseServer();
  const { data: v } = await sb.from("scope_versions").select("id").eq("project_id", pid)
    .not("published_at", "is", null).order("version", { ascending: false }).limit(1).maybeSingle();
  if (!v) return back(pid, { error: "No published scope." });
  await sb.from("public_links").update({ revoked_at: new Date().toISOString() }).eq("scope_version_id", v.id).is("revoked_at", null);
  const t = newToken();
  await sb.from("public_links").insert({ token_hash: t.hash, scope_version_id: v.id });
  await sb.rpc("log_owner_event", { p_project: pid, p_type: "link_revoked", p_scope: v.id, p_cr: null });
  back(pid, { ok: "Old links revoked. New link (shown once):", link: `/s/${t.raw}` });
}

const crSchema = z.object({
  project_id: z.string().uuid(), title: z.string().trim().min(1).max(200), description: z.string().trim().min(1).max(5000),
  reason: z.string().max(2000), price: z.coerce.number().min(0).max(100_000_000), extra_days: z.coerce.number().int().min(0).max(3650),
});

export async function createChangeRequest(fd: FormData) {
  const pid = String(fd.get("project_id"));
  const p = crSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return back(pid, { error: p.error.issues[0].path.join(".") + ": " + p.error.issues[0].message });
  const sb = await supabaseServer();
  const { data: v } = await sb.from("scope_versions").select("id").eq("project_id", pid)
    .not("published_at", "is", null).order("version", { ascending: false }).limit(1).maybeSingle();
  if (!v) return back(pid, { error: "Publish the original scope first: changes are recorded against a published version." });
  const { data: proj } = await sb.from("projects").select("currency").eq("id", pid).single();
  const ins = await sb.from("change_requests").insert({
    project_id: pid, scope_version_id: v.id, title: p.data.title, description: p.data.description, reason: p.data.reason || null,
    extra_price_cents: Math.round(p.data.price * 100), currency: proj?.currency ?? "USD", extra_days: p.data.extra_days,
  }).select("id").single();
  if (ins.error || !ins.data) return back(pid, { error: "Could not create change request." });
  const id = ins.data.id;
  const up = await sb.from("change_requests").update({ status: "pending" }).eq("id", id);
  const t = newToken();
  const lk = await sb.from("public_links").insert({ token_hash: t.hash, change_request_id: id });
  if (up.error || lk.error) return back(pid, { error: "Created as draft, but sending failed." });
  await sb.rpc("log_owner_event", { p_project: pid, p_type: "change_request_submitted", p_scope: v.id, p_cr: id });
  back(pid, { ok: "Change request ready. Send this link to your client (shown once):", link: `/c/${t.raw}` });
}

export async function withdrawChangeRequest(fd: FormData) {
  const pid = String(fd.get("project_id"));
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success) return back(pid, { error: "Invalid request." });
  const sb = await supabaseServer();
  const { error } = await sb.from("change_requests").update({ status: "withdrawn" }).eq("id", id.data);
  if (error) return back(pid, { error: "Only pending or draft requests can be withdrawn." });
  await sb.from("public_links").update({ revoked_at: new Date().toISOString() }).eq("change_request_id", id.data).is("revoked_at", null);
  await sb.rpc("log_owner_event", { p_project: pid, p_type: "change_request_withdrawn", p_scope: null, p_cr: id.data });
  back(pid, { ok: "Change request withdrawn and its link revoked." });
}
