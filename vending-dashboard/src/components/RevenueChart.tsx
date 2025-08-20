// src/components/RevenueChart.tsx
// File Summary:
// The RevenueChart component visualizes monthly revenue data as a bar chart.
// It transforms the raw data into a Recharts-compatible format and handles date parsing,
// currency formatting, and localization of labels.
//
// Key responsibilities:
// - Convert month values (string or Date) into short month labels (e.g., "Jan").
// - Handle invalid or missing dates with a translated "unknown" label.
// - Use i18next for chart title and tooltip label translations.
// - Format currency values with Intl.NumberFormat inside the tooltip.
// - Render a responsive Recharts BarChart with grid, axes, tooltips, and styled bars.
//
// Dependencies:
// - recharts: BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid.
// - date-fns: for formatting month abbreviations.
// - i18next: for translated labels and chart title.
// - Tailwind CSS: for card-like styling of the chart container.

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

// Input row type for the chart
type Row = {
  month: string | Date
  total_revenue: number
  currency: string
}

type Props = { data: Row[] }

// RevenueChart component:
// Displays a responsive bar chart of monthly revenue with localized labels and currency formatting.
export default function RevenueChart({ data }: Props) {
  const { t } = useTranslation()

  // Transform input rows into Recharts-compatible format
  const chartData = data.map(d => {
    const dt = typeof d.month === 'string' ? new Date(d.month) : d.month
    return {
      // If the date is invalid, fallback to translated "unknown"
      month: isNaN(dt?.getTime() ?? NaN) ? t('revenueChart.unknown') : format(dt!, 'MMM'),
      revenue: d.total_revenue ?? 0,
      currency: d.currency ?? 'USD',
    }
  })

  return (
    <div className="w-full h-64 bg-white rounded shadow p-4">
      {/* Chart title (localized) */}
      <h2 className="text-lg font-semibold mb-2">{t('revenueChart.title')}</h2>

      {/* Responsive container ensures chart resizes with parent */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          {/* Tooltip with custom currency formatting */}
          <Tooltip
            formatter={(value, _name, item) => {
              const ccy = (item?.payload as any)?.currency ?? 'USD'
              const amt = Number(value ?? 0)
              return [
                new Intl.NumberFormat('en-US', { style: 'currency', currency: ccy }).format(amt),
                t('revenueChart.revenueLabel', 'Revenue'),
              ]
            }}
          />
          {/* Revenue bars */}
          <Bar dataKey="revenue" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
