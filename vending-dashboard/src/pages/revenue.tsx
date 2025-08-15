import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import RevenueChart from '@/components/RevenueChart'
import RevenueTable from '@/components/RevenueTable'
import { MonthlyRevenue } from '@/types/database'

type Machine = {
  machine_id: string
  machine_name: string
}

export default function RevenuePage() {
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [selectedMachine, setSelectedMachine] = useState<string | 'all'>('all')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const { data: rawData, error } = await supabase
        .from('monthly_revenue')
        .select('machine_id, revenue_month, total_revenue, total_transactions')

      if (error) {
        console.error('Fehler beim Laden der Einnahmen:', error)
        setLoading(false)
        return
      }

      const { data: machinesData } = await supabase
        .from('machines')
        .select('machine_id, machine_name')

      const enriched = (rawData ?? []).map((row) => ({
        machine_id: row.machine_id,
        revenue_month: row.revenue_month,
        total_revenue: row.total_revenue,
        total_transactions: row.total_transactions,
        machine_name: machinesData?.find((m) => m.machine_id === row.machine_id)?.machine_name ?? 'Unbekannt',
        currency: 'CHF', // später dynamisch
      })) as MonthlyRevenue[]

      setData(enriched)
      setMachines(machinesData ?? [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredData = data.filter((row) => {
    const rowYear = row.revenue_month ? new Date(row.revenue_month).getFullYear() : 0
    const matchesYear = rowYear === selectedYear
    const matchesMachine = selectedMachine === 'all' || row.machine_id === selectedMachine
    return matchesYear && matchesMachine
  })

  const availableYears = Array.from(
    new Set(data.map(row => row.revenue_month ? new Date(row.revenue_month).getFullYear() : 0))
  ).filter(y => y !== 0)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Revenue Übersicht</h1>

      <div className="flex flex-wrap gap-4">
        <select
          className="border p-2 rounded"
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
        >
          <option value="all">Alle Automaten</option>
          {machines.map((m) => (
            <option key={m.machine_id} value={m.machine_id}>
              {m.machine_name}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <RevenueChart data={filteredData} />
      <RevenueTable data={filteredData} loading={loading} />
    </div>
  )
}
