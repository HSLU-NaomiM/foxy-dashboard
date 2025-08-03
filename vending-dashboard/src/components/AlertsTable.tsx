import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleAlert } from "lucide-react";
import type { Alert } from "@/types/database";


export const AlertsTable = ({ alerts }: { alerts: Alert[] }) => (
  <Table className="w-full">
    <TableHeader>
      <TableRow>
        <TableHead>Alert Name</TableHead>
        <TableHead>Machine</TableHead>
        <TableHead>Severity</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {alerts.map((alert) => (
        <TableRow key={alert.alert_id}>
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
);