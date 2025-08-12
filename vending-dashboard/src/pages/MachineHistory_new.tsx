import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from 'react-i18next'

type AlertHistoryEntry = {
  machine_alert_id: string;
  machine_id: string;
  alert_id: number;
  alert_name: string;
  alert_severity: string;
  start_time: string;
  resolved_time: string | null;
  alert_notes: string | null;
  maintenance_time: string | null;
  maintenance_notes: string | null;
};

export default function MachineHistory() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>();
  const [history, setHistory] = useState<AlertHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("machine_alert_history_view")
        .select("*")
        .eq("machine_id", id)
        .order("start_time", { ascending: false });

      if (error) {
        console.error("Fehler beim Laden der Historie:", error);
      } else {
        setHistory(data as AlertHistoryEntry[]);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [id]);

  if (loading) return <p className="p-4">{t('machineHistory.loading')}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t('machineHistory.title')}</h1>
      {history.length === 0 ? (
        <p>{t('machineHistory.noEntries')}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((entry) => (
            <Card key={entry.machine_alert_id}>
              <CardHeader>
                <CardTitle>{entry.alert_name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 flex flex-col gap-1">
                <p><strong>{t('machineHistory.severity')}:</strong> {entry.alert_severity}</p>
                <p><strong>{t('machineHistory.start')}:</strong> {new Date(entry.start_time).toLocaleString()}</p>
                <p><strong>{t('machineHistory.status')}:</strong> {entry.resolved_time ? t('machineHistory.resolved') : t('machineHistory.active')}</p>
                {entry.resolved_time && (
                  <>
                    <p><strong>{t('machineHistory.ended')}:</strong> {new Date(entry.resolved_time).toLocaleString()}</p>
                    <p><strong>{t('machineHistory.mitigationNote')}:</strong> {entry.alert_notes || '-'}</p>
                    <p><strong>{t('machineHistory.maintenance')}:</strong> {entry.maintenance_notes || '-'}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
