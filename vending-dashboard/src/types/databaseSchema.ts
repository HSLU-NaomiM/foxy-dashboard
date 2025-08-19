// src/types/databaseSchema.ts
import type { Database } from '@/types/supabase'

// Alle echten Tabellen aus deinem Schema:
export type TableName = keyof Database['public']['Tables']

// Für das Dropdown:
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

// Nur Spaltennamen (nach deinem DB-Typ):
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
