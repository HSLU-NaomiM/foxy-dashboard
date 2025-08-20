// src/App.tsx
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
      {/* Runs once at the top-level */}
      <AuthListener />
      <PathTracker />

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/reset" element={<ResetPassword />} />

        {/* Protected app */}
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
          <Route path="/revenue/:year/:month" element={<RevenueMonthDetail />} />
        </Route>

        {/* Fallback */}
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
