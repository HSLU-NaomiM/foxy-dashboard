// src/pages/MachineDetails.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import type { MaintenanceLog, Product } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function MachineDetails() {
  const { machine_id } = useParams<{ machine_id: string }>();
  const [machine, setMachine] = useState<any | null>(null);
  const [alertLogs, setAlertLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!machine_id) return;

    const fetchDetails = async () => {
      try {
        const { data: machinesData, error: machineError } = await supabase
          .from("machines")
          .select("*")
          .eq("machine_id", machine_id)
          .single();

        if (machineError) throw machineError;
        setMachine(machinesData);

        const { data: alertsLogData, error: alertsLogError } = await supabase
          .from("machine_alerts_log")
          .select(`
            machine_alert_id,
            start_time,
            resolved_time,
            notes,
            alerts (
              alert_name,
              alert_severity
            )
          `)
          .eq("machine_id", machine_id)
          .order("start_time", { ascending: false });

        if (alertsLogError) throw alertsLogError;
        setAlertLogs(alertsLogData);

      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchDetails();
  }, [machine_id]);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical":
      case "error":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-gray-200 text-gray-700";
      case "ok":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getBadgeClass = (severity: string) => {
    switch (severity) {
      case "critical":
      case "error":
        return "bg-red-500 text-white hover:bg-red-600";
      case "warning":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "offline":
        return "bg-gray-500 text-white hover:bg-gray-600";
      case "ok":
        return "bg-green-500 text-white hover:bg-green-600";
      default:
        return "bg-gray-300 text-white hover:bg-gray-400";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {machine ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-1">{machine.machine_name}</h1>
                <p className="text-sm text-muted-foreground">Standort: <span className="font-medium">{machine.machine_location}</span></p>
                <p className="text-sm text-muted-foreground">Umsatz: <span className="text-green-600 font-semibold">CHF {machine.machine_revenue.toFixed(2)}</span></p>
              </div>
              {alertLogs[0] && (
                <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getBadgeClass(alertLogs[0]?.alerts?.alert_severity || "")}`}>
                  {alertLogs[0]?.alerts?.alert_severity || "Error"}
                </span>
              )}
            </div>

            <h2 className="text-lg font-semibold mb-3">🛠 Störungsmeldungen</h2>
            {alertLogs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beginn</TableHead>
                    <TableHead>Beendet</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Schwere</TableHead>
                    <TableHead>Notiz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertLogs.map((entry) => (
                    <TableRow key={entry.machine_alert_id}>
                      <TableCell>{new Date(entry.start_time).toLocaleString()}</TableCell>
                      <TableCell>{entry.resolved_time ? new Date(entry.resolved_time).toLocaleString() : "❗ Offen"}</TableCell>
                      <TableCell className="font-medium">{entry.alerts?.alert_name || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${getSeverityStyle(entry.alerts?.alert_severity || "")}`}>
                          {entry.alerts?.alert_severity || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{entry.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Keine Störmeldungen gefunden 🎉</p>
            )}

            {error && <p className="text-red-500 mt-4">Fehler: {error}</p>}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">Lade Maschinendetails...</p>
      )}
    </div>
  );
}