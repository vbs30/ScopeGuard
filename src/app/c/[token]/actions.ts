"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabasePublic } from "@/lib/supabase/public";
import { sendEmail, mailDecisionToOwner, siteUrl } from "@/lib/email";

export async function decide(fd: FormData) {
  const token = String(fd.get("token") ?? "");
  const p = z.object({ decision: z.enum(["approved", "rejected"]), comment: z.string().max(2000) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return redirect(`/c/${token}?msg=invalid`);
  const sb = supabasePublic();
  const { error } = await sb.rpc("public_decide", { raw_token: token, p_decision: p.data.decision, p_comment: p.data.comment });
  if (error) return redirect(`/c/${token}?msg=${error.message.includes("not_pending") ? "already" : "failed"}`);

  // Best-effort owner notification; a failure here never affects the recorded decision.
  try {
    const { data: ctx } = await sb.rpc("public_decision_context", { raw_token: token });
    if (ctx?.owner_email) {
      await sendEmail(mailDecisionToOwner(ctx.owner_email, ctx.project, ctx.client, ctx.title, ctx.status, ctx.comment,
        `${siteUrl()}/dashboard/projects/${ctx.project_id}`));
    }
  } catch { /* ignore */ }
  redirect(`/c/${token}?msg=${p.data.decision}`);
}