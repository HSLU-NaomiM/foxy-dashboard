// src/pages/MachineHistory.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function MachineHistory() {
  const { t } = useTranslation();
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
        <h1 className="text-2xl font-bold">{t('machineHistory.title')}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          {t('machineHistory.back')}
        </Button>
      </div>

      {error && <p className="text-red-500">{t('machineHistory.error')}: {error}</p>}

      <div className="grid gap-4">
        {logs.map((log, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{log.alert_name ?? t('machineHistory.unknownAlert')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{t('machineDetails.status')}: <strong>{log.alert_severity}</strong></p>
              <p className="text-sm text-gray-600">Start: {new Date(log.start_time).toLocaleString()}</p>
              {log.resolved_time ? (
                <>
                  <p className="text-sm text-green-700">{t('machineDetails.status')}: {new Date(log.resolved_time).toLocaleString()}</p>
                  {log.notes && <p className="text-sm mt-1 text-gray-500">{t('monitoring.mitigationNote')}: {log.notes}</p>}
                </>
              ) : (
                <p className="text-sm text-red-600">{t('machineHistory.error')}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
