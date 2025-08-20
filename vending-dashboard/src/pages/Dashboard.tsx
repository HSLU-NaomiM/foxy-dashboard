// src/pages/Dashboard.tsx
// File Summary:
// The Dashboard page serves as the main landing view for authenticated users.
// It displays an overview of vending machines (including revenue) and current active alerts,
// pulling data from the Supabase view `machines_with_latest_alert` and updating in real time.
//
// Key responsibilities:
// - Fetch machines and their latest alert status from Supabase.
// - Fetch active alerts for display in a dedicated table.
// - Normalize and map raw Supabase rows into strongly typed data structures for UI components.
// - Subscribe to Postgres changes (machines + machine_alerts_log) for live updates.
// - Handle loading and error states gracefully.
// - Render two main cards: Machines list (with revenues) and Active alerts.
//
// Dependencies:
// - supabase-js: querying views and listening to Postgres changes.
// - shadcn/ui: Card, CardContent, CardHeader, CardTitle, CardDescription components for layout.
// - Local components: VendingMachinesTable, AlertsTable.
// - i18next: translations for labels, titles, and messages.
// - lucide-react / @lucide/lab: dashboard branding icon.
//
// Folder structure notes:
// - Located in `src/pages/`, where each file represents a top-level route.
// - This page relies on data types defined in `src/types/database` for type safety.
//
// Security notes:
// - Queries depend on Supabase RLS policies:  
//   • View `machines_with_latest_alert`: SELECT must be allowed for authenticated users.  
//   • Table `machines`: SELECT allowed for authenticated users (updates restricted to admins).  
//   • Table `machine_alerts_log`: SELECT allowed for authenticated users; INSERT/UPDATE restricted to system processes.  
// - Real-time subscriptions also obey RLS. Clients only receive events for rows they are permitted to access.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { VendingMachinesTable } from "@/components/VendingMachinesTable";
import { AlertsTable } from "@/components/AlertsTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MachineWithStatus, AlertWithMachine } from "@/types/database";
import { Icon } from "lucide-react";
import { foxFaceTail } from "@lucide/lab";
import { useTranslation } from "react-i18next";

// Raw row type for Supabase view `machines_with_latest_alert`
type MachinesWithLatestAlertRow = {
  machine_id: string;
  machine_name: string | null;
  machine_location: string | null;
  machine_revenue: number | null;
  currency: string | null;
  machine_alert_id: string | null;
  alert_id: number | null;
  alert_name: string | null;
  alert_severity: "error" | "warning" | "offline" | "ok" | null;
  start_time: string | null;
};

// Convert raw machine rows into typed MachineWithStatus objects
function parseMachines(data: MachinesWithLatestAlertRow[]): MachineWithStatus[] {
  return data.map((m) => ({
    machine_id: m.machine_id ?? null,
    machine_name: m.machine_name ?? null,
    machine_location: m.machine_location ?? null,
    machine_revenue: m.machine_revenue ?? null,
    alert_id: m.alert_id ?? null,
    alert_name: m.alert_name ?? null,
    alert_severity: m.alert_severity ?? null,
    start_time: m.start_time ?? null,
    machine_status: null,
    machine_alert_id: m.machine_alert_id ?? null,
    currency: m.currency ?? null,
  }));
}

// Convert raw alert rows into typed AlertWithMachine objects (active alerts only)
function parseAlerts(data: MachinesWithLatestAlertRow[]): AlertWithMachine[] {
  return data.map((a) => ({
    alert_id: a.alert_id!,
    alert_name: a.alert_name ?? "Unknown",
    alert_severity: (a.alert_severity ?? "ok") as "error" | "warning" | "offline" | "ok",
    machine_id: a.machine_id,
    machine_name: a.machine_name ?? "Unknown Machine",
    start_time: a.start_time,
    machine_alert_id: a.machine_alert_id!, // non-null due to filtering
    machine_location: a.machine_location ?? "Unknown Location",
    machine_revenue: a.machine_revenue ?? 0,
  }));
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [machines, setMachines] = useState<MachineWithStatus[]>([]);
  const [alerts, setAlerts] = useState<AlertWithMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch machines and alerts from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);

      const machinesQuery = supabase
        .from("machines_with_latest_alert")
        .select(
          "machine_id,machine_name,machine_location,machine_revenue,currency,machine_alert_id,alert_id,alert_name,alert_severity,start_time"
        )
        .order("machine_name", { ascending: true })
        .returns<MachinesWithLatestAlertRow[]>();

      const alertsQuery = supabase
        .from("machines_with_latest_alert")
        .select(
          "machine_alert_id,alert_id,alert_name,alert_severity,machine_id,machine_name,machine_location,machine_revenue,currency,start_time"
        )
        .not("machine_alert_id", "is", null) // only active alerts
        .order("start_time", { ascending: false })
        .returns<MachinesWithLatestAlertRow[]>();

      const [machinesRes, alertsRes] = await Promise.all([machinesQuery, alertsQuery]);

      if (machinesRes.error) throw machinesRes.error;
      if (alertsRes.error) throw alertsRes.error;

      setMachines(parseMachines(machinesRes.data ?? []));
      setAlerts(parseAlerts(alertsRes.data ?? []));
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err?.message ?? "Failed to load data. Check your Supabase setup.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + subscribe to realtime changes
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("dashboard-listeners")
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_alerts_log" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "machines" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Prepare machine data for table rendering
  const machinesForTable = machines.map((m) => ({
    machine_id: m.machine_id ?? "unknown-id",
    machine_name: m.machine_name ?? "Unknown Machine",
    machine_location: m.machine_location ?? "Unknown Location",
    machine_revenue: m.machine_revenue ?? 0,
    currency: m.currency ?? "USD",
    machine_alert_id: m.machine_alert_id ?? undefined,
    alerts: m.alert_id
      ? {
          alert_id: m.alert_id,
          alert_name: m.alert_name ?? "Unknown",
          alert_severity: (m.alert_severity ?? "ok") as "error" | "warning" | "offline" | "ok",
        }
      : null,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 font-inter">
      <div className="mx-auto space-y-8">
        {/* Page header */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Icon iconNode={foxFaceTail} className="w-10 h-10 text-zinc-800 dark:text-zinc-100" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("dashboard.title")}
            </h1>
          </div>
        </header>

        {/* Machines + Alerts */}
        <main className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
          {/* Machines card */}
          <Card className="bg-white dark:bg-zinc-1000 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg p-2">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t("machineDetails.title")}</CardTitle>
              <CardDescription>{t("dashboard.revenue")}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="p-4 text-center text-gray-500">{t("dashboard.loading", "Loading...")}</div>}
              {error && <div className="p-4 text-center text-red-500">{error}</div>}
              {!loading && !error && machinesForTable.length > 0 ? (
                <VendingMachinesTable machines={machinesForTable} />
              ) : (
                !loading && !error && (
                  <div className="p-4 text-center text-gray-500">
                    {t("dashboard.noMachines", "No machines found.")}
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Alerts card */}
          <Card className="rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t("machineDetails.alerts")}</CardTitle>
              <CardDescription>{t("machineDetails.status")}</CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && !error && alerts.length > 0 ? (
                <AlertsTable alerts={alerts} />
              ) : (
                !loading && !error && (
                  <div className="p-4 text-center text-gray-500">
                    {t("dashboard.noAlerts", "No active alerts.")}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
