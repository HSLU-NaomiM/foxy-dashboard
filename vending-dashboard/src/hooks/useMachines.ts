// src/hooks/useMachines.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Database } from '../types/supabase'

type Machine = Database['public']['Tables']['machines']['Row']
type Alert = Database['public']['Tables']['alerts']['Row']

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('*, alerts(*)')

      if (error) {
        console.error('Fehler beim Laden:', error)
      } else {
        setMachines(data as Machine[])
      }

      setLoading(false)
    }

    fetch()
  }, [])

  return { machines, loading }
}
