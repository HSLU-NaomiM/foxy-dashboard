// src/components/RevenueTable.tsx
import { format } from 'date-fns'
import { MonthlyRevenue } from '@/types/database'
import { useTranslation } from 'react-i18next'

type Props = {
  data: MonthlyRevenue[]
  loading: boolean
}

export default function RevenueTable({ data, loading }: Props) {
  const { t } = useTranslation()
  if (loading) return <p>{t('revenueTable.loading')}</p>
  if (data.length === 0) return <p>{t('revenueTable.noData')}</p>

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
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">
                {row.revenue_month ? format(new Date(row.revenue_month), 'MMMM yyyy') : t('revenueTable.unknown')}
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
