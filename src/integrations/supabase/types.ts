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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      course_rules: {
        Row: {
          base_unit: string
          created_at: string
          formula_json: Json
          id: string
          rule_name: string
          updated_at: string
        }
        Insert: {
          base_unit: string
          created_at?: string
          formula_json: Json
          id?: string
          rule_name: string
          updated_at?: string
        }
        Update: {
          base_unit?: string
          created_at?: string
          formula_json?: Json
          id?: string
          rule_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      epi_assumptions: {
        Row: {
          created_at: string
          id: string
          indicator: string
          program: string | null
          source_url: string | null
          unit: string | null
          updated_at: string
          value: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          indicator: string
          program?: string | null
          source_url?: string | null
          unit?: string | null
          updated_at?: string
          value: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          indicator?: string
          program?: string | null
          source_url?: string | null
          unit?: string | null
          updated_at?: string
          value?: number
          year?: number
        }
        Relationships: []
      }
      ethiopia_2025_2026: {
        Row: {
          cost: number | null
          created_at: string
          facility: string | null
          id: string
          import_job_id: string | null
          price: number | null
          procurement_source: string | null
          product_category: string | null
          product_name: string | null
          quantity: number | null
          region: string | null
          unit: string | null
          updated_at: string
          woreda: string | null
          zone: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string
          facility?: string | null
          id?: string
          import_job_id?: string | null
          price?: number | null
          procurement_source?: string | null
          product_category?: string | null
          product_name?: string | null
          quantity?: number | null
          region?: string | null
          unit?: string | null
          updated_at?: string
          woreda?: string | null
          zone?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string
          facility?: string | null
          id?: string
          import_job_id?: string | null
          price?: number | null
          procurement_source?: string | null
          product_category?: string | null
          product_name?: string | null
          quantity?: number | null
          region?: string | null
          unit?: string | null
          updated_at?: string
          woreda?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Ethiopia2025/2026_import_job_id_fkey"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          code: string | null
          created_at: string | null
          id: string
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          id?: string
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facility: {
        Row: {
          created_at: string | null
          facility_code: string | null
          facility_id: number
          facility_name: string
          facility_type: string | null
          updated_at: string | null
          woreda_id: number | null
        }
        Insert: {
          created_at?: string | null
          facility_code?: string | null
          facility_id?: number
          facility_name: string
          facility_type?: string | null
          updated_at?: string | null
          woreda_id?: number | null
        }
        Update: {
          created_at?: string | null
          facility_code?: string | null
          facility_id?: number
          facility_name?: string
          facility_type?: string | null
          updated_at?: string | null
          woreda_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_woreda_id_fkey"
            columns: ["woreda_id"]
            isOneToOne: false
            referencedRelation: "woreda"
            referencedColumns: ["woreda_id"]
          },
        ]
      }
      forecast_rows: {
        Row: {
          created_at: string
          forecasted_quantity: number | null
          forecasted_total: number | null
          id: string
          observed_difference: number | null
          opian_total: number | null
          product_list: string
          program: string
          unit: string | null
          unit_price: number | null
          updated_at: string
          user_id: string | null
          year: string | null
        }
        Insert: {
          created_at?: string
          forecasted_quantity?: number | null
          forecasted_total?: number | null
          id?: string
          observed_difference?: number | null
          opian_total?: number | null
          product_list: string
          program: string
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string | null
          year?: string | null
        }
        Update: {
          created_at?: string
          forecasted_quantity?: number | null
          forecasted_total?: number | null
          id?: string
          observed_difference?: number | null
          opian_total?: number | null
          product_list?: string
          program?: string
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string | null
          year?: string | null
        }
        Relationships: []
      }
      import_errors: {
        Row: {
          created_at: string | null
          error_message: string
          error_type: string
          id: string
          import_job_id: string | null
          row_data: Json | null
          row_number: number
        }
        Insert: {
          created_at?: string | null
          error_message: string
          error_type: string
          id?: string
          import_job_id?: string | null
          row_data?: Json | null
          row_number: number
        }
        Update: {
          created_at?: string | null
          error_message?: string
          error_type?: string
          id?: string
          import_job_id?: string | null
          row_data?: Json | null
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_errors_import_job_id_fkey"
            columns: ["import_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      import_job_chunks: {
        Row: {
          chunk_index: number
          completed_at: string | null
          created_at: string
          end_row: number
          error_message: string | null
          id: string
          parent_job_id: string
          retry_count: number
          rows_processed: number
          start_row: number
          status: string
          updated_at: string
        }
        Insert: {
          chunk_index: number
          completed_at?: string | null
          created_at?: string
          end_row: number
          error_message?: string | null
          id?: string
          parent_job_id: string
          retry_count?: number
          rows_processed?: number
          start_row: number
          status?: string
          updated_at?: string
        }
        Update: {
          chunk_index?: number
          completed_at?: string | null
          created_at?: string
          end_row?: number
          error_message?: string | null
          id?: string
          parent_job_id?: string
          retry_count?: number
          rows_processed?: number
          start_row?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_job_chunks_parent_job_id_fkey"
            columns: ["parent_job_id"]
            isOneToOne: false
            referencedRelation: "import_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_summary: Json | null
          failed_rows: number | null
          file_path: string | null
          file_size: number | null
          filename: string
          id: string
          processed_rows: number | null
          processing_mode: string | null
          started_at: string | null
          status: string
          successful_rows: number | null
          total_rows: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_summary?: Json | null
          failed_rows?: number | null
          file_path?: string | null
          file_size?: number | null
          filename: string
          id?: string
          processed_rows?: number | null
          processing_mode?: string | null
          started_at?: string | null
          status?: string
          successful_rows?: number | null
          total_rows?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_summary?: Json | null
          failed_rows?: number | null
          file_path?: string | null
          file_size?: number | null
          filename?: string
          id?: string
          processed_rows?: number | null
          processing_mode?: string | null
          started_at?: string | null
          status?: string
          successful_rows?: number | null
          total_rows?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      procurement: {
        Row: {
          batch_id: string | null
          created_at: string | null
          facility_id: number
          fiscal_year: number | null
          miazia_price: number | null
          price: number | null
          procurement_id: number
          procurement_source: string
          product_id: number
          quantity: number | null
          reporting_date: string
          updated_at: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          facility_id: number
          fiscal_year?: number | null
          miazia_price?: number | null
          price?: number | null
          procurement_id?: number
          procurement_source: string
          product_id: number
          quantity?: number | null
          reporting_date: string
          updated_at?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          facility_id?: number
          fiscal_year?: number | null
          miazia_price?: number | null
          price?: number | null
          procurement_id?: number
          procurement_source?: string
          product_id?: number
          quantity?: number | null
          reporting_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurement_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "procurement_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product"
            referencedColumns: ["product_id"]
          },
        ]
      }
      procurement_data: {
        Row: {
          created_at: string | null
          facility_id: string | null
          id: string
          order_date: string | null
          procurement_source: string | null
          product_id: string | null
          quantity: number | null
          supplier_id: string | null
          unit_cost: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          facility_id?: string | null
          id?: string
          order_date?: string | null
          procurement_source?: string | null
          product_id?: string | null
          quantity?: number | null
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          facility_id?: string | null
          id?: string
          order_date?: string | null
          procurement_source?: string | null
          product_id?: string | null
          quantity?: number | null
          supplier_id?: string | null
          unit_cost?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product: {
        Row: {
          category_id: number | null
          created_at: string | null
          product_code: string | null
          product_id: number
          product_name: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          product_code?: string | null
          product_id?: number
          product_name: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          product_code?: string | null
          product_id?: number
          product_name?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["category_id"]
          },
        ]
      }
      product_category: {
        Row: {
          category_description: string | null
          category_id: number
          category_name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          category_description?: string | null
          category_id?: number
          category_name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          category_description?: string | null
          category_id?: number
          category_name?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_mappings: {
        Row: {
          confidence: number | null
          created_at: string
          forecast_product_list: string
          id: string
          notes: string | null
          product_reference_id: string | null
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          forecast_product_list: string
          id?: string
          notes?: string | null
          product_reference_id?: string | null
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          forecast_product_list?: string
          id?: string
          notes?: string | null
          product_reference_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_mappings_product_reference_id_fkey"
            columns: ["product_reference_id"]
            isOneToOne: false
            referencedRelation: "product_reference"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reference: {
        Row: {
          atc_code: string | null
          base_unit: string
          canonical_name: string
          course_rule_id: string | null
          created_at: string
          default_unit: string | null
          id: string
          price_benchmark_high: number | null
          price_benchmark_low: number | null
          program: string | null
          recommended_formulation: string | null
          unit_to_base_factor: number
          updated_at: string
        }
        Insert: {
          atc_code?: string | null
          base_unit: string
          canonical_name: string
          course_rule_id?: string | null
          created_at?: string
          default_unit?: string | null
          id?: string
          price_benchmark_high?: number | null
          price_benchmark_low?: number | null
          program?: string | null
          recommended_formulation?: string | null
          unit_to_base_factor?: number
          updated_at?: string
        }
        Update: {
          atc_code?: string | null
          base_unit?: string
          canonical_name?: string
          course_rule_id?: string | null
          created_at?: string
          default_unit?: string | null
          id?: string
          price_benchmark_high?: number | null
          price_benchmark_low?: number | null
          program?: string | null
          recommended_formulation?: string | null
          unit_to_base_factor?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reference_course_rule_id_fkey"
            columns: ["course_rule_id"]
            isOneToOne: false
            referencedRelation: "course_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          id: string
          name: string
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          name: string
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          id?: string
          name?: string
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      region: {
        Row: {
          created_at: string | null
          region_id: number
          region_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          region_id?: number
          region_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          region_id?: number
          region_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      validation_results: {
        Row: {
          checks_run: string[] | null
          computed_fields: Json | null
          coverage_ratio: number | null
          created_at: string
          duplication_adjustment: Json | null
          flags: string[] | null
          forecast_row_id: string | null
          id: string
          paired_ratio_check: Json | null
          price_zscore: number | null
          updated_at: string
        }
        Insert: {
          checks_run?: string[] | null
          computed_fields?: Json | null
          coverage_ratio?: number | null
          created_at?: string
          duplication_adjustment?: Json | null
          flags?: string[] | null
          forecast_row_id?: string | null
          id?: string
          paired_ratio_check?: Json | null
          price_zscore?: number | null
          updated_at?: string
        }
        Update: {
          checks_run?: string[] | null
          computed_fields?: Json | null
          coverage_ratio?: number | null
          created_at?: string
          duplication_adjustment?: Json | null
          flags?: string[] | null
          forecast_row_id?: string | null
          id?: string
          paired_ratio_check?: Json | null
          price_zscore?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_results_forecast_row_id_fkey"
            columns: ["forecast_row_id"]
            isOneToOne: false
            referencedRelation: "forecast_rows"
            referencedColumns: ["id"]
          },
        ]
      }
      woreda: {
        Row: {
          created_at: string | null
          updated_at: string | null
          woreda_id: number
          woreda_name: string
          zone_id: number
        }
        Insert: {
          created_at?: string | null
          updated_at?: string | null
          woreda_id?: number
          woreda_name: string
          zone_id: number
        }
        Update: {
          created_at?: string | null
          updated_at?: string | null
          woreda_id?: number
          woreda_name?: string
          zone_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "woreda_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone"
            referencedColumns: ["zone_id"]
          },
        ]
      }
      zone: {
        Row: {
          created_at: string | null
          region_id: number
          updated_at: string | null
          zone_id: number
          zone_name: string
        }
        Insert: {
          created_at?: string | null
          region_id: number
          updated_at?: string | null
          zone_id?: number
          zone_name: string
        }
        Update: {
          created_at?: string | null
          region_id?: number
          updated_at?: string | null
          zone_id?: number
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["region_id"]
          },
        ]
      }
    }
    Views: {
      procurement_analytics: {
        Row: {
          category_name: string | null
          facility_code: string | null
          facility_name: string | null
          facility_type: string | null
          fiscal_year: number | null
          miazia_price: number | null
          price: number | null
          procurement_id: number | null
          procurement_source: string | null
          product_code: string | null
          product_name: string | null
          quantity: number | null
          region_name: string | null
          reporting_date: string | null
          total_cost: number | null
          unit: string | null
          woreda_name: string | null
          zone_name: string | null
        }
        Relationships: []
      }
      procurement_monthly_summary: {
        Row: {
          avg_price: number | null
          month: string | null
          procurement_source: string | null
          region_name: string | null
          total_records: number | null
          total_value: number | null
          unique_facilities: number | null
          unique_products: number | null
        }
        Relationships: []
      }
      regional_procurement_summary: {
        Row: {
          avg_price: number | null
          facility_count: number | null
          fiscal_year: number | null
          procurement_source: string | null
          product_count: number | null
          region_name: string | null
          total_quantity: number | null
          total_value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_procurement_summary: {
        Args: {
          p_fiscal_year?: number
          p_region_name?: string
          p_procurement_source?: string
        }
        Returns: {
          total_records: number
          total_value: number
          avg_price: number
          total_facilities: number
          total_products: number
          epss_percentage: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      refresh_procurement_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "analyst" | "viewer"
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
      app_role: ["admin", "analyst", "viewer"],
    },
  },
} as const
