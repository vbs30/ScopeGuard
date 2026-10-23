"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { supabasePublic } from "@/lib/supabase/public";

export async function decide(fd: FormData) {
  const token = String(fd.get("token") ?? "");
  const p = z.object({ decision: z.enum(["approved", "rejected"]), comment: z.string().max(2000) }).safeParse(Object.fromEntries(fd));
  if (!p.success) return redirect(`/c/${token}?msg=invalid`);
  const { error } = await supabasePublic().rpc("public_decide", { raw_token: token, p_decision: p.data.decision, p_comment: p.data.comment });
  if (error) return redirect(`/c/${token}?msg=${error.message.includes("not_pending") ? "already" : "failed"}`);
  redirect(`/c/${token}?msg=${p.data.decision}`);
}
