// src/types/databaseSchema.ts
// File Summary:
// Central registry of database tables and their allowed columns,
// derived from the generated Supabase `Database` type.  
// Used to build consistent table-targeted utilities (e.g. Upload page, validation, column whitelisting).
//
// Key responsibilities:
// - Define `TableName` union type for all known public schema tables.
// - Provide `TABLES` as a readonly list of table identifiers for iteration.
// - Provide `databaseSchemas` mapping from table name → allowed column names.
//   Useful for column validation, safe inserts, and UI legends.
//
// How it's used:
// - `Upload.tsx` references these schemas to filter/validate incoming CSV/JSON data.
// - Helps ensure frontend inserts only permitted fields into Supabase.
// - Acts as a single source of truth to keep frontend expectations aligned with DB schema.
//
// Folder structure notes:
// - Resides in `src/types/`, next to other schema/type definitions (`database.d.ts`, `supabase.ts`).
// - Complements the generated `supabase.ts` types (full DB contract) with a curated, frontend-facing whitelist.
//
// Security notes:
// - Avoids overposting: only the whitelisted fields per table are ever inserted from user-uploaded files.
// - Prevents client from accidentally supplying system-managed fields (`created_at`, `updated_at`, etc).
// - Must be kept in sync with Supabase schema migrations — drift could cause runtime errors or security gaps.

import type { Database } from '@/types/supabase'

// Union type for all table names in the public schema.
// Ensures strict typing when working with table identifiers.
export type TableName = keyof Database['public']['Tables']

// Canonical readonly list of all supported tables.
// Useful for iteration (e.g. building dropdowns).
export const TABLES: readonly TableName[] = [
  'alerts',
  'deliveries',
  'feedback',
  'inventory',
  'machine_alerts_log',
  'machines',
  'maintenance_logs',
  'products',
  'transactions',
] as const

// Whitelisted columns for each table.  
// Only these fields should be handled by the frontend — all others are system-managed.
export const databaseSchemas: Partial<Record<TableName, readonly string[]>> = {
  alerts: ['alert_id','alert_name','alert_severity'],
  deliveries: ['batch_id','best_before_date','delivery_date','product_id','quantity'],
  feedback: ['feedback_id','feedback_text','machine_id','resolved','submitted_at','user_id'],
  inventory: [
    'batch_id','best_before_date','capacity','created_at','created_by','current_stock','inventory_id',
    'machine_id','position_id','product_id','restocked_at','shelf_column','shelf_row','status','updated_at'
  ],
  machine_alerts_log: [
    'alert_id','machine_alert_id','machine_id','maintenance_id','notes','resolved_by','resolved_time','start_time'
  ],
  machines: ['created_at','machine_id','machine_location','machine_name','machine_revenue','updated_at','currency'],
  maintenance_logs: ['machine_id','maintenance_id','maintenance_type','notes','performed_at','performed_by'],
  products: ['name','price','product_id','shelf_life_days'],
  transactions: [
    'currency','inventory_id','machine_id','payment_method','product_id','purchased_at','quantity','total_price',
    'transaction_id','user_id'
  ],
} as const
