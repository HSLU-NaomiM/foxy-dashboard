import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

// Keep it local to decouple from older MonthlyRevenue type
type Row = {
  month: string | Date
  total_revenue: number
  currency: string
}

type Props = { data: Row[] }

export default function RevenueChart({ data }: Props) {
  const { t } = useTranslation()

  // Build chart data from the new fields
  const chartData = data.map(d => {
    const dt = typeof d.month === 'string' ? new Date(d.month) : d.month
    return {
      month: isNaN(dt?.getTime() ?? NaN) ? t('revenueChart.unknown') : format(dt!, 'MMM'),
      revenue: d.total_revenue ?? 0,
      currency: d.currency ?? 'USD',
    }
  })

  return (
    <div className="w-full h-64 bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-2">{t('revenueChart.title')}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value, _name, item) => {
              const ccy = (item?.payload as any)?.currency ?? 'USD'
              const amt = Number(value ?? 0)
              // Use Intl for proper currency formatting
              return [
                new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy }).format(amt),
                t('revenueChart.revenueLabel', 'Revenue'),
              ]
            }}
          />
          <Bar dataKey="revenue" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
