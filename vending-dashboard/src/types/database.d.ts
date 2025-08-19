// src/types/database.d.ts

export interface Machine {
  machine_id: string;
  machine_name: string;
  machine_location: string;
  machine_revenue: number;
}

export interface MachineTableRow extends Machine {
  alerts: Alert | null;
}


export interface Alert {
  alert_id: number;
  alert_name: string;
  alert_severity: "critical" | "error" | "warning" | "offline" | "ok"; 
}

export interface MaintenanceLog {
  maintenance_id: string;
  machine_id: string;
  maintenance_type: string;
  notes?: string | null;
  performed_at: string;
  performed_by?: string | null;
}

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



export type MonthlyRevenue = {
  machine_id: string | null
  revenue_month: string | null
  total_revenue: number | null
  total_transactions: number | null
  machine_name: string
  currency?: string 
}