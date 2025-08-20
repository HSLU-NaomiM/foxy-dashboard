// src/pages/Login.tsx
// File Summary:
// The Login page provides the entry point for user authentication via Supabase.
// It uses the `@supabase/auth-ui-react` package for a prebuilt login form, styled with custom Tailwind classes.
// If the user is already authenticated, they are redirected to the dashboard.
//
// Key responsibilities:
// - Redirect authenticated users directly to the dashboard (avoiding redundant login).
// - Render Supabase Auth UI with custom branding, colors, and fonts.
// - Direct password recovery requests to `/auth/reset`.
// - Provide i18n support for the login heading.
//
// Dependencies:
// - supabase-js: client used for session checks and authentication.
// - @supabase/auth-ui-react: prebuilt authentication UI component.
// - @supabase/auth-ui-shared: provides the ThemeSupa theme configuration.
// - react-router-dom: navigation after successful authentication.
// - i18next: translation for the login title.
//
// Folder structure notes:
// - Located under `src/pages/`, where each file represents a top-level route.
// - Authentication-related pages (Login, ResetPassword, etc.) live under `src/pages/auth/` or `src/pages/`.
//
// Security notes:
// - Authentication and session handling are delegated to Supabase.
// - Row Level Security (RLS) policies in Supabase determine what data authenticated users can access post-login.
// - This component only handles the login flow; it does not manage authorization for specific resources.

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    // If a session already exists, skip login and go straight to dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-primary">
          {t("login.loginButton", "Login")}
        </h1>

        {/* Supabase Auth UI with custom styling */}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#e69138",
                  brandAccent: "#e69138",
                },
                fonts: {
                  bodyFontFamily: "Inter, sans-serif",
                  buttonFontFamily: "Inter, sans-serif",
                },
              },
            },
            className: {
              input: "bg-zinc-100 border border-zinc-300 focus:ring-primary",
              button: "bg-primary hover:bg-primary/90 text-white",
              label: "text-zinc-700 text-sm font-medium",
            },
          }}
          theme="default"
          providers={[]} // No third-party providers enabled
          redirectTo={`${origin}/auth/reset`} // Where password reset links should land
          view="sign_in"
        />
      </div>
    </div>
  );
}
