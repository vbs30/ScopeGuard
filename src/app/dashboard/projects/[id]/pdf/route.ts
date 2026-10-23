import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { buildPdf, type PdfData } from "@/lib/pdf/documents";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = z.object({ type: z.enum(["scope", "change"]), cr: z.string().uuid().optional() }).safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!q.success || !z.string().uuid().safeParse(id).success) return new NextResponse("Bad request", { status: 400 });

  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  const back = (m: string) => NextResponse.redirect(new URL(`/dashboard/projects/${id}?error=${encodeURIComponent(m)}`, req.url));

  // Plan gate (server-side): PDF export is a Solo feature.
  const { data: ws } = await sb.from("workspaces").select("plan").eq("owner_id", user.id).maybeSingle();
  if (ws?.plan !== "solo") return back("PDF export is part of the Solo plan.");

  const { data: project } = await sb.from("projects").select("name,client_name,currency").eq("id", id).maybeSingle();
  if (!project) return new NextResponse("Not found", { status: 404 });  // RLS hides other users' projects

  let data: PdfData;
  if (q.data.type === "scope") {
    const { data: v } = await sb.from("scope_versions").select("*").eq("project_id", id)
      .not("published_at", "is", null).order("version", { ascending: false }).limit(1).maybeSingle();
    if (!v) return back("Publish a scope first.");
    data = { kind: "scope", project: project.name, client: project.client_name, currency: project.currency, version: v.version,
      publishedAt: v.published_at, scope: { ...v.content, priceCents: Number(v.price_cents) } };
  } else {
    if (!q.data.cr) return new NextResponse("Bad request", { status: 400 });
    const { data: r } = await sb.from("change_requests").select("*, scope_versions(version)").eq("id", q.data.cr).eq("project_id", id).maybeSingle();
    if (!r) return new NextResponse("Not found", { status: 404 });
    const { data: a } = await sb.from("approvals").select("decision,decided_at,comment").eq("change_request_id", r.id).maybeSingle();
    data = { kind: "change", project: project.name, client: project.client_name, currency: r.currency, version: r.scope_versions.version,
      change: { title: r.title, description: r.description, reason: r.reason, extraPriceCents: Number(r.extra_price_cents),
        extraDays: r.extra_days, status: r.status, createdAt: r.created_at,
        decision: a ? { decision: a.decision, decidedAt: a.decided_at, comment: a.comment } : null } };
  }
  const buf = await renderToBuffer(buildPdf(data));
  return new NextResponse(new Uint8Array(buf), { headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="scopeguard-${q.data.type}.pdf"`, "Cache-Control": "private, no-store" } });
}
