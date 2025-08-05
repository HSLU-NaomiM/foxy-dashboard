import { format } from 'date-fns'
import { MonthlyRevenue } from '@/types/database'

type Props = {
  data: MonthlyRevenue[]
  loading: boolean
}

export default function RevenueTable({ data, loading }: Props) {
  if (loading) return <p>Lade Einnahmen…</p>
  if (data.length === 0) return <p>Keine Einnahmen für diese Auswahl.</p>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-md shadow mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Monat</th>
            <th className="text-left p-3">Automat</th>
            <th className="text-left p-3">Einnahmen</th>
            <th className="text-left p-3">Transaktionen</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">
                {row.revenue_month ? format(new Date(row.revenue_month), 'MMMM yyyy') : 'Unbekannt'}
              </td>
              <td className="p-3">{row.machine_name}</td>
              <td className="p-3 font-medium">
                {row.currency ?? 'CHF'} {row.total_revenue?.toFixed(2) ?? '0.00'}
              </td>
              <td className="p-3">{row.total_transactions ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
