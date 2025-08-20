// src/pages/auth/ResetPassword.tsx
// File Summary:
// This page allows a user who arrived via a Supabase password recovery link to set a new password.
// It removes sensitive tokens from the URL (already consumed by the Supabase SDK), verifies readiness
// by checking for an auto-created session, and then updates the password via `supabase.auth.updateUser`.
//
// Key responsibilities:
// - Clean up the URL after the SDK consumes recovery tokens (avoid persisting tokens in history).
// - Wait until Supabase session is ready before showing the reset form.
// - Update the user's password and show success/error feedback.
// - Provide basic client-side validation (min length) and disable UI while submitting.
//
// Dependencies:
// - supabase-js: uses `auth.getSession()` to verify readiness and `auth.updateUser()` to change the password.
// - React: local component state and effects for UX flow.
//
// Folder structure notes:
// - Located under `src/pages/auth/`, which contains authentication-related pages (login, reset password, etc.).
// - Supabase client is centralized in `src/lib/supabaseClient.ts`.
//
// Security notes:
// - The recovery tokens are handled by the Supabase SDK; this component replaces the URL state to avoid
//   keeping tokens in browser history.
// - Actual authorization and policy enforcement are handled server-side by Supabase; the client only
//   invokes `updateUser` for the currently authenticated (recovered) session.
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  // --- Local state ---
  const [ready, setReady] = useState(false);          // Whether Supabase session is ready
  const [pw, setPw] = useState("");                   // New password input
  const [loading, setLoading] = useState(false);      // Submission in progress
  const [msg, setMsg] = useState<string | null>(null); // Success message
  const [err, setErr] = useState<string | null>(null); // Error message

  // On mount: clean URL + check Supabase session
  useEffect(() => {
    try {
      // Remove recovery tokens from the URL (already consumed by SDK)
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState({}, "", cleanUrl);
    } catch {
      // Ignore errors if replaceState is unavailable
    }

    // Supabase auto-authenticates user on valid recovery link
    supabase.auth.getSession().then(() => setReady(true));
  }, []);

  // Handle password update
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      setMsg("Password updated. You can continue to the app.");
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // While waiting for Supabase session
  if (!ready) return <p>Preparing password reset…</p>;

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold mb-4">Set a new password</h1>

      {/* Reset form */}
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

      {/* Feedback */}
      {msg && <p className="mt-3 text-green-600">{msg}</p>}
      {err && <p className="mt-3 text-red-600">{err}</p>}
    </div>
  );
}
