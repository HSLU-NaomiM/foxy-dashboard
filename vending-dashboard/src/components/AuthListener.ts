// src/components/AuthListener.ts
// File Summary:
// AuthListener listens for authentication state changes from Supabase.
// It redirects users to the correct route after signing in (→ dashboard)
// or signing out (→ login). It renders no UI.
//
// Key responsibilities:
// - Subscribe to Supabase auth state changes on mount.
// - Redirect based on the auth event type.
// - Clean up the subscription on unmount.
//
// Dependencies:
// - supabase-js: listens to authentication state changes.
// - react-router-dom: navigate hook for redirection.
// - React: useEffect for lifecycle management.

import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to authentication state changes from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // Redirect to dashboard after login
        navigate("/dashboard");
      }
      if (event === "SIGNED_OUT") {
        // Redirect to login after logout
        navigate("/login");
      }
    });

    // Cleanup subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Component does not render UI
  return null;
}

export default AuthListener;
