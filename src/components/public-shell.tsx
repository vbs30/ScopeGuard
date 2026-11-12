import { ShieldCheck } from "lucide-react";
/** Frame for client-facing pages (/s, /c): clean document card, trust cue, no app chrome. */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <p className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500"><ShieldCheck size={16} className="text-brand-600" /> Shared securely via ScopeGuard</p>
        <main className="card !p-6 sm:!p-10">{children}</main>
        <p className="mt-6 text-center text-xs text-slate-400">This is a private link. Anyone who has it can view this document.</p>
      </div>
    </div>
  );
}