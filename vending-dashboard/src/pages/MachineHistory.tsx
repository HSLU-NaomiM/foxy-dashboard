// src/pages/MachineHistory.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type TimelineRow = {
  machine_id: string;
  machine_alert_id: string | null;
  alert_name: string | null;
  alert_severity: string | null;
  event_type: "alert_started" | "alert_resolved" | "maintenance";
  event_time: string; // not null in view
  maintenance_id: string | null;
  maintenance_type: string | null;
  event_notes: string | null;
};

export default function MachineHistory() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rows, setRows] = useState<TimelineRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getSeverityBadge = (sev?: string | null) => {
    switch (sev) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "error":
        return "bg-orange-100 text-orange-700";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getEventBadge = (type: TimelineRow["event_type"]) => {
    switch (type) {
      case "alert_started":
        return "bg-red-50 text-red-700";
      case "alert_resolved":
        return "bg-green-50 text-green-700";
      case "maintenance":
        return "bg-blue-50 text-blue-700";
    }
  };

  const fetchRows = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("machine_timeline")
        .select("*")
        .eq("machine_id", id)
        .order("event_time", { ascending: false })
        .returns<TimelineRow[]>();

      if (error) throw error;
      setRows(data ?? []);
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{t("machineHistory.title")}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          {t("machineHistory.back")}
        </Button>
      </div>

      {error && <p className="text-red-500">{t("machineHistory.error")}: {error}</p>}

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("machineHistory.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("machineHistory.unknownAlert")}</p>
            ) : (
              <ul className="space-y-3">
                {rows.map((r, idx) => (
                  <li key={idx} className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getEventBadge(r.event_type)}`}>
                          {r.event_type === "alert_started" && t("machineDetails.alerts")}
                          {r.event_type === "alert_resolved" && t("monitoring.submit")}
                          {r.event_type === "maintenance" && t("machineDetails.status")}
                        </span>
                        {r.alert_severity && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadge(r.alert_severity)}`}>
                            {r.alert_severity}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.event_time).toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-1 text-sm">
                      {r.event_type !== "maintenance" ? (
                        <div className="text-gray-700">
                          <strong>{r.alert_name ?? t("machineHistory.unknownAlert")}</strong>
                          {r.event_notes && <span className="text-gray-500"> — {r.event_notes}</span>}
                        </div>
                      ) : (
                        <div className="text-gray-700">
                          <strong>{r.maintenance_type ?? "Maintenance"}</strong>
                          {r.event_notes && <span className="text-gray-500"> — {r.event_notes}</span>}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
