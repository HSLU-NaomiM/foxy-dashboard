// src/components/RevenueTable.tsx
// File Summary:
// The RevenueTable component displays detailed revenue data per machine and month in a table format.
// It provides feedback for loading and empty states, and formats dates and revenue values consistently.
// Key responsibilities:
// - Shows a localized loading message while data is being fetched.
// - Shows a localized "no data" message if the dataset is empty.
// - Formats the month column into a "Month Year" format using date-fns, or falls back to "unknown".
// - Formats revenue values using Intl.NumberFormat for proper currency display.
// - Uses i18next for table headers and messages to support multiple languages.
// - Renders rows including: Month, Machine Name, Revenue, and Transaction Count.
//
// Dependencies:
// - date-fns: formatting of month/year values.
// - i18next: translation of table headers and status messages.
// - Tailwind CSS: table layout, styling, and responsiveness.

import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'

type Row = {
  month: string | Date
  machine_name: string
  currency: string
  total_revenue: number
  transactions_count: number
}

type Props = {
  data: Row[]
  loading: boolean
}

// RevenueTable component:
// Displays machine-specific revenue data in a table with localization and currency formatting.
export default function RevenueTable({ data, loading }: Props) {
  const { t } = useTranslation()

  // Show loading state while fetching
  if (loading) return <p>{t('revenueTable.loading')}</p>

  // Show empty state if no data
  if (data.length === 0) return <p>{t('revenueTable.noData')}</p>

  // Helper to format numbers into currency strings
  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value ?? 0)

  return (
    <div className="overflow-x-auto">
      {/* Main revenue table */}
      <table className="min-w-full bg-white border rounded-md shadow mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">{t('revenueTable.month')}</th>
            <th className="text-left p-3">{t('revenueTable.machine')}</th>
            <th className="text-left p-3">{t('revenueTable.revenue')}</th>
            <th className="text-left p-3">{t('revenueTable.transactions')}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            // Parse and format the month value, fallback to "unknown" if invalid
            const dt = typeof row.month === 'string' ? new Date(row.month) : row.month
            const monthLabel = isNaN(dt?.getTime() ?? NaN)
              ? t('revenueTable.unknown')
              : format(dt!, 'MMMM yyyy')

            return (
              <tr key={i} className="border-t">
                {/* Month column */}
                <td className="p-3">{monthLabel}</td>
                {/* Machine name column */}
                <td className="p-3">{row.machine_name}</td>
                {/* Revenue column with formatted currency */}
                <td className="p-3 font-medium">
                  {formatCurrency(row.total_revenue ?? 0, row.currency ?? 'USD')}
                </td>
                {/* Transactions column */}
                <td className="p-3">{row.transactions_count ?? 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
