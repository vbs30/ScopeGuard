"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const sb = supabaseBrowser();
    if (mode === "in") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message); else { router.push("/dashboard"); router.refresh(); }
    } else {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else if (data.session) { router.push("/dashboard"); router.refresh(); }
      else setMsg("Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  }
  async function reset() {
    if (!email) return setMsg("Enter your email first.");
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email);
    setMsg(error ? error.message : "If that email exists, a reset link is on its way.");
  }
  return (
    <main className="mx-auto max-w-sm px-6 py-24">
      <h1 className="mb-6 text-2xl font-semibold">{mode === "in" ? "Sign in" : "Create your account"}</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input className="rounded-md border px-3 py-2" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="rounded-md border px-3 py-2" type="password" required minLength={8} placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button disabled={busy} className="rounded-md bg-neutral-900 px-4 py-2 text-white disabled:opacity-50">{mode === "in" ? "Sign in" : "Sign up"}</button>
      </form>
      {msg && <p className="mt-3 text-sm text-neutral-700" role="status">{msg}</p>}
      <div className="mt-6 flex justify-between text-sm text-neutral-600">
        <button onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Need an account? Sign up" : "Have an account? Sign in"}</button>
        {mode === "in" && <button onClick={reset}>Forgot password?</button>}
      </div>
    </main>
  );
}
