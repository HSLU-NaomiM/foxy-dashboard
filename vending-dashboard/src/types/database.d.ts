// src/types/database.d.ts

export interface Alert {
  alert_id: number;
  alert_name: string;
  alert_severity: string;
  machine_id?: string;
  machine_name?: string;
}

export interface Machine {
  machine_id: string;
  machine_name: string;
  machine_location: string;
  machine_revenue: number;
  alert_id?: number;
  alert?: Alert;
}
