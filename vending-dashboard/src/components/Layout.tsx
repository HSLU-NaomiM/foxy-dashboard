// src/components/Layout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Icon } from "lucide-react";
import { foxFaceTail } from "@lucide/lab";

export default function Layout() {
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm px-3 py-2 rounded-md font-medium ${
      isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 font-inter text-zinc-900 dark:text-zinc-100">
      <header className="border-b bg-white dark:bg-zinc-800 px-6 py-4 shadow-sm flex justify-between items-center">
        <Icon iconNode={foxFaceTail} className="w-10 h-10 text-zinc-800 dark:text-zinc-100" />
        <h1 className="text-xl font-bold">Vending Machine Dashboard</h1>
        <nav className="flex gap-4">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/monitoring" className={linkClass}>Monitoring</NavLink>
          <NavLink to="/revenue" className={linkClass}>Revenue</NavLink>
          <NavLink to="/upload" className={linkClass}>Upload</NavLink>
        </nav>
        <button onClick={logout} className="text-sm text-red-600 hover:underline">
          Logout
        </button>
      </header>

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
