import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { VendingMachinesTable } from "@/components/VendingMachinesTable";
import { AlertsTable } from "@/components/AlertsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Machine, Alert } from "@/types/database";

export default function Dashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: machinesData, error: machinesError } = await supabase
        .from('machines')
        .select(`
          machine_id,
          machine_name,
          machine_location,
          machine_revenue,
          alert_id,
          alerts (alert_id, alert_name, alert_severity)
        `);

      if (machinesError) throw machinesError;

      const flatMachines = machinesData.map((m: any) => ({
        ...m,
        alert: m.alerts || null
      }));

      setMachines(flatMachines);

      const { data: alertsData, error: alertsError } = await supabase
        .from('alerts')
        .select('*');

      if (alertsError) throw alertsError;

      const enrichedAlerts = alertsData.map(alert => {
        const match = flatMachines.find(m => m.alert_id === alert.alert_id);
        return {
          ...alert,
          machine_name: match?.machine_name || 'Unknown'
        };
      });

      setAlerts(enrichedAlerts);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Check your Supabase setup.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('dashboard-listeners')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Vending Machine Dashboard
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            A real-time overview of your vending machine network.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Vending Machines</CardTitle>
              <CardDescription>
                A list of all active vending machines and their status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
              {error && <div className="p-4 text-center text-red-500">{error}</div>}
              {!loading && !error && machines.length > 0 ? (
                <VendingMachinesTable machines={machines} />
              ) : (
                !loading && !error && <div className="p-4 text-center text-gray-500">No machines found.</div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Alerts</CardTitle>
              <CardDescription>
                Active alerts and issues that require attention.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
              {error && <div className="p-4 text-center text-red-500">{error}</div>}
              {!loading && !error && alerts.length > 0 ? (
                <AlertsTable alerts={alerts} />
              ) : (
                !loading && !error && <div className="p-4 text-center text-gray-500">No alerts found.</div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
