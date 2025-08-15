// src/components/VendingMachinesTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Store, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MachineTableRow } from "@/types/database";
import { Link } from "react-router-dom";


export const VendingMachinesTable = ({
  machines,
}: {
  machines: MachineTableRow[];
}) => (
  <Table className="w-full">
    <TableHeader>
      <TableRow>
        <TableHead>Vending Machine</TableHead>
        <TableHead>Location</TableHead>
        <TableHead className="text-right">Revenue</TableHead>
        <TableHead className="text-center">Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {machines.map((machine) => {
        const severity = machine.alerts?.alert_severity;

        const colorClass =
          {
            error: "bg-red-500 hover:bg-red-600",
            warning: "bg-yellow-500 hover:bg-yellow-600",
            offline: "bg-gray-500 hover:bg-gray-600",
            ok: "bg-green-500 hover:bg-green-600",
          }[severity as string] || "bg-blue-500 hover:bg-blue-600";

        const label = severity
          ? severity.charAt(0).toUpperCase() + severity.slice(1)
          : "Online";

        return (
          <TableRow key={machine.machine_id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-500" />
                <Link
                  to={`/machine/${machine.machine_id}`}
                  className="text-blue-600 hover:underline"
                >
                  {machine.machine_name}
                </Link>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                {machine.machine_location}
              </div>
            </TableCell>
            <TableCell className="text-right">
              ${machine.machine_revenue.toFixed(2)}
            </TableCell>
            <TableCell className="text-center">
              <Badge className={`text-white ${colorClass}`}>{label}</Badge>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
