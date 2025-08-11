// Ergänzung zu deinem bestehenden Code
// Unterhalb der Störungsmeldungen fügen wir eine Inventar-Ansicht als Kacheln hinzu

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function MachineDetails() {
  const { machine_id } = useParams<{ machine_id: string }>();
  const [machine, setMachine] = useState<any | null>(null);
  const [alertLogs, setAlertLogs] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

        const { data: inventoryData, error: inventoryError } = await supabase
          .from("inventory")
          .select(`
            inventory_id,
            current_stock,
            capacity,
            status,
            best_before_date,
            shelf_row,
            shelf_column,
            products ( name, price )
          `)
          .eq("machine_id", machine_id);

        if (inventoryError) throw inventoryError;
        setInventory(inventoryData || []);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "destructive";
      case "expired":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
      >
        ← Zurück
      </button>
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

            <h2 className="text-lg font-semibold mt-10 mb-3">📦 Inventar</h2>
            {inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {inventory.map((item) => (
                  <Card key={item.inventory_id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="text-md font-bold mb-1">
                        {item.products?.name || "Unbekanntes Produkt"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        Lager: <span className="font-medium">{item.current_stock}/{item.capacity}</span>
                      </p>
                      <p className="text-sm mb-1">
                        Preis: <span className="text-green-600 font-semibold">CHF {item.products?.price?.toFixed(2)}</span>
                      </p>
                      <Badge variant={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Fach: {item.shelf_row} / {item.shelf_column}
                      </p>
                      {item.best_before_date && (
                        <p className="text-xs text-red-600 mt-1">
                          MHD: {new Date(item.best_before_date).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Skeleton className="h-32 w-full rounded-md" />
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
