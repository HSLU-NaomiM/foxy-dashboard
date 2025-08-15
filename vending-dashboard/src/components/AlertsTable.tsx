// src/components/AlertsTable.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleAlert } from "lucide-react";
import type { Alert } from "@/types/database";
import type { AlertWithMachine } from "@/types/database";
import { useTranslation } from 'react-i18next'


export const AlertsTable = ({ alerts }: { alerts: AlertWithMachine[] }) => {
  const { t } = useTranslation()
  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>{t('alertsTable.alertName')}</TableHead>
          <TableHead>{t('alertsTable.machine')}</TableHead>
          <TableHead>{t('alertsTable.severity')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.machine_alert_id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <CircleAlert className="w-4 h-4 text-gray-500" />
                {alert.alert_name}
              </div>
            </TableCell>
            <TableCell>{alert.machine_name}</TableCell>
            <TableCell>{alert.alert_severity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
