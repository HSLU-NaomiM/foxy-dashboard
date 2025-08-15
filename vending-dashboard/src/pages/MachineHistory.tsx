// src/pages/MachineHistory.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MachineHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("machine_alerts_history")
      .select("*")
      .eq("machine_id", id)
      .order("start_time", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setLogs(data);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Störungsverlauf</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Zurück
        </Button>
      </div>

      {error && <p className="text-red-500">Fehler: {error}</p>}

      <div className="grid gap-4">
        {logs.map((log, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{log.alert_name ?? "Unbekannter Alarm"}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">Schweregrad: <strong>{log.alert_severity}</strong></p>
              <p className="text-sm text-gray-600">Start: {new Date(log.start_time).toLocaleString()}</p>
              {log.resolved_time ? (
                <>
                  <p className="text-sm text-green-700">Behoben: {new Date(log.resolved_time).toLocaleString()}</p>
                  {log.notes && <p className="text-sm mt-1 text-gray-500">Notiz: {log.notes}</p>}
                </>
              ) : (
                <p className="text-sm text-red-600">Noch nicht behoben</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
