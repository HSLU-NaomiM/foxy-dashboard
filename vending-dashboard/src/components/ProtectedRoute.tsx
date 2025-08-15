// src/components/ProtectedRoute.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setIsAuthed(true);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Lade...</div>;
  return isAuthed ? <>{children}</> : null;
  
}
