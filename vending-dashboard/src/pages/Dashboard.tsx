// src/pages/Dashboard.tsx
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
import type { MachineWithStatus } from "@/types/database";
import { Icon } from "lucide-react";
import { foxFaceTail } from "@lucide/lab";
import type { AlertWithMachine } from "@/types/database";

function parseMachines(data: any[]): MachineWithStatus[] {
  return data.map((m) => ({
    machine_id: m.machine_id ?? null,
    machine_name: m.machine_name ?? null,
    machine_location: m.machine_location ?? null,
    machine_revenue: m.machine_revenue ?? null,
    alert_id: m.alert_id ?? null,
    alert_name: m.alert_name ?? null,
    alert_severity: m.alert_severity ?? null,
    start_time: m.start_time ?? null,
    machine_status: m.machine_status ?? null,
  }));
}


export default function Dashboard() {
  const [rawMachines, setRawMachines] = useState<MachineWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("machines_with_status")
        .select("*");

      if (error) throw error;
      setRawMachines(parseMachines(data ?? []));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Check your Supabase setup.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("dashboard-listeners")
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_alerts_log" }, () =>
        fetchData()
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "machines" }, () =>
        fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const machinesForTable = rawMachines.map((m) => ({
    machine_id: m.machine_id ?? "unknown-id",
    machine_name: m.machine_name ?? "Unknown Machine",
    machine_location: m.machine_location ?? "Unknown Location",
    machine_revenue: m.machine_revenue ?? 0,
    alerts: m.alert_id
      ? {
          alert_id: m.alert_id,
          alert_name: m.alert_name ?? "Unknown",
          alert_severity: (m.alert_severity ?? "ok") as "error" | "warning" | "offline" | "ok",
        }
      : null,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 p-6 md:p-10 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Icon iconNode={foxFaceTail} className="w-10 h-10 text-zinc-800 dark:text-zinc-100" />
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              Vending Machine Dashboard
            </h1>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg p-4">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Vending Machines</CardTitle>
              <CardDescription>
                Machines and their current alert status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
              {error && <div className="p-4 text-center text-red-500">{error}</div>}
              {!loading && !error && machinesForTable.length > 0 ? (
                <VendingMachinesTable machines={machinesForTable} />
              ) : (
                !loading &&
                !error && (
                  <div className="p-4 text-center text-gray-500">No machines found.</div>
                )
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Current Alerts</CardTitle>
              <CardDescription>
                One open alert per machine (if any).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && !error && rawMachines.filter((m) => m.alert_id).length > 0 ? (
                <AlertsTable
                  alerts={
                    rawMachines
                      .filter((m) => m.alert_id && m.machine_id)
                      .map((m): AlertWithMachine => ({
                        alert_id: m.alert_id!,
                        alert_name: m.alert_name ?? "Unknown",
                        alert_severity: (m.alert_severity ?? "ok") as AlertWithMachine["alert_severity"],
                        machine_id: m.machine_id!,
                        machine_name: m.machine_name ?? "Unknown",
                        start_time: m.start_time ?? null,
                      }))
                  }
                />
              ) : (
                !loading &&
                !error && (
                  <div className="p-4 text-center text-gray-500">No active alerts.</div>
                )
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
