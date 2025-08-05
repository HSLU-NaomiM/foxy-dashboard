// src/pages/Monitoring.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

export default function Monitoring() {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [mitigationNote, setMitigationNote] = useState("");
  const [onlyFaulty, setOnlyFaulty] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: machinesData, error: machinesError } = await supabase
        .from("machines")
        .select("machine_id, machine_name, machine_location");

      if (machinesError) throw machinesError;

      const { data: alertData, error: alertError } = await supabase
        .from("current_machine_alerts")
        .select("machine_id, alert_name, alert_severity, start_time");

      if (alertError) throw alertError;

      const alertMap: Record<string, any> = {};
      alertData.forEach((entry: any) => {
        alertMap[entry.machine_id] = entry;
      });

      const enrichedMachines = machinesData
        .map((m: any) => ({
          ...m,
          alert: alertMap[m.machine_id] || null
        }))
        .filter((m) => (onlyFaulty ? m.alert : true));

      setMachines(enrichedMachines);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [onlyFaulty]);

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-700 bg-red-100";
      case "high":
      case "error":
        return "text-orange-700 bg-orange-100";
      case "warning":
        return "text-yellow-800 bg-yellow-100";
      case "offline":
        return "text-gray-700 bg-gray-200";
      case "ok":
        return "text-green-700 bg-green-100";
      default:
        return "text-gray-600";
    }
  };

  const handleResolve = async () => {
    if (!selectedMachineId) return;

    const { data: openAlerts, error } = await supabase
      .from("machine_alerts_log")
      .select("machine_alert_id")
      .eq("machine_id", selectedMachineId)
      .is("resolved_time", null);

    if (error || !openAlerts || openAlerts.length === 0) return;

    const alertId = openAlerts[0].machine_alert_id;

    await supabase
      .from("machine_alerts_log")
      .update({
        resolved_time: new Date().toISOString(),
        notes: mitigationNote
      })
      .eq("machine_alert_id", alertId);

    setOpenDialog(false);
    setMitigationNote("");
    toast.success("Störung als behoben markiert");
    fetchData();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Monitoring</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">Nur gestörte anzeigen</span>
          <Switch checked={onlyFaulty} onCheckedChange={setOnlyFaulty} />
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">Fehler: {error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {machines.map((machine) => (
          <Card key={machine.machine_id} className="hover:shadow-md">
            <CardHeader>
              <CardTitle>{machine.machine_name}</CardTitle>
              <CardDescription>{machine.machine_location}</CardDescription>
            </CardHeader>
            <CardContent>
              {machine.alert ? (
                <div className="flex flex-col gap-2">
                  <p className={`inline-block px-2 py-1 text-xs rounded w-fit ${getSeverityClass(machine.alert.alert_severity)}`}>
                    {machine.alert.alert_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    seit {new Date(machine.alert.start_time).toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMachineId(machine.machine_id);
                        setOpenDialog(true);
                      }}
                    >
                      Beheben
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/machine/${machine.machine_id}/history`)}
                    >
                      Verlauf
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Keine Störung</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Störung abschliessen</DialogTitle>
          </DialogHeader>
          <Textarea
            value={mitigationNote}
            onChange={(e) => setMitigationNote(e.target.value)}
            placeholder="Was wurde getan, um die Störung zu beheben?"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleResolve}>Als behoben markieren</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
