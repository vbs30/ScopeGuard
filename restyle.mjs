// Run once from the project root:  node restyle.mjs
// Restyles existing pages to the new design system (idempotent; safe to re-run).
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const norm = (p) => p.replaceAll("\\", "/");
const skip = /src\/app\/(page|layout)\.tsx$|marketing\.tsx$|public-shell\.tsx$|dashboard\/layout\.tsx$/;
const rules = [
  [/rounded-md bg-neutral-900 px-\d py-\d text-white( disabled:opacity-50)?/g, "btn btn-primary"],
  [/rounded-md bg-red-600 px-4 py-2 text-white/g, "btn btn-danger"],
  [/rounded-md border px-[45] py-2/g, "btn btn-secondary"],
  [/rounded-md border px-3 py-2/g, "input"],
  [/rounded-lg border border-red-200 p-4/g, "card !border-red-200 !p-4"],
  [/rounded-lg border p-(\d)/g, "card !p-$1"],
  [/rounded-xl border p-\d/g, "card"],
  [/neutral-/g, "slate-"],
];
const changed = [];
for (const file of walk("src").filter((f) => /\.tsx$/.test(f))) {
  const f = norm(file); if (skip.test(f)) continue;
  const before = readFileSync(file, "utf8"); let s = before;
  for (const [re, to] of rules) s = s.replace(re, to);
  if (f.endsWith("app/dashboard/page.tsx")) s = s.replace(/<header className="mb-8[\s\S]*?<\/header>/, '<h1 className="mb-6 text-2xl font-bold">Projects</h1>');
  if (f.endsWith("app/login/page.tsx") && !s.includes("card !p-7")) {
    s = s.replace('<main className="mx-auto max-w-sm px-6 py-24">', '<main className="mx-auto max-w-sm px-6 py-16"><a href="/" className="mb-6 block text-center text-lg font-semibold">ScopeGuard</a><div className="card !p-7">');
    s = s.replace(/<\/main>(\s*\);\s*\}\s*)$/, "</div></main>$1");
  }
  if ((f.endsWith("app/s/[token]/page.tsx") || f.endsWith("app/c/[token]/page.tsx")) && !s.includes("PublicShell")) {
    s = s.replace('<main className="mx-auto max-w-2xl px-6 py-12">', "<PublicShell>").replace("</main>", "</PublicShell>");
    s = s.replace(/^(import .*\n)/m, '$1import PublicShell from "@/components/public-shell";\n');
  }
  if (f.endsWith("projects/[id]/page.tsx")) {
    s = s.replace("<b>{r.status}</b>", '<span className={`badge ${({ approved: "bg-emerald-50 text-emerald-700", rejected: "bg-red-50 text-red-700", pending: "bg-amber-50 text-amber-700" } as Record<string, string>)[r.status] ?? "bg-slate-100 text-slate-600"}`}>{r.status}</span>');
  }
  if (s !== before) { writeFileSync(file, s); changed.push(f); }
}
console.log("Updated:\n" + changed.join("\n"));
