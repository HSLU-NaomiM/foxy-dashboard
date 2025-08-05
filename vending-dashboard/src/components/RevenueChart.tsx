// src/components/RevenueChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { format } from 'date-fns'
import { MonthlyRevenue } from '@/types/database'

type Props = {
  data: MonthlyRevenue[]
}

export default function RevenueChart({ data }: Props) {
  const chartData = data.map(d => ({
    month: d.revenue_month ? format(new Date(d.revenue_month), 'MMM') : '??',
    revenue: d.total_revenue ?? 0,
  }))

  return (
    <div className="w-full h-64 bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">Monatliche Einnahmen</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `CHF ${(value as number).toFixed(2)}`} />
          <Bar dataKey="revenue" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
