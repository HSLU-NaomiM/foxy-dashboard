export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_id: number
          alert_name: string
          alert_severity: string
        }
        Insert: {
          alert_id?: number
          alert_name: string
          alert_severity: string
        }
        Update: {
          alert_id?: number
          alert_name?: string
          alert_severity?: string
        }
        Relationships: []
      }
      deliveries: {
        Row: {
          batch_id: string
          best_before_date: string
          delivery_date: string
          product_id: number | null
          quantity: number
        }
        Insert: {
          batch_id: string
          best_before_date: string
          delivery_date: string
          product_id?: number | null
          quantity: number
        }
        Update: {
          batch_id?: string
          best_before_date?: string
          delivery_date?: string
          product_id?: number | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      feedback: {
        Row: {
          feedback_id: string
          feedback_text: string
          machine_id: string | null
          resolved: boolean | null
          submitted_at: string
          user_id: string | null
        }
        Insert: {
          feedback_id?: string
          feedback_text: string
          machine_id?: string | null
          resolved?: boolean | null
          submitted_at?: string
          user_id?: string | null
        }
        Update: {
          feedback_id?: string
          feedback_text?: string
          machine_id?: string | null
          resolved?: boolean | null
          submitted_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "alerts_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "feedback_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "feedback_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["machine_id"]
          },
        ]
      }
      inventory: {
        Row: {
          batch_id: string | null
          best_before_date: string | null
          capacity: number | null
          created_at: string | null
          created_by: string | null
          current_stock: number | null
          inventory_id: string
          machine_id: string
          position_id: number | null
          product_id: number
          restocked_at: string | null
          shelf_column: number | null
          shelf_row: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          batch_id?: string | null
          best_before_date?: string | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          inventory_id?: string
          machine_id: string
          position_id?: number | null
          product_id: number
          restocked_at?: string | null
          shelf_column?: number | null
          shelf_row?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string | null
          best_before_date?: string | null
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          current_stock?: number | null
          inventory_id?: string
          machine_id?: string
          position_id?: number | null
          product_id?: number
          restocked_at?: string | null
          shelf_column?: number | null
          shelf_row?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "alerts_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      machines: {
        Row: {
          alert_id: number | null
          created_at: string | null
          machine_id: string
          machine_location: string
          machine_name: string
          machine_revenue: number
          updated_at: string | null
        }
        Insert: {
          alert_id?: number | null
          created_at?: string | null
          machine_id?: string
          machine_location: string
          machine_name: string
          machine_revenue?: number
          updated_at?: string | null
        }
        Update: {
          alert_id?: number | null
          created_at?: string | null
          machine_id?: string
          machine_location?: string
          machine_name?: string
          machine_revenue?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "machines_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["alert_id"]
          },
        ]
      }
      maintenance_logs: {
        Row: {
          machine_id: string
          maintenance_id: string
          maintenance_type: string
          notes: string | null
          performed_at: string
          performed_by: string | null
        }
        Insert: {
          machine_id: string
          maintenance_id?: string
          maintenance_type: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
        }
        Update: {
          machine_id?: string
          maintenance_id?: string
          maintenance_type?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "alerts_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "maintenance_logs_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "maintenance_logs_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["machine_id"]
          },
        ]
      }
      products: {
        Row: {
          name: string
          price: number
          product_id: number
          shelf_life_days: number
        }
        Insert: {
          name: string
          price: number
          product_id: number
          shelf_life_days: number
        }
        Update: {
          name?: string
          price?: number
          product_id?: number
          shelf_life_days?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          inventory_id: string
          machine_id: string
          payment_method: string | null
          product_id: number
          purchased_at: string
          quantity: number
          total_price: number
          transaction_id: string
          user_id: string | null
        }
        Insert: {
          inventory_id: string
          machine_id: string
          payment_method?: string | null
          product_id: number
          purchased_at?: string
          quantity: number
          total_price: number
          transaction_id?: string
          user_id?: string | null
        }
        Update: {
          inventory_id?: string
          machine_id?: string
          payment_method?: string | null
          product_id?: number
          purchased_at?: string
          quantity?: number
          total_price?: number
          transaction_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "expired_inventory"
            referencedColumns: ["inventory_id"]
          },
          {
            foreignKeyName: "transactions_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["inventory_id"]
          },
          {
            foreignKeyName: "transactions_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory_stock_overview"
            referencedColumns: ["inventory_id"]
          },
          {
            foreignKeyName: "transactions_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "low_stock_inventory"
            referencedColumns: ["inventory_id"]
          },
          {
            foreignKeyName: "transactions_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "alerts_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "transactions_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "transactions_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
    }
    Views: {
      alerts_overview: {
        Row: {
          alert_name: string | null
          alert_severity: string | null
          machine_id: string | null
          machine_location: string | null
          machine_name: string | null
        }
        Relationships: []
      }
      expired_inventory: {
        Row: {
          batch_id: string | null
          best_before_date: string | null
          capacity: number | null
          created_at: string | null
          current_stock: number | null
          inventory_id: string | null
          machine_id: string | null
          position_id: number | null
          product_id: number | null
          product_name: string | null
          restocked_at: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "alerts_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      inventory_stock_overview: {
        Row: {
          capacity: number | null
          current_stock: number | null
          inventory_id: string | null
          machine_location: string | null
          machine_name: string | null
          position_id: number | null
          product_name: string | null
          status: string | null
          stock_percentage: number | null
        }
        Relationships: []
      }
      low_stock_inventory: {
        Row: {
          batch_id: string | null
          best_before_date: string | null
          capacity: number | null
          created_at: string | null
          current_stock: number | null
          inventory_id: string | null
          machine_id: string | null
          position_id: number | null
          product_id: number | null
          product_name: string | null
          restocked_at: string | null
          status: string | null
          stock_percentage: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "alerts_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine_overview"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["machine_id"]
          },
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["product_id"]
          },
        ]
      }
      machine_overview: {
        Row: {
          alert_name: string | null
          alert_severity: string | null
          machine_id: string | null
          machine_location: string | null
          machine_name: string | null
          machine_revenue: number | null
          total_inventory_items: number | null
        }
        Relationships: []
      }
      restock_needed: {
        Row: {
          capacity: number | null
          current_stock: number | null
          machine_name: string | null
          product_name: string | null
          stock_percentage: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
