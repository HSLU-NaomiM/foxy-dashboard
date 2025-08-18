// src/components/Layout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Icon } from "lucide-react";
import { foxFaceTail } from "@lucide/lab";
import { useTranslation } from "react-i18next";

export default function Layout() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const logout = async () => {
    localStorage.removeItem("lastPath");
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
        <NavLink to="/dashboard" className="flex items-center gap-2 hover:opacity-80">
          <Icon iconNode={foxFaceTail} className="w-10 h-10 text-zinc-800 dark:text-zinc-100" />
          <h1 className="text-xl font-bold">Foxy Dashboard</h1>
        </NavLink>

        <nav className="flex gap-4">
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          <NavLink to="/monitoring" className={linkClass}>Monitoring</NavLink>
          <NavLink to="/revenue" className={linkClass}>Revenue</NavLink>
          <NavLink to="/upload" className={linkClass}>Upload</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          <select
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
            className="text-sm px-2 py-1 rounded-md border border-gray-300 bg-gray-50"
          >
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
          <button
            onClick={logout}
            className="text-sm px-4 py-2 rounded-md font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-screen-2xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
