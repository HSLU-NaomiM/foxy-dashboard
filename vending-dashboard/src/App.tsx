// src/App.tsx
/*
File Summary:
Main application entry point for routing.  
Defines all available routes and enforces authentication via `ProtectedRoute`.

Key responsibilities:
- Sets up React Router (`BrowserRouter`, `Routes`, `Route`).
- Public routes: `/login`, `/auth/reset`.
- Protected routes (require login): `/dashboard`, `/monitoring`, `/revenue`, `/upload`, machine details & history, revenue details.
- Wraps protected routes in `Layout` and `ProtectedRoute`.
- Includes global listeners: 
  - `AuthListener` to sync Supabase auth state.
  - `PathTracker` to persist last visited path in localStorage.
- Fallback: redirects unknown paths to last visited path (or `/dashboard`).

How it's used:
- Imported in `main.tsx` and rendered as the root `<App />`.
- Central definition for navigation across the entire dashboard.

Security notes:
- All sensitive routes are wrapped in `ProtectedRoute`, which blocks unauthenticated users.
- Fallback uses `localStorage.getItem("lastPath")` for redirect — ensure no injection risk (string only).
- Auth state synced via Supabase in `AuthListener`, so user sessions are enforced consistently.
*/

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
import MachineHistory from "@/pages/MachineHistory_new";
// import MachineHistory from "@/pages/MachineHistory";
import Monitoring from "@/pages/Monitoring";
import Layout from "@/components/Layout";
import Revenue from "@/pages/revenue";
import Upload from "@/pages/Upload";
import PathTracker from "@/components/PathTracker";
import RevenueMonthDetail from "@/pages/revenue-month-detail";
// import LanguageSwitcher from './components/LanguageSwitcher';
import ResetPassword from "@/pages/auth/ResetPassword";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {/* Top-level listeners */}
      <AuthListener /> {/* Syncs Supabase auth state with React context */}
      <PathTracker />  {/* Tracks and stores last visited path in localStorage */}

      <Routes>
        {/* Public routes (no auth required) */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/reset" element={<ResetPassword />} />

        {/* Protected application routes (auth required) */}
        <Route
          element={
            <ProtectedRoute>
              <Layout /> {/* Provides shared navigation/layout for all protected routes */}
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/machine/:machine_id" element={<MachineDetails />} />
          <Route path="/machine/:id/history" element={<MachineHistory />} />
          <Route path="/revenue/:year/:month" element={<RevenueMonthDetail />} />
        </Route>

        {/* Fallback route for any undefined path */}
        <Route
          path="*"
          element={
            <Navigate
              to={localStorage.getItem("lastPath") || "/dashboard"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
