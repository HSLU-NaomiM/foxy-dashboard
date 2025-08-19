// src/pages/Monitoring.tsx
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Strict row type for the view "machines_with_latest_alert"
type MachinesWithLatestAlertRow = {
  machine_id: string;
  machine_name: string;
  machine_location: string;
  machine_revenue: number;
  currency: string;
  machine_alert_id: string | null;
  alert_id: number | null;
  alert_name: string | null;
  alert_severity: string | null;
  start_time: string | null;
  has_history: boolean;
};

export default function Monitoring() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Data & UI state
  const [rows, setRows] = useState<MachinesWithLatestAlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyFaulty, setOnlyFaulty] = useState(false);

  // Resolve dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [mitigationNote, setMitigationNote] = useState("");
  const [resolving, setResolving] = useState(false);

  // Prevent race-conditions when toggling quickly
  const lastReqRef = useRef(0);

  // Severity → Tailwind chip classes
  const getSeverityClass = (severity?: string | null) => {
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
        return "text-gray-600 bg-gray-100";
    }
  };

  // Fetch rows from the single source-of-truth view
  const fetchData = async () => {
    const myReq = ++lastReqRef.current;
    try {
      setLoading(true);
      setError(null);

      const select =
        "machine_id, machine_name, machine_location, machine_revenue, currency, " +
        "machine_alert_id, alert_id, alert_name, alert_severity, start_time, has_history";

      let q = supabase.from("machines_with_latest_alert").select(select);
      if (onlyFaulty) {
        // show only machines that currently have an open alert
        q = q.not("machine_alert_id", "is", null);
      }

      // Strongly type the response to avoid GenericStringError unions
      const { data, error } = await q.returns<MachinesWithLatestAlertRow[]>();
      if (error) throw error;

      // Ignore stale responses (if user toggled quickly)
      if (myReq !== lastReqRef.current) return;

      // Defensive normalization & dedup: keep newest row per machine_id
      const list = (data ?? [])
        .filter((r): r is MachinesWithLatestAlertRow => !!r && !!(r as any).machine_id)
        .map((r) => ({ ...r, has_history: !!(r as any).has_history })); // ensure boolean

      const byId = new Map<string, MachinesWithLatestAlertRow>();
      for (const r of list) {
        const prev = byId.get(r.machine_id);
        const rTime = r.start_time ? Date.parse(r.start_time) : -Infinity;
        const pTime = prev?.start_time ? Date.parse(prev.start_time) : -Infinity;
        if (!prev || rTime > pTime) byId.set(r.machine_id, r);
      }

      setRows(Array.from(byId.values()));
    } catch (e: any) {
      if (myReq !== lastReqRef.current) return;
      console.error(e);
      setError(e.message ?? "Unknown error");
      setRows([]);
    } finally {
      if (myReq === lastReqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyFaulty]);

  // Resolve an alert: set resolved_time, notes, (optional) resolved_by
  const handleResolve = async () => {
    if (!selectedAlertId) return;
    try {
      setResolving(true);

      // capture who resolved it (optional; your schema has resolved_by)
      const { data: auth } = await supabase.auth.getUser();
      const resolvedBy = auth?.user?.id ?? null;

      const { error: updateError } = await supabase
        .from("machine_alerts_log")
        .update({
          resolved_time: new Date().toISOString(),
          notes: mitigationNote,
          resolved_by: resolvedBy,
        })
        .eq("machine_alert_id", selectedAlertId);

      if (updateError) {
        toast.error("Fehler beim Aktualisieren");
        console.error(updateError);
        return;
      }

      toast.success("Störung als behoben markiert");
      setOpenDialog(false);
      setMitigationNote("");
      setSelectedAlertId(null);
      fetchData(); // refresh list; resolved machines disappear from faulty view
    } finally {
      setResolving(false);
    }
  };

  const faultyCount = rows.reduce((acc, r) => acc + (r.machine_alert_id ? 1 : 0), 0);

  // ---- Rendering helpers (avoid touching `row` when loading) ----

  const renderSkeletonCard = (idx: number) => (
    <Card key={`sk-${idx}`} className="h-full flex flex-col hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-4 w-10 bg-gray-100 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="mt-auto min-h-[124px]">
        <div className="h-[88px] w-full animate-pulse rounded bg-gray-100" />
      </CardContent>
    </Card>
  );

  const renderDataCard = (row: MachinesWithLatestAlertRow) => (
    <Card key={row.machine_id} className="h-full flex flex-col hover:shadow-md">
      {/* Card header: title/location left, currency + History button right */}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{row.machine_name}</CardTitle>
            <CardDescription>{row.machine_location}</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{row.currency}</span>

            {/* Show History if active alert OR past history */}
            {(row.machine_alert_id || row.has_history) && (
              <Button
                variant="outline"
                size="sm"
                className="shadow-sm"
                onClick={() => navigate(`/machine/${row.machine_id}/history`)}
              >
                {t("machineHistory.title")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Card body: unified layout for alert & OK states */}
      <CardContent className="mt-auto min-h-[124px]">
        {row.machine_alert_id ? (
          // Active alert branch
          <div className="flex flex-col gap-2">
            <p className={`inline-block px-2 py-1 text-xs rounded w-fit ${getSeverityClass(row.alert_severity)}`}>
              {row.alert_name}
            </p>
            <p className="text-xs text-gray-500">
              {t("monitoring.mitigationNote")}:{" "}
              {row.start_time ? new Date(row.start_time).toLocaleString() : "-"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAlertId(row.machine_alert_id!);
                  setMitigationNote("");
                  setOpenDialog(true);
                }}
                disabled={resolving}
              >
                {t("monitoring.submit")}
              </Button>
            </div>
          </div>
        ) : (
          // OK branch (no active alert)
          <div className="flex flex-col gap-2">
            <p className={`inline-block px-2 py-1 text-xs rounded w-fit ${getSeverityClass("ok")}`}>
              {t("common.ok", "OK")}
            </p>
            <p className="text-xs text-gray-500">{t("dashboard.noAlerts", "No active alerts.")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ---------------------------------------------------------------

  return (
    <div className="p-6">
      {/* Page header with faulty switch */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{t("monitoring.title")}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {t("monitoring.faultyOnly")} {!loading ? `(${onlyFaulty ? rows.length : faultyCount})` : ""}
          </span>
          <Switch checked={onlyFaulty} onCheckedChange={setOnlyFaulty} />
        </div>
      </div>

      {error && (
        <p className="text-red-500 mb-4">
          {t("machineHistory.error")}: {error}
        </p>
      )}

      {/* Cards grid (uniform heights) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => renderSkeletonCard(idx))
          : rows.map((row) => renderDataCard(row))}
      </div>

      {/* Resolve dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("monitoring.mitigationNote")}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={mitigationNote}
            onChange={(e) => setMitigationNote(e.target.value)}
            placeholder={(t("monitoring.mitigationNote") as string) || "Mitigation notes…"}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenDialog(false)} disabled={resolving}>
              {t("monitoring.cancel")}
            </Button>
            <Button onClick={handleResolve} disabled={resolving || !selectedAlertId}>
              {resolving ? ((t("common.saving") as string) || "Saving…") : t("monitoring.submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
