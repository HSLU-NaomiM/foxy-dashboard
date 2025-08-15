// src/components/AuthListener.ts

import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    console.log("AUTH CHANGE:", event, session);
    
    if (event === "SIGNED_IN") {
      navigate("/dashboard");
    }

    if (event === "SIGNED_OUT") {
      navigate("/login");
    }
  });

  return () => subscription.unsubscribe();
}, [navigate]);

  return null;
}

export default AuthListener;
