// src/components/AlertsTable.tsx
// File Summary:
// The AlertsTable component displays a list of active alerts with their related machine information.
// It provides a simple tabular view with columns for alert name, machine name, and severity.
// Key responsibilities:
// - Render a table with translated column headers.
// - Show each alert with an icon, machine name, and severity.
// - Support internationalization (i18n) for labels and fallback text.
// - Ensure unique keys per row based on machine_alert_id.
//
// Dependencies:
// - shadcn/ui table primitives for layout (Table, TableHeader, TableRow, etc.).
// - lucide-react for the alert icon.
// - i18next for translations.
// - Local type definitions from `src/types/database`.
//
// Folder structure notes:
// - Located in `src/components/`, reusable across pages (Dashboard, Monitoring).
// - Consumes `AlertWithMachine` rows passed from parent pages.
// - Works as a pure presentational component with no state or data fetching.
//
// Security notes:
// - This component is read-only; it renders props given by the parent.
// - Data integrity (alert severity values, machine name) depends on Supabase RLS and schema.
// - No direct database access occurs here; no additional client-side security logic needed.

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleAlert } from "lucide-react";
import type { AlertWithMachine } from "@/types/database";
import { useTranslation } from "react-i18next";

// AlertsTable component:
// Renders a list of alerts and their machine info in a table layout.
export const AlertsTable = ({ alerts }: { alerts: AlertWithMachine[] }) => {
  // Hook for translations (internationalization)
  const { t } = useTranslation();

  return (
    <Table className="w-full">
      {/* Table header with translated column titles */}
      <TableHeader>
        <TableRow>
          <TableHead>{t("alertsTable.alertName")}</TableHead>
          <TableHead>{t("alertsTable.machine")}</TableHead>
          <TableHead>{t("alertsTable.severity")}</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {/* Iterate over alerts and render each row */}
        {alerts.map((alert) => (
          <TableRow key={alert.machine_alert_id}>
            {/* Alert name with icon */}
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <CircleAlert className="w-4 h-4 text-gray-500" />
                {alert.alert_name}
              </div>
            </TableCell>

            {/* Machine name */}
            <TableCell>{alert.machine_name}</TableCell>

            {/* Alert severity */}
            <TableCell>{alert.alert_severity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
