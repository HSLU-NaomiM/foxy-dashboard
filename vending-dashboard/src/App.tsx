// src/App.tsx
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AuthListener from "@/components/AuthListener";
import MachineDetails from "@/pages/MachineDetails";
import MachineHistory from "@/pages/MachineHistory";
import Monitoring from "@/pages/Monitoring";
import Layout from "@/components/Layout";
import Revenue from "@/pages/revenue";
import Upload from "@/pages/Upload";



function App() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AUTH CHANGE:", event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <AuthListener />
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Alles innerhalb dieses Layouts bekommt die NavBar usw. */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/machine/:machine_id" element={<MachineDetails />} />
          <Route path="/machine/:id/history" element={<MachineHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
