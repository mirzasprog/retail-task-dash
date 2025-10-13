export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_suggestions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          id: string
          rationale: string | null
          region_id: string | null
          status: string | null
          store_id: string | null
          suggestion_type: string
          title: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rationale?: string | null
          region_id?: string | null
          status?: string | null
          store_id?: string | null
          suggestion_type: string
          title: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          rationale?: string | null
          region_id?: string | null
          status?: string | null
          store_id?: string | null
          suggestion_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_category_sales: {
        Row: {
          category_id: string
          created_at: string
          date: string
          id: string
          sales_amount: number
          store_id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          date: string
          id?: string
          sales_amount?: number
          store_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          date?: string
          id?: string
          sales_amount?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_category_sales_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_category_sales_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_keys: {
        Row: {
          created_at: string
          endpoint: string
          expires_at: string
          id: string
          idempotency_key: string
          request_hash: string
          response_body: Json | null
          response_status: number
        }
        Insert: {
          created_at?: string
          endpoint: string
          expires_at: string
          id?: string
          idempotency_key: string
          request_hash: string
          response_body?: Json | null
          response_status: number
        }
        Update: {
          created_at?: string
          endpoint?: string
          expires_at?: string
          id?: string
          idempotency_key?: string
          request_hash?: string
          response_body?: Json | null
          response_status?: number
        }
        Relationships: []
      }
      kpis: {
        Row: {
          availability_percent: number | null
          cash_variance_amount: number | null
          created_at: string
          date: string
          id: string
          queue_time_minutes: number | null
          sales_amount: number | null
          sco_uptime_percent: number | null
          shrinkage_percent: number | null
          store_id: string
          updated_at: string
        }
        Insert: {
          availability_percent?: number | null
          cash_variance_amount?: number | null
          created_at?: string
          date: string
          id?: string
          queue_time_minutes?: number | null
          sales_amount?: number | null
          sco_uptime_percent?: number | null
          shrinkage_percent?: number | null
          store_id: string
          updated_at?: string
        }
        Update: {
          availability_percent?: number | null
          cash_variance_amount?: number | null
          created_at?: string
          date?: string
          id?: string
          queue_time_minutes?: number | null
          sales_amount?: number | null
          sco_uptime_percent?: number | null
          shrinkage_percent?: number | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kpis_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          task_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          task_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          task_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          category: Database["public"]["Enums"]["order_category"]
          created_at: string
          created_by: string
          id: string
          items: Json | null
          notes: string | null
          order_date: string
          status: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["order_category"]
          created_at?: string
          created_by: string
          id?: string
          items?: Json | null
          notes?: string | null
          order_date: string
          status?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["order_category"]
          created_at?: string
          created_by?: string
          id?: string
          items?: Json | null
          notes?: string | null
          order_date?: string
          status?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          store_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          code: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          region_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          region_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          region_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          created_at: string
          endpoint: string
          error_message: string | null
          id: string
          latency_ms: number
          metadata: Json | null
          method: string
          payload_hash: string | null
          request_id: string | null
          status: number
        }
        Insert: {
          created_at?: string
          endpoint: string
          error_message?: string | null
          id?: string
          latency_ms: number
          metadata?: Json | null
          method: string
          payload_hash?: string | null
          request_id?: string | null
          status: number
        }
        Update: {
          created_at?: string
          endpoint?: string
          error_message?: string | null
          id?: string
          latency_ms?: number
          metadata?: Json | null
          method?: string
          payload_hash?: string | null
          request_id?: string | null
          status?: number
        }
        Relationships: []
      }
      task_history: {
        Row: {
          action: string
          comments: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["task_status"] | null
          old_status: Database["public"]["Enums"]["task_status"] | null
          task_id: string
          user_id: string
        }
        Insert: {
          action: string
          comments?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["task_status"] | null
          old_status?: Database["public"]["Enums"]["task_status"] | null
          task_id: string
          user_id: string
        }
        Update: {
          action?: string
          comments?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["task_status"] | null
          old_status?: Database["public"]["Enums"]["task_status"] | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_scheduling_rules: {
        Row: {
          active: boolean | null
          category: string
          created_at: string
          id: string
          name: string
          region_id: string | null
          schedule_pattern: Json
          store_group: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string
          id?: string
          name: string
          region_id?: string | null
          schedule_pattern: Json
          store_group?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string
          id?: string
          name?: string
          region_id?: string | null
          schedule_pattern?: Json
          store_group?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_scheduling_rules_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      task_sla_violations: {
        Row: {
          created_at: string
          hours_delayed: number
          id: string
          notified_at: string | null
          notified_users: string[] | null
          resolved_at: string | null
          severity: string
          task_id: string
          violation_type: string
        }
        Insert: {
          created_at?: string
          hours_delayed: number
          id?: string
          notified_at?: string | null
          notified_users?: string[] | null
          resolved_at?: string | null
          severity: string
          task_id: string
          violation_type: string
        }
        Update: {
          created_at?: string
          hours_delayed?: number
          id?: string
          notified_at?: string | null
          notified_users?: string[] | null
          resolved_at?: string | null
          severity?: string
          task_id?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_sla_violations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          description: string | null
          dow: string[] | null
          frequency: string
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          requires_gps: boolean | null
          requires_image: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dow?: string[] | null
          frequency?: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          requires_gps?: boolean | null
          requires_image?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dow?: string[] | null
          frequency?: string
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          requires_gps?: boolean | null
          requires_image?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          comments: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          store_id: string
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          comments?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          store_id: string
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          comments?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          store_id?: string
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_task_sla_violations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_idempotency_keys: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_region_stores: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_user_store_id: {
        Args: { _user_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      should_create_task_today: {
        Args: { template_dow: string[]; template_frequency: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "store_manager" | "regional_supervisor" | "hq_administrator"
      order_category:
        | "produce"
        | "bakery"
        | "dairy"
        | "meat"
        | "frozen"
        | "dry_goods"
        | "other"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status: "not_started" | "in_progress" | "completed"
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
    Enums: {
      app_role: ["store_manager", "regional_supervisor", "hq_administrator"],
      order_category: [
        "produce",
        "bakery",
        "dairy",
        "meat",
        "frozen",
        "dry_goods",
        "other",
      ],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: ["not_started", "in_progress", "completed"],
    },
  },
} as const
