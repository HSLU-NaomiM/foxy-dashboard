// src/pages/index.tsx
// File Summary:
// This file defines TypeScript interfaces for Alert and Machine objects.
// They provide strong typing for alert- and machine-related data used across the app,
// especially when handling Supabase query results or props passed to UI components.
// Key responsibilities:
// - Alert: describes the shape of an alert, including severity and optional machine details.
// - Machine: describes the shape of a vending machine, including revenue, location,
//   and an optional alert relation.
//
// Dependencies:
// - None; these are purely TypeScript type definitions.
//
// Folder structure notes:
// - Placed in `src/pages/`, though in larger projects such interfaces might be centralized
//   under `src/types/` to avoid duplication and allow re-use across multiple pages/components.

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
