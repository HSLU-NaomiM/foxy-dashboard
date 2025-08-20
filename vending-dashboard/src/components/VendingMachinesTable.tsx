// src/components/VendingMachinesTable.tsx
// File Summary:
// The VendingMachinesTable component displays a sortable table of vending machines with details such as
// machine name, location, revenue, and current alert status. Each machine links to a dedicated detail page.
// Key responsibilities:
// - Renders vending machines in a table with icons for better visual context.
// - Allows sorting by machine name, location, revenue, or alert severity, toggling ascending/descending order.
// - Maps alert severity levels (error, warning, offline, ok) to color-coded badges for quick status recognition.
// - Provides navigation to the machine detail view using React Router's <Link>.
// - Uses Tailwind CSS and shadcn/ui Table & Badge components for consistent styling.
//
// Dependencies:
// - shadcn/ui: Table and Badge components for layout and styling.
// - lucide-react: Store and MapPin icons for visual context.
// - react-router-dom: navigation to machine detail pages.
// - React state hooks: manage sort key and direction.

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
  machine_alert_id?: string;
  alerts: {
    alert_id: number;
    alert_name: string;
    alert_severity: "error" | "warning" | "offline" | "ok";
  } | null;
}

type SortKey = keyof Omit<MachineTableRow, "alerts"> | "alert_severity";

// VendingMachinesTable component:
// Displays machine rows with sorting by name, location, revenue, or alert severity.
export const VendingMachinesTable = ({
  machines,
}: {
  machines: MachineTableRow[];
}) => {
  // Track current sorting state
  const [sortKey, setSortKey] = useState<SortKey>("machine_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Toggle sorting state when a header is clicked
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Create a sorted copy of machines based on the current sort key/direction
  const sortedMachines = [...machines].sort((a, b) => {
    let aVal: any = a[sortKey as keyof MachineTableRow];
    let bVal: any = b[sortKey as keyof MachineTableRow];

    // Special handling for alert severity, since it's nested
    if (sortKey === "alert_severity") {
      aVal = a.alerts?.alert_severity ?? "ok";
      bVal = b.alerts?.alert_severity ?? "ok";
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Helper to render sort direction arrow
  const arrow = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          {/* Clickable headers trigger sorting */}
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
          // Derive alert severity label and badge color
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
              {/* Machine name column with icon and link to details */}
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

              {/* Machine location column */}
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {machine.machine_location}
                </div>
              </TableCell>

              {/* Machine revenue column, right-aligned */}
              <TableCell className="text-right">
                {(machine.currency ?? "")} {machine.machine_revenue?.toFixed(2) ?? "0.00"}
              </TableCell>

              {/* Machine status column with color-coded badge */}
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
