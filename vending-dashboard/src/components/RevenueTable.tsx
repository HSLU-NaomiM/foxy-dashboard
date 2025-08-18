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

export default function RevenueTable({ data, loading }: Props) {
  const { t } = useTranslation()
  if (loading) return <p>{t('revenueTable.loading')}</p>
  if (data.length === 0) return <p>{t('revenueTable.noData')}</p>

  const formatCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value ?? 0)

  return (
    <div className="overflow-x-auto">
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
            const dt = typeof row.month === 'string' ? new Date(row.month) : row.month
            const monthLabel = isNaN(dt?.getTime() ?? NaN)
              ? t('revenueTable.unknown')
              : format(dt!, 'MMMM yyyy')

            return (
              <tr key={i} className="border-t">
                <td className="p-3">{monthLabel}</td>
                <td className="p-3">{row.machine_name}</td>
                <td className="p-3 font-medium">
                  {formatCurrency(row.total_revenue ?? 0, row.currency ?? 'USD')}
                </td>
                <td className="p-3">{row.transactions_count ?? 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
