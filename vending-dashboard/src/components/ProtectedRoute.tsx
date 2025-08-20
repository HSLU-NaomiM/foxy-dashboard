// src/components/ProtectedRoute.tsx
// File Summary:
// The ProtectedRoute component ensures only authenticated users can access certain routes.
// It verifies the Supabase session on mount and redirects unauthenticated users to the login page.
// While authentication is being verified, it renders a loading message.
//
// Key responsibilities:
// - Fetch the current Supabase session.
// - Redirect to "/login" if no session is found.
// - Render wrapped children only for authenticated users.
// - Provide a temporary loading indicator during session check.
//
// Dependencies:
// - supabase-js: retrieves the current authentication session.
// - react-router-dom: navigate hook for redirection.
// - React state & effect hooks: manage loading and authentication state.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

// ProtectedRoute component
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);     // Session check in progress
  const [isAuthed, setIsAuthed] = useState(false);  // Authenticated flag
  const navigate = useNavigate();

  useEffect(() => {
    // Run once on mount: check Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Redirect if not authenticated
        navigate("/login");
      } else {
        setIsAuthed(true);
      }
      setLoading(false);
    });
  }, [navigate]);

  // Show interim loading message
  if (loading) return <div>Loading...</div>;

  // Render children if authenticated
  return isAuthed ? <>{children}</> : null;
}
