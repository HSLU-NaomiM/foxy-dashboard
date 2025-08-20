// src/lib/supabaseClient.ts
// File Summary:
// This file initializes the Supabase client used throughout the application for database and authentication.
// It configures the client with environment variables and provides strong typing via generated Supabase types.
// Key responsibilities:
// - Creates a single, shared Supabase client instance.
// - Injects project URL and API key from environment variables.
// - Provides full type safety for database queries through the Database type.
//
// Dependencies:
// - @supabase/supabase-js: official Supabase client for JavaScript/TypeScript.
// - Vite environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_KEY.
// - Local types (`src/types/supabase`): generated definitions for database schema.
//
// Folder structure notes:
// - Located in `src/lib/`, which contains shared utilities and setup files.
// - This file acts as the central access point for Supabase, ensuring consistent client usage across hooks and components.
//
// Security notes:
// - All database operations executed via this client are subject to Supabase Row Level Security (RLS) policies.
// - Permissions and access control must be configured in the Supabase dashboard.
// - The client cannot bypass RLS; it only executes queries allowed by the active user's session.
// - Sensitive actions (Insert, Update, Delete, File Uploads) will only succeed if matching policies exist.
// - Example policies typically required for this project:
//   • Table `machines`: SELECT allowed for authenticated users, optionally INSERT/UPDATE restricted to admins.  
//   • Table `alerts`: SELECT allowed for authenticated users, INSERT restricted to system roles.  
//   • Table `transactions` (if present): SELECT/INSERT allowed for authenticated users, UPDATE/DELETE often restricted.  
// - Always verify that least privilege access is enforced in Supabase.
//
// Typical usage:
// - Imported by hooks (e.g., useMachines) to query tables and relations.
// - Used in auth-related components (e.g., AuthListener, ProtectedRoute) to manage sessions and sign-in/out.
// - Serves as the foundation for all database reads/writes and authentication flows in the app.

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);
