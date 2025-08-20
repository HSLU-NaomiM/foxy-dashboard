// src/pages/auth/ResetPassword.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Clean the URL so tokens are not kept in the history bar
    // (The SDK already consumed them.)
    try {
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, "", cleanUrl);
    } catch {}

    // Check if we already have a session (Supabase auto-signs in on recovery link)
    supabase.auth.getSession().then(() => setReady(true));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      // ⚠️ User is already authenticated via the recovery link at this point.
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setMsg("Password updated. You can continue to the app.");
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return <p>Preparing password reset…</p>;

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">Set a new password</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full rounded-lg border p-2"
          type="password"
          placeholder="New password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          minLength={8}
        />
        <button
          className="w-full rounded-xl border p-2 disabled:opacity-50"
          disabled={loading || pw.length < 8}
        >
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
      {msg && <p className="mt-3 text-green-600">{msg}</p>}
      {err && <p className="mt-3 text-red-600">{err}</p>}
    </div>
  );
}
