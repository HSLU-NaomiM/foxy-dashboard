// src/hooks/useMachines.ts
// File Summary:
// The useMachines custom hook fetches vending machine data (including related alerts) from Supabase
// and provides it to React components along with a loading state.
// Key responsibilities:
// - Queries the "machines" table in Supabase, joining with related "alerts".
// - Stores the machine data in React state once loaded.
// - Tracks loading status until the fetch completes.
// - Logs any Supabase errors to the console.
// - Returns both the list of machines and the loading indicator for consumption by UI components.
//
// Dependencies:
// - supabase-js: queries the database tables.
// - React hooks: useState and useEffect for managing async data and lifecycle.
// - Generated Supabase types: ensures type safety for machine and alert rows.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { Database } from '../types/supabase'

type Machine = Database['public']['Tables']['machines']['Row']
type Alert = Database['public']['Tables']['alerts']['Row']

// useMachines hook:
// Fetches vending machines with their alerts and exposes data + loading state.
export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      // Query "machines" with joined "alerts"
      const { data, error } = await supabase
        .from('machines')
        .select('*, alerts(*)')

      if (error) {
        console.error('Fehler beim Laden:', error)
      } else {
        // Save fetched machines into state
        setMachines(data as Machine[])
      }

      setLoading(false)
    }

    fetch()
  }, [])

  // Expose machines and loading state to consumers
  return { machines, loading }
}
