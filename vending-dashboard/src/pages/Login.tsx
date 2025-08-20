// src/pages/Login.tsx
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-primary">{t('login.loginButton', 'Login')}</h1>
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
          providers={[]}
          redirectTo={`${origin}/auth/reset`}
          view="sign_in"
        />
      </div>
    </div>
  );
}

