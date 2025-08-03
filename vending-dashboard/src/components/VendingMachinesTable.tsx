import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Store, CircleAlert, MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import type { Machine } from "@/types/database";


export const VendingMachinesTable = ({ machines }: { machines: Machine[] }) => (
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
        const status = machine.alert ? 'Error' : 'Online';
        const badgeClass = {
          'Online': 'bg-green-500 hover:bg-green-600',
          'Error': 'bg-red-500 hover:bg-red-600'
        }[status] || 'bg-gray-400 hover:bg-gray-500';

        return (
          <TableRow key={machine.machine_id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-500" />
                {machine.machine_name}
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
              <Badge className={`text-white ${badgeClass}`}>{status}</Badge>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);