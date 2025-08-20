// src/types/database.d.ts
// File Summary:
// Central TypeScript declaration file for shared database-facing types used in the frontend.
// Provides strong typing for Supabase queries and component props that consume database rows.
// Ensures consistency between tables, views, and relations when rendering UI (monitoring, revenue, uploads, etc).
//
// Key responsibilities:
// - Define shape of core entities (`Machine`, `Alert`, `Product`, `MaintenanceLog`).
// - Model combined view rows and relations (e.g., `MachineWithLatestAlert`, `MachineWithStatus`).
// - Provide stricter typing for logs, revenue aggregation, and alert joins.
// - Enforce enumerated string unions for fields like `alert_severity` and `machine_status`.
//
// How it's used:
// - Imported in pages/components when building type-safe Supabase queries.
// - Used to constrain props in UI tables and detail views (`Monitoring`, `MachineHistory`, `RevenuePage`).
// - Supports `.returns<Type>()` with supabase-js for strong query typing.
//
// Folder structure notes:
// - Resides in `src/types/`, next to other domain-specific type definitions.
// - Coexists with utility files (e.g. revenue-helpers) and components using these types.
//
// Security notes:
// - These are *frontend-only* type definitions, not runtime validations.
// - RLS (Row-Level Security) and DB constraints remain responsible for data integrity.
// - Ensure server-side always enforces correct `alert_severity` and `machine_status` values.
// - Client assumes Supabase schema matches these definitions — keep them updated when schema evolves.

// Core entity: machine row from DB
export interface Machine {
  machine_id: string;
  machine_name: string;
  machine_location: string;
  machine_revenue: number;
}

// Machine row with potential alert relation (nullable)
export interface MachineTableRow extends Machine {
  alerts: Alert | null;
}

// Core entity: alert row with severity union
export interface Alert {
  alert_id: number;
  alert_name: string;
  alert_severity: "critical" | "error" | "warning" | "offline" | "ok"; 
}

// Maintenance log record
export interface MaintenanceLog {
  maintenance_id: string;
  machine_id: string;
  maintenance_type: string;
  notes?: string | null;
  performed_at: string;
  performed_by?: string | null;
}

// Inventory item with product info
export interface Product {
  inventory_id: string;
  machine_id: string;
  product_id: string;
  current_stock: number;
  capacity: number;
  position_id: string;
  created_at: string;
  product_name?: string;
}

// Alert joined with its machine context
export interface AlertWithMachine {
  alert_id: number;
  alert_name: string;
  alert_severity: "error" | "warning" | "offline" | "ok";
  machine_id: string;
  machine_name: string;
  start_time: string | null;
  machine_alert_id: string;
  machine_location: string;
  machine_revenue: number;
}

// Machine alert log entry (including nested alert)
export type MachineAlertLog = {
  machine_alert_id: string;
  machine_id: string;
  alert_id: number;
  start_time: string;
  resolved_time: string | null;
  notes: string;
  alerts: {
    alert_name: string;
    alert_severity: string;
  };
};

// Machine view including latest alert (nullable fields for left joins)
export interface MachineWithLatestAlert {
  machine_id: string | null;
  machine_name: string | null;
  machine_location: string | null;
  machine_revenue: number | null;
  currency: string | null;
  machine_alert_id: string | null;
  alert_id: number | null;
  alert_name: string | null;
  alert_severity: string | null;
  start_time: string | null;
}

// Machine view with status classification
export type MachineWithStatus = {
  machine_id: string | null;
  machine_name: string | null;
  machine_location: string | null;
  machine_revenue: number | null;
  alert_id: number | null;
  alert_name: string | null;
  alert_severity: "error" | "warning" | "offline" | "ok" | null;
  start_time: string | null;
  machine_status: "online" | "offline" | "error" | "warning" | null;
  machine_alert_id: string | null;
  currency?: string | null;
};

// Aggregated revenue per month view
export type MonthlyRevenue = {
  machine_id: string | null;
  revenue_month: string | null;
  total_revenue: number | null;
  total_transactions: number | null;
  machine_name: string;
  currency?: string;
};
