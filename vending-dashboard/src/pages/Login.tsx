import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'github']} // optional
        theme="dark"
      />
    </div>
  );
}