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
import { Link } from "react-router-dom";
import { useState } from "react";

export interface MachineTableRow {
  machine_id: string;
  machine_name: string;
  machine_location: string;
  machine_revenue: number;
  currency?: string;
  machine_alert_id?: string; // ✅ optionaler Key für React
  alerts: {
    alert_id: number;
    alert_name: string;
    alert_severity: "error" | "warning" | "offline" | "ok";
  } | null;
}

// ✅ Zusätzlicher Typ für Sortierbare Spalten (inkl. alert_severity)
type SortKey = keyof Omit<MachineTableRow, "alerts"> | "alert_severity";

export const VendingMachinesTable = ({
  machines,
}: {
  machines: MachineTableRow[];
}) => {
  const [sortKey, setSortKey] = useState<SortKey>("machine_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const sortedMachines = [...machines].sort((a, b) => {
    let aVal: any = a[sortKey as keyof MachineTableRow];
    let bVal: any = b[sortKey as keyof MachineTableRow];

    if (sortKey === "alert_severity") {
      aVal = a.alerts?.alert_severity ?? "ok";
      bVal = b.alerts?.alert_severity ?? "ok";
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const arrow = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort("machine_name")} className="cursor-pointer">
            Vending Machine {arrow("machine_name")}
          </TableHead>
          <TableHead onClick={() => handleSort("machine_location")} className="cursor-pointer">
            Location {arrow("machine_location")}
          </TableHead>
          <TableHead onClick={() => handleSort("machine_revenue")} className="text-right cursor-pointer">
            Revenue {arrow("machine_revenue")}
          </TableHead>
          <TableHead onClick={() => handleSort("alert_severity")} className="text-center cursor-pointer">
            Status {arrow("alert_severity")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedMachines.map((machine) => {
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
            <TableRow key={machine.machine_alert_id ?? machine.machine_id}>
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
                {(machine.currency ?? "")} {machine.machine_revenue?.toFixed(2) ?? "0.00"}
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
};
