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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_type_products: {
        Row: {
          account_type_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          account_type_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          account_type_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_type_products_account_type_id_fkey"
            columns: ["account_type_id"]
            isOneToOne: false
            referencedRelation: "account_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_type_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_reference"
            referencedColumns: ["id"]
          },
        ]
      }
      account_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_assignments: {
        Row: {
          created_at: string
          id: string
          region_id: number | null
          updated_at: string
          user_id: string
          woreda_id: number | null
          zone_id: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          region_id?: number | null
          updated_at?: string
          user_id: string
          woreda_id?: number | null
          zone_id?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          region_id?: number | null
          updated_at?: string
          user_id?: string
          woreda_id?: number | null
          zone_id?: number | null
        }
        Relationships: []
      }
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
      cdss_budget_alignments: {
        Row: {
          adjusted_cost: number
          available_budget: number
          budget_gap: number
          created_at: string
          facility_name: string
          id: string
          original_cost: number
          period: string
          printed_at: string | null
          product_data: Json
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adjusted_cost?: number
          available_budget?: number
          budget_gap?: number
          created_at?: string
          facility_name: string
          id?: string
          original_cost?: number
          period: string
          printed_at?: string | null
          product_data: Json
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adjusted_cost?: number
          available_budget?: number
          budget_gap?: number
          created_at?: string
          facility_name?: string
          id?: string
          original_cost?: number
          period?: string
          printed_at?: string | null
          product_data?: Json
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      commodity_issues: {
        Row: {
          created_at: string
          id: string
          item_description: string
          program: string
          quantity: number | null
          unit: string | null
          updated_at: string
          user_id: string | null
          year: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_description: string
          program: string
          quantity?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
          year?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          item_description?: string
          program?: string
          quantity?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
          year?: string | null
        }
        Relationships: []
      }
      consumption_analytics: {
        Row: {
          adjustments: number
          amc: number | null
          consumption_quantity: number
          created_at: string
          facility_id: number | null
          id: string
          period_end: string
          period_start: string
          product_id: string | null
          stockout_days: number
          updated_at: string
          wastage: number
        }
        Insert: {
          adjustments?: number
          amc?: number | null
          consumption_quantity?: number
          created_at?: string
          facility_id?: number | null
          id?: string
          period_end: string
          period_start: string
          product_id?: string | null
          stockout_days?: number
          updated_at?: string
          wastage?: number
        }
        Update: {
          adjustments?: number
          amc?: number | null
          consumption_quantity?: number
          created_at?: string
          facility_id?: number | null
          id?: string
          period_end?: string
          period_start?: string
          product_id?: string | null
          stockout_days?: number
          updated_at?: string
          wastage?: number
        }
        Relationships: [
          {
            foreignKeyName: "consumption_analytics_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "consumption_analytics_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          country_code: string | null
          country_id: number
          country_name: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          country_code?: string | null
          country_id?: number
          country_name: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          country_code?: string | null
          country_id?: number
          country_name?: string
          created_at?: string | null
          updated_at?: string | null
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
      departments: {
        Row: {
          active_status: boolean | null
          created_at: string | null
          department_code: string | null
          department_name: string
          department_type: string | null
          facility_id: number
          head_of_department: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          active_status?: boolean | null
          created_at?: string | null
          department_code?: string | null
          department_name: string
          department_type?: string | null
          facility_id: number
          head_of_department?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          active_status?: boolean | null
          created_at?: string | null
          department_code?: string | null
          department_name?: string
          department_type?: string | null
          facility_id?: number
          head_of_department?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
        ]
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
      epss_regional_hubs: {
        Row: {
          active_status: boolean
          address: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          hub_code: string
          hub_name: string
          id: string
          latitude: number | null
          longitude: number | null
          region_id: number | null
          updated_at: string
        }
        Insert: {
          active_status?: boolean
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          hub_code: string
          hub_name: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          region_id?: number | null
          updated_at?: string
        }
        Update: {
          active_status?: boolean
          address?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          hub_code?: string
          hub_name?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          region_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "epss_regional_hubs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["region_id"]
          },
        ]
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
          country_id: number | null
          created_at: string | null
          facility_code: string | null
          facility_id: number
          facility_name: string
          facility_type: string | null
          latitude: number | null
          level: string | null
          longitude: number | null
          ownership: string | null
          ownership_type:
            | Database["public"]["Enums"]["facility_ownership_type"]
            | null
          region_id: number | null
          regional_hub_id: string | null
          updated_at: string | null
          woreda_id: number | null
          zone_id: number | null
        }
        Insert: {
          country_id?: number | null
          created_at?: string | null
          facility_code?: string | null
          facility_id?: number
          facility_name: string
          facility_type?: string | null
          latitude?: number | null
          level?: string | null
          longitude?: number | null
          ownership?: string | null
          ownership_type?:
            | Database["public"]["Enums"]["facility_ownership_type"]
            | null
          region_id?: number | null
          regional_hub_id?: string | null
          updated_at?: string | null
          woreda_id?: number | null
          zone_id?: number | null
        }
        Update: {
          country_id?: number | null
          created_at?: string | null
          facility_code?: string | null
          facility_id?: number
          facility_name?: string
          facility_type?: string | null
          latitude?: number | null
          level?: string | null
          longitude?: number | null
          ownership?: string | null
          ownership_type?:
            | Database["public"]["Enums"]["facility_ownership_type"]
            | null
          region_id?: number | null
          regional_hub_id?: string | null
          updated_at?: string | null
          woreda_id?: number | null
          zone_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facility_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "facility_regional_hub_id_fkey"
            columns: ["regional_hub_id"]
            isOneToOne: false
            referencedRelation: "epss_regional_hubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facility_woreda_id_fkey"
            columns: ["woreda_id"]
            isOneToOne: false
            referencedRelation: "woreda"
            referencedColumns: ["woreda_id"]
          },
          {
            foreignKeyName: "facility_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone"
            referencedColumns: ["zone_id"]
          },
          {
            foreignKeyName: "fk_facility_country"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_id"]
          },
          {
            foreignKeyName: "fk_facility_region"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "fk_facility_woreda"
            columns: ["woreda_id"]
            isOneToOne: false
            referencedRelation: "woreda"
            referencedColumns: ["woreda_id"]
          },
          {
            foreignKeyName: "fk_facility_zone"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone"
            referencedColumns: ["zone_id"]
          },
        ]
      }
      finance_status: {
        Row: {
          amount_transferred: number
          budget_approved: boolean
          budget_approved_date: string | null
          created_at: string
          id: string
          request_id: string
          updated_at: string
        }
        Insert: {
          amount_transferred?: number
          budget_approved?: boolean
          budget_approved_date?: string | null
          created_at?: string
          id?: string
          request_id: string
          updated_at?: string
        }
        Update: {
          amount_transferred?: number
          budget_approved?: boolean
          budget_approved_date?: string | null
          created_at?: string
          id?: string
          request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_status_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      forecast_adjustments: {
        Row: {
          adjusted_at: string
          adjusted_by: string
          adjustment_type: string
          forecast_row_id: string
          forecast_summary_id: string
          id: string
          new_value: number
          old_value: number
          reason: string | null
        }
        Insert: {
          adjusted_at?: string
          adjusted_by: string
          adjustment_type?: string
          forecast_row_id: string
          forecast_summary_id: string
          id?: string
          new_value: number
          old_value: number
          reason?: string | null
        }
        Update: {
          adjusted_at?: string
          adjusted_by?: string
          adjustment_type?: string
          forecast_row_id?: string
          forecast_summary_id?: string
          id?: string
          new_value?: number
          old_value?: number
          reason?: string | null
        }
        Relationships: []
      }
      forecast_data_sources: {
        Row: {
          confidence_score: number | null
          created_at: string
          data_quality_flags: Json | null
          forecast_row_id: string | null
          id: string
          source_reference_id: string | null
          source_type: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          data_quality_flags?: Json | null
          forecast_row_id?: string | null
          id?: string
          source_reference_id?: string | null
          source_type: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          data_quality_flags?: Json | null
          forecast_row_id?: string | null
          id?: string
          source_reference_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "forecast_data_sources_forecast_row_id_fkey"
            columns: ["forecast_row_id"]
            isOneToOne: false
            referencedRelation: "forecast_rows"
            referencedColumns: ["id"]
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
      forecast_summaries: {
        Row: {
          account_type: string | null
          available_budget: number | null
          created_at: string
          current_total_value: number
          description: string | null
          facility_name: string | null
          forecast_duration: number
          id: string
          name: string
          original_total_value: number
          status: string
          total_line_items: number
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: string | null
          available_budget?: number | null
          created_at?: string
          current_total_value?: number
          description?: string | null
          facility_name?: string | null
          forecast_duration?: number
          id?: string
          name: string
          original_total_value?: number
          status?: string
          total_line_items?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string | null
          available_budget?: number | null
          created_at?: string
          current_total_value?: number
          description?: string | null
          facility_name?: string | null
          forecast_duration?: number
          id?: string
          name?: string
          original_total_value?: number
          status?: string
          total_line_items?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forecast_summary_items: {
        Row: {
          created_at: string
          current_price: number
          current_quantity: number
          current_total: number
          forecast_row_id: string
          forecast_summary_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_price: number
          current_quantity: number
          current_total: number
          forecast_row_id: string
          forecast_summary_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_price?: number
          current_quantity?: number
          current_total?: number
          forecast_row_id?: string
          forecast_summary_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      funding_sources: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
      inbound_master_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          payload: Json
          processed: boolean
          processed_at: string | null
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          payload: Json
          processed?: boolean
          processed_at?: string | null
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_balances: {
        Row: {
          average_monthly_consumption: number | null
          current_stock: number
          facility_id: number | null
          id: string
          last_consumption_date: string | null
          last_receipt_date: string | null
          last_transaction_date: string | null
          last_updated: string
          max_level: number
          maximum_stock_level: number | null
          minimum_stock_level: number | null
          product_id: string | null
          reorder_level: number
          reserved_stock: number | null
          safety_stock_level: number | null
        }
        Insert: {
          average_monthly_consumption?: number | null
          current_stock?: number
          facility_id?: number | null
          id?: string
          last_consumption_date?: string | null
          last_receipt_date?: string | null
          last_transaction_date?: string | null
          last_updated?: string
          max_level?: number
          maximum_stock_level?: number | null
          minimum_stock_level?: number | null
          product_id?: string | null
          reorder_level?: number
          reserved_stock?: number | null
          safety_stock_level?: number | null
        }
        Update: {
          average_monthly_consumption?: number | null
          current_stock?: number
          facility_id?: number | null
          id?: string
          last_consumption_date?: string | null
          last_receipt_date?: string | null
          last_transaction_date?: string | null
          last_updated?: string
          max_level?: number
          maximum_stock_level?: number | null
          minimum_stock_level?: number | null
          product_id?: string | null
          reorder_level?: number
          reserved_stock?: number | null
          safety_stock_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_balances_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "inventory_balances_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          approved_by: string | null
          batch_number: string | null
          condition_at_receipt: string | null
          created_at: string
          department: string | null
          destination_facility_id: number | null
          donation_source: string | null
          expiry_date: string | null
          facility_id: number | null
          funding_source: string | null
          grn_number: string | null
          id: string
          invoice_number: string | null
          manufacturer_batch_number: string | null
          notes: string | null
          product_id: string | null
          quantity: number
          received_by: string | null
          reference_number: string | null
          serial_number: string | null
          source_facility_id: number | null
          storage_location: string | null
          supplier_batch_number: string | null
          supplier_name: string | null
          temperature_at_receipt: number | null
          transaction_date: string
          transaction_type: string
          unit_cost: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_by?: string | null
          batch_number?: string | null
          condition_at_receipt?: string | null
          created_at?: string
          department?: string | null
          destination_facility_id?: number | null
          donation_source?: string | null
          expiry_date?: string | null
          facility_id?: number | null
          funding_source?: string | null
          grn_number?: string | null
          id?: string
          invoice_number?: string | null
          manufacturer_batch_number?: string | null
          notes?: string | null
          product_id?: string | null
          quantity: number
          received_by?: string | null
          reference_number?: string | null
          serial_number?: string | null
          source_facility_id?: number | null
          storage_location?: string | null
          supplier_batch_number?: string | null
          supplier_name?: string | null
          temperature_at_receipt?: number | null
          transaction_date?: string
          transaction_type: string
          unit_cost?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_by?: string | null
          batch_number?: string | null
          condition_at_receipt?: string | null
          created_at?: string
          department?: string | null
          destination_facility_id?: number | null
          donation_source?: string | null
          expiry_date?: string | null
          facility_id?: number | null
          funding_source?: string | null
          grn_number?: string | null
          id?: string
          invoice_number?: string | null
          manufacturer_batch_number?: string | null
          notes?: string | null
          product_id?: string | null
          quantity?: number
          received_by?: string | null
          reference_number?: string | null
          serial_number?: string | null
          source_facility_id?: number | null
          storage_location?: string | null
          supplier_batch_number?: string | null
          supplier_name?: string | null
          temperature_at_receipt?: number | null
          transaction_date?: string
          transaction_type?: string
          unit_cost?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_destination_facility_id_fkey"
            columns: ["destination_facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "inventory_transactions_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_source_facility_id_fkey"
            columns: ["source_facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
        ]
      }
      outbound_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          last_error: string | null
          payload: Json
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          last_error?: string | null
          payload: Json
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          last_error?: string | null
          payload?: Json
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pipeline_asn_headers: {
        Row: {
          created_at: string
          created_by: string
          expected_date: string | null
          facility_id: number
          id: string
          program_id: string
          status: string
          supplier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          expected_date?: string | null
          facility_id: number
          id?: string
          program_id: string
          status?: string
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expected_date?: string | null
          facility_id?: number
          id?: string
          program_id?: string
          status?: string
          supplier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_asn_lines: {
        Row: {
          created_at: string
          expiry_date: string | null
          header_id: string
          id: string
          item_id: string
          lot: string | null
          quantity: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          header_id: string
          id?: string
          item_id: string
          lot?: string | null
          quantity: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          header_id?: string
          id?: string
          item_id?: string
          lot?: string | null
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_asn_lines_header_id_fkey"
            columns: ["header_id"]
            isOneToOne: false
            referencedRelation: "pipeline_asn_headers"
            referencedColumns: ["id"]
          },
        ]
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
      procurement_events: {
        Row: {
          actor_id: string
          arrival_date: string | null
          award_date: string | null
          award_value: number | null
          clearance_date: string | null
          created_at: string
          grv_date: string | null
          grv_number: string | null
          id: string
          invoice_date: string | null
          payment_date: string | null
          payment_ref: string | null
          po_date: string | null
          po_number: string | null
          po_value: number | null
          received_quantity: number | null
          request_id: string
          shipment_date: string | null
          stage: string
          supplier: string | null
          tender_close_date: string | null
          tender_open_date: string | null
          tender_ref: string | null
          updated_at: string
        }
        Insert: {
          actor_id?: string
          arrival_date?: string | null
          award_date?: string | null
          award_value?: number | null
          clearance_date?: string | null
          created_at?: string
          grv_date?: string | null
          grv_number?: string | null
          id?: string
          invoice_date?: string | null
          payment_date?: string | null
          payment_ref?: string | null
          po_date?: string | null
          po_number?: string | null
          po_value?: number | null
          received_quantity?: number | null
          request_id: string
          shipment_date?: string | null
          stage: string
          supplier?: string | null
          tender_close_date?: string | null
          tender_open_date?: string | null
          tender_ref?: string | null
          updated_at?: string
        }
        Update: {
          actor_id?: string
          arrival_date?: string | null
          award_date?: string | null
          award_value?: number | null
          clearance_date?: string | null
          created_at?: string
          grv_date?: string | null
          grv_number?: string | null
          id?: string
          invoice_date?: string | null
          payment_date?: string | null
          payment_ref?: string | null
          po_date?: string | null
          po_number?: string | null
          po_value?: number | null
          received_quantity?: number | null
          request_id?: string
          shipment_date?: string | null
          stage?: string
          supplier?: string | null
          tender_close_date?: string | null
          tender_open_date?: string | null
          tender_ref?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "procurement_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_request_items: {
        Row: {
          created_at: string
          forecast_row_id: string | null
          id: string
          item_name: string
          line_subtotal: number
          override: boolean
          override_reason: string | null
          request_id: string
          requested_quantity: number
          unit: string | null
          updated_at: string
          updated_unit_price: number
        }
        Insert: {
          created_at?: string
          forecast_row_id?: string | null
          id?: string
          item_name: string
          line_subtotal: number
          override?: boolean
          override_reason?: string | null
          request_id: string
          requested_quantity: number
          unit?: string | null
          updated_at?: string
          updated_unit_price: number
        }
        Update: {
          created_at?: string
          forecast_row_id?: string | null
          id?: string
          item_name?: string
          line_subtotal?: number
          override?: boolean
          override_reason?: string | null
          request_id?: string
          requested_quantity?: number
          unit?: string | null
          updated_at?: string
          updated_unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "procurement_request_items_forecast_row_id_fkey"
            columns: ["forecast_row_id"]
            isOneToOne: false
            referencedRelation: "forecast_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_requests: {
        Row: {
          created_at: string
          current_stage: string
          funding_source_id: string | null
          id: string
          notes: string | null
          program_id: string
          psm_amount: number
          psm_percent: number
          request_subtotal: number
          request_total: number
          status: string
          submitted_at: string | null
          updated_at: string
          user_id: string | null
          year: string
        }
        Insert: {
          created_at?: string
          current_stage?: string
          funding_source_id?: string | null
          id?: string
          notes?: string | null
          program_id: string
          psm_amount?: number
          psm_percent?: number
          request_subtotal?: number
          request_total?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
          year: string
        }
        Update: {
          created_at?: string
          current_stage?: string
          funding_source_id?: string | null
          id?: string
          notes?: string | null
          program_id?: string
          psm_amount?: number
          psm_percent?: number
          request_subtotal?: number
          request_total?: number
          status?: string
          submitted_at?: string | null
          updated_at?: string
          user_id?: string | null
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "procurement_requests_funding_source_id_fkey"
            columns: ["funding_source_id"]
            isOneToOne: false
            referencedRelation: "funding_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_requests_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
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
      product_issues: {
        Row: {
          created_at: string
          id: string
          items_description: string
          program: string
          quantity: number | null
          unit: string | null
          updated_at: string
          user_id: string | null
          year: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          items_description: string
          program: string
          quantity?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
          year?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          items_description?: string
          program?: string
          quantity?: number | null
          unit?: string | null
          updated_at?: string
          user_id?: string | null
          year?: string | null
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
      product_prices: {
        Row: {
          created_at: string
          created_by: string | null
          effective_date: string
          id: string
          notes: string | null
          price: number
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          notes?: string | null
          price: number
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_date?: string
          id?: string
          notes?: string | null
          price?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_reference"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reference: {
        Row: {
          abc_classification: string | null
          active: boolean
          atc_code: string | null
          barcode_type: string | null
          base_unit: string
          buffer_stock_level: number | null
          canonical_name: string
          code: string | null
          controlled_substance: boolean | null
          course_rule_id: string | null
          created_at: string
          criticality_level: string | null
          default_unit: string | null
          effective_from: string | null
          effective_to: string | null
          form: string | null
          gtin: string | null
          id: string
          lead_time_days: number | null
          maximum_stock_level: number | null
          minimum_order_quantity: number | null
          narcotics_classification: string | null
          pack_size: number | null
          price_benchmark_high: number | null
          price_benchmark_low: number | null
          product_type: string | null
          program: string | null
          recommended_formulation: string | null
          refrigeration_required: boolean | null
          reorder_point: number | null
          shelf_life_months: number | null
          storage_humidity_max: number | null
          storage_humidity_min: number | null
          storage_temperature_max: number | null
          storage_temperature_min: number | null
          strength: string | null
          tracer_flag: boolean
          unit_to_base_factor: number
          uom: string | null
          updated_at: string
          ven_classification: string | null
        }
        Insert: {
          abc_classification?: string | null
          active?: boolean
          atc_code?: string | null
          barcode_type?: string | null
          base_unit: string
          buffer_stock_level?: number | null
          canonical_name: string
          code?: string | null
          controlled_substance?: boolean | null
          course_rule_id?: string | null
          created_at?: string
          criticality_level?: string | null
          default_unit?: string | null
          effective_from?: string | null
          effective_to?: string | null
          form?: string | null
          gtin?: string | null
          id?: string
          lead_time_days?: number | null
          maximum_stock_level?: number | null
          minimum_order_quantity?: number | null
          narcotics_classification?: string | null
          pack_size?: number | null
          price_benchmark_high?: number | null
          price_benchmark_low?: number | null
          product_type?: string | null
          program?: string | null
          recommended_formulation?: string | null
          refrigeration_required?: boolean | null
          reorder_point?: number | null
          shelf_life_months?: number | null
          storage_humidity_max?: number | null
          storage_humidity_min?: number | null
          storage_temperature_max?: number | null
          storage_temperature_min?: number | null
          strength?: string | null
          tracer_flag?: boolean
          unit_to_base_factor?: number
          uom?: string | null
          updated_at?: string
          ven_classification?: string | null
        }
        Update: {
          abc_classification?: string | null
          active?: boolean
          atc_code?: string | null
          barcode_type?: string | null
          base_unit?: string
          buffer_stock_level?: number | null
          canonical_name?: string
          code?: string | null
          controlled_substance?: boolean | null
          course_rule_id?: string | null
          created_at?: string
          criticality_level?: string | null
          default_unit?: string | null
          effective_from?: string | null
          effective_to?: string | null
          form?: string | null
          gtin?: string | null
          id?: string
          lead_time_days?: number | null
          maximum_stock_level?: number | null
          minimum_order_quantity?: number | null
          narcotics_classification?: string | null
          pack_size?: number | null
          price_benchmark_high?: number | null
          price_benchmark_low?: number | null
          product_type?: string | null
          program?: string | null
          recommended_formulation?: string | null
          refrigeration_required?: boolean | null
          reorder_point?: number | null
          shelf_life_months?: number | null
          storage_humidity_max?: number | null
          storage_humidity_min?: number | null
          storage_temperature_max?: number | null
          storage_temperature_min?: number | null
          strength?: string | null
          tracer_flag?: boolean
          unit_to_base_factor?: number
          uom?: string | null
          updated_at?: string
          ven_classification?: string | null
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
          active_status: boolean | null
          batch_tracking_required: boolean | null
          brand_name: string | null
          category: string | null
          code: string | null
          cold_chain_required: boolean | null
          contraindications: string | null
          controlled_substance: boolean | null
          conversion_factor: number | null
          created_at: string | null
          description: string | null
          dispensing_unit: string | null
          dosage_form: string | null
          essential_medicine: boolean | null
          expiry_tracking_required: boolean | null
          generic_name: string | null
          id: string
          instructions_for_use: string | null
          manufacturer: string | null
          manufacturer_code: string | null
          minimum_shelf_life_days: number | null
          name: string
          pack_size: number | null
          pediatric_formulation: boolean | null
          prescription_required: boolean | null
          procurement_unit: string | null
          product_type: string | null
          registration_number: string | null
          regulatory_status: string | null
          serial_tracking_required: boolean | null
          side_effects: string | null
          standard_cost: number | null
          storage_conditions: string | null
          strength: string | null
          therapeutic_category: string | null
          unit: string | null
          updated_at: string | null
          vat_rate: number | null
          who_prequalified: boolean | null
        }
        Insert: {
          active_status?: boolean | null
          batch_tracking_required?: boolean | null
          brand_name?: string | null
          category?: string | null
          code?: string | null
          cold_chain_required?: boolean | null
          contraindications?: string | null
          controlled_substance?: boolean | null
          conversion_factor?: number | null
          created_at?: string | null
          description?: string | null
          dispensing_unit?: string | null
          dosage_form?: string | null
          essential_medicine?: boolean | null
          expiry_tracking_required?: boolean | null
          generic_name?: string | null
          id?: string
          instructions_for_use?: string | null
          manufacturer?: string | null
          manufacturer_code?: string | null
          minimum_shelf_life_days?: number | null
          name: string
          pack_size?: number | null
          pediatric_formulation?: boolean | null
          prescription_required?: boolean | null
          procurement_unit?: string | null
          product_type?: string | null
          registration_number?: string | null
          regulatory_status?: string | null
          serial_tracking_required?: boolean | null
          side_effects?: string | null
          standard_cost?: number | null
          storage_conditions?: string | null
          strength?: string | null
          therapeutic_category?: string | null
          unit?: string | null
          updated_at?: string | null
          vat_rate?: number | null
          who_prequalified?: boolean | null
        }
        Update: {
          active_status?: boolean | null
          batch_tracking_required?: boolean | null
          brand_name?: string | null
          category?: string | null
          code?: string | null
          cold_chain_required?: boolean | null
          contraindications?: string | null
          controlled_substance?: boolean | null
          conversion_factor?: number | null
          created_at?: string | null
          description?: string | null
          dispensing_unit?: string | null
          dosage_form?: string | null
          essential_medicine?: boolean | null
          expiry_tracking_required?: boolean | null
          generic_name?: string | null
          id?: string
          instructions_for_use?: string | null
          manufacturer?: string | null
          manufacturer_code?: string | null
          minimum_shelf_life_days?: number | null
          name?: string
          pack_size?: number | null
          pediatric_formulation?: boolean | null
          prescription_required?: boolean | null
          procurement_unit?: string | null
          product_type?: string | null
          registration_number?: string | null
          regulatory_status?: string | null
          serial_tracking_required?: boolean | null
          side_effects?: string | null
          standard_cost?: number | null
          storage_conditions?: string | null
          strength?: string | null
          therapeutic_category?: string | null
          unit?: string | null
          updated_at?: string | null
          vat_rate?: number | null
          who_prequalified?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      program_funding_allocations: {
        Row: {
          allocated_amount: number
          created_at: string
          funding_source_id: string
          id: string
          program_id: string
          updated_at: string
          year: string
        }
        Insert: {
          allocated_amount?: number
          created_at?: string
          funding_source_id: string
          id?: string
          program_id: string
          updated_at?: string
          year: string
        }
        Update: {
          allocated_amount?: number
          created_at?: string
          funding_source_id?: string
          id?: string
          program_id?: string
          updated_at?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_funding_allocations_funding_source_id_fkey"
            columns: ["funding_source_id"]
            isOneToOne: false
            referencedRelation: "funding_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_funding_allocations_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_settings: {
        Row: {
          budget_total: number
          created_at: string
          id: string
          last_synced: string | null
          program_id: string
          psm_percent: number
          updated_at: string
          year: string
        }
        Insert: {
          budget_total?: number
          created_at?: string
          id?: string
          last_synced?: string | null
          program_id: string
          psm_percent?: number
          updated_at?: string
          year: string
        }
        Update: {
          budget_total?: number
          created_at?: string
          id?: string
          last_synced?: string | null
          program_id?: string
          psm_percent?: number
          updated_at?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_settings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      region: {
        Row: {
          country_id: number
          created_at: string | null
          region_code: string | null
          region_id: number
          region_name: string
          updated_at: string | null
        }
        Insert: {
          country_id: number
          created_at?: string | null
          region_code?: string | null
          region_id?: number
          region_name: string
          updated_at?: string | null
        }
        Update: {
          country_id?: number
          created_at?: string | null
          region_code?: string | null
          region_id?: number
          region_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_region_country"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_id"]
          },
        ]
      }
      registration_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          created_at: string
          facility_code: string | null
          facility_id: number | null
          facility_name: string | null
          facility_type: string | null
          id: string
          is_new_facility: boolean
          region_id: number | null
          status: string
          updated_at: string
          user_id: string
          user_level: string
          woreda_id: number | null
          zone_id: number | null
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          facility_code?: string | null
          facility_id?: number | null
          facility_name?: string | null
          facility_type?: string | null
          id?: string
          is_new_facility?: boolean
          region_id?: number | null
          status?: string
          updated_at?: string
          user_id: string
          user_level?: string
          woreda_id?: number | null
          zone_id?: number | null
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          created_at?: string
          facility_code?: string | null
          facility_id?: number | null
          facility_name?: string | null
          facility_type?: string | null
          id?: string
          is_new_facility?: boolean
          region_id?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          user_level?: string
          woreda_id?: number | null
          zone_id?: number | null
        }
        Relationships: []
      }
      request_comments: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          mentions: Json | null
          request_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string
          id?: string
          mentions?: Json | null
          request_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          mentions?: Json | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_documents: {
        Row: {
          file_path: string
          id: string
          request_id: string
          stage: string | null
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          file_path: string
          id?: string
          request_id: string
          stage?: string | null
          uploaded_at?: string
          uploaded_by?: string
        }
        Update: {
          file_path?: string
          id?: string
          request_id?: string
          stage?: string | null
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_transitions: {
        Row: {
          actor_id: string
          attachment_url: string | null
          comment: string | null
          created_at: string
          decision: string | null
          from_stage: string | null
          id: string
          request_id: string
          to_stage: string | null
        }
        Insert: {
          actor_id?: string
          attachment_url?: string | null
          comment?: string | null
          created_at?: string
          decision?: string | null
          from_stage?: string | null
          id?: string
          request_id: string
          to_stage?: string | null
        }
        Update: {
          actor_id?: string
          attachment_url?: string | null
          comment?: string | null
          created_at?: string
          decision?: string | null
          from_stage?: string | null
          id?: string
          request_id?: string
          to_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_transitions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      rrf_headers: {
        Row: {
          created_at: string
          facility_id: number
          id: string
          notes: string | null
          period: string
          program_id: string
          status: string
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facility_id: number
          id?: string
          notes?: string | null
          period: string
          program_id: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          facility_id?: number
          id?: string
          notes?: string | null
          period?: string
          program_id?: string
          status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_rrf_facility"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
        ]
      }
      rrf_lines: {
        Row: {
          amc: number | null
          comments: string | null
          created_at: string
          final_order: number | null
          id: string
          item_id: string
          pipeline: number | null
          rrf_id: string
          soh: number | null
          suggested_order: number | null
          updated_at: string
        }
        Insert: {
          amc?: number | null
          comments?: string | null
          created_at?: string
          final_order?: number | null
          id?: string
          item_id: string
          pipeline?: number | null
          rrf_id: string
          soh?: number | null
          suggested_order?: number | null
          updated_at?: string
        }
        Update: {
          amc?: number | null
          comments?: string | null
          created_at?: string
          final_order?: number | null
          id?: string
          item_id?: string
          pipeline?: number | null
          rrf_id?: string
          soh?: number | null
          suggested_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_rrf_line_header"
            columns: ["rrf_id"]
            isOneToOne: false
            referencedRelation: "rrf_headers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rrf_line_item"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "product_reference"
            referencedColumns: ["id"]
          },
        ]
      }
      rrf_snapshots: {
        Row: {
          created_at: string
          created_by: string
          id: string
          rrf_id: string
          snapshot: Json
          stage: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          id?: string
          rrf_id: string
          snapshot: Json
          stage: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          rrf_id?: string
          snapshot?: Json
          stage?: string
        }
        Relationships: []
      }
      saved_forecasts: {
        Row: {
          created_at: string
          description: string | null
          facility_id: number
          filter_criteria: Json | null
          filter_type: string
          forecast_parameters: Json
          id: string
          name: string
          selected_products: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          facility_id: number
          filter_criteria?: Json | null
          filter_type: string
          forecast_parameters?: Json
          id?: string
          name: string
          selected_products?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          facility_id?: number
          filter_criteria?: Json | null
          filter_type?: string
          forecast_parameters?: Json
          id?: string
          name?: string
          selected_products?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_locations: {
        Row: {
          active_status: boolean | null
          capacity_cubic_meters: number | null
          created_at: string | null
          facility_id: number
          humidity_controlled: boolean | null
          id: string
          location_code: string | null
          location_name: string
          location_type: string | null
          max_humidity: number | null
          max_temperature: number | null
          min_humidity: number | null
          min_temperature: number | null
          security_level: string | null
          temperature_controlled: boolean | null
          updated_at: string | null
        }
        Insert: {
          active_status?: boolean | null
          capacity_cubic_meters?: number | null
          created_at?: string | null
          facility_id: number
          humidity_controlled?: boolean | null
          id?: string
          location_code?: string | null
          location_name: string
          location_type?: string | null
          max_humidity?: number | null
          max_temperature?: number | null
          min_humidity?: number | null
          min_temperature?: number | null
          security_level?: string | null
          temperature_controlled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          active_status?: boolean | null
          capacity_cubic_meters?: number | null
          created_at?: string | null
          facility_id?: number
          humidity_controlled?: boolean | null
          id?: string
          location_code?: string | null
          location_name?: string
          location_type?: string | null
          max_humidity?: number | null
          max_temperature?: number | null
          min_humidity?: number | null
          min_temperature?: number | null
          security_level?: string | null
          temperature_controlled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_locations_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
        ]
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
      user_facility_memberships: {
        Row: {
          created_at: string
          facility_id: number
          id: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facility_id: number
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          facility_id?: number
          id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_role_requests: {
        Row: {
          admin_level: Database["public"]["Enums"]["admin_level"]
          created_at: string
          facility_id: number | null
          id: string
          justification: string | null
          region_id: number | null
          requested_at: string
          requested_role: Database["public"]["Enums"]["user_role_type"]
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          updated_at: string
          user_id: string
          woreda_id: number | null
          zone_id: number | null
        }
        Insert: {
          admin_level: Database["public"]["Enums"]["admin_level"]
          created_at?: string
          facility_id?: number | null
          id?: string
          justification?: string | null
          region_id?: number | null
          requested_at?: string
          requested_role: Database["public"]["Enums"]["user_role_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
          woreda_id?: number | null
          zone_id?: number | null
        }
        Update: {
          admin_level?: Database["public"]["Enums"]["admin_level"]
          created_at?: string
          facility_id?: number | null
          id?: string
          justification?: string | null
          region_id?: number | null
          requested_at?: string
          requested_role?: Database["public"]["Enums"]["user_role_type"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          woreda_id?: number | null
          zone_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_role_requests_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "user_role_requests_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "user_role_requests_woreda_id_fkey"
            columns: ["woreda_id"]
            isOneToOne: false
            referencedRelation: "woreda"
            referencedColumns: ["woreda_id"]
          },
          {
            foreignKeyName: "user_role_requests_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone"
            referencedColumns: ["zone_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          admin_level: Database["public"]["Enums"]["admin_level"] | null
          assigned_at: string | null
          assigned_by: string | null
          facility_id: number | null
          id: string
          region_id: number | null
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
          woreda_id: number | null
          zone_id: number | null
        }
        Insert: {
          admin_level?: Database["public"]["Enums"]["admin_level"] | null
          assigned_at?: string | null
          assigned_by?: string | null
          facility_id?: number | null
          id?: string
          region_id?: number | null
          role: Database["public"]["Enums"]["user_role_type"]
          user_id: string
          woreda_id?: number | null
          zone_id?: number | null
        }
        Update: {
          admin_level?: Database["public"]["Enums"]["admin_level"] | null
          assigned_at?: string | null
          assigned_by?: string | null
          facility_id?: number | null
          id?: string
          region_id?: number | null
          role?: Database["public"]["Enums"]["user_role_type"]
          user_id?: string
          woreda_id?: number | null
          zone_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facility"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "user_roles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "user_roles_woreda_id_fkey"
            columns: ["woreda_id"]
            isOneToOne: false
            referencedRelation: "woreda"
            referencedColumns: ["woreda_id"]
          },
          {
            foreignKeyName: "user_roles_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone"
            referencedColumns: ["zone_id"]
          },
        ]
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
          country_id: number | null
          created_at: string | null
          region_id: number | null
          updated_at: string | null
          woreda_code: string | null
          woreda_id: number
          woreda_name: string
          zone_id: number
        }
        Insert: {
          country_id?: number | null
          created_at?: string | null
          region_id?: number | null
          updated_at?: string | null
          woreda_code?: string | null
          woreda_id?: number
          woreda_name: string
          zone_id: number
        }
        Update: {
          country_id?: number | null
          created_at?: string | null
          region_id?: number | null
          updated_at?: string | null
          woreda_code?: string | null
          woreda_id?: number
          woreda_name?: string
          zone_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_woreda_country"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["country_id"]
          },
          {
            foreignKeyName: "fk_woreda_region"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["region_id"]
          },
          {
            foreignKeyName: "fk_woreda_zone"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zone"
            referencedColumns: ["zone_id"]
          },
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
          zone_code: string | null
          zone_id: number
          zone_name: string
        }
        Insert: {
          created_at?: string | null
          region_id: number
          updated_at?: string | null
          zone_code?: string | null
          zone_id?: number
          zone_name: string
        }
        Update: {
          created_at?: string | null
          region_id?: number
          updated_at?: string | null
          zone_code?: string | null
          zone_id?: number
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_zone_region"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "region"
            referencedColumns: ["region_id"]
          },
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
      approve_registration_request: {
        Args: { request_id: string }
        Returns: undefined
      }
      approve_role_request: {
        Args: { request_id: string; reviewer_notes?: string }
        Returns: undefined
      }
      approve_rrf: {
        Args: { p_comment?: string; p_decision?: string; p_rrf_id: string }
        Returns: undefined
      }
      calculate_consumption_analytics: {
        Args: {
          p_end_date: string
          p_facility_id: number
          p_start_date: string
        }
        Returns: undefined
      }
      can_update_registration_request: {
        Args: { _request_id: string; _user_id: string }
        Returns: boolean
      }
      get_current_product_price: {
        Args: { p_product_id: string }
        Returns: {
          effective_date: string
          id: string
          notes: string
          price: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_procurement_summary: {
        Args: {
          p_fiscal_year?: number
          p_procurement_source?: string
          p_region_name?: string
        }
        Returns: {
          avg_price: number
          epss_percentage: number
          total_facilities: number
          total_products: number
          total_records: number
          total_value: number
        }[]
      }
      get_product_price_history: {
        Args: { p_product_id: string }
        Returns: {
          created_at: string
          created_by: string
          effective_date: string
          id: string
          notes: string
          price: number
        }[]
      }
      has_admin_scope_for_national: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_admin_scope_for_region: {
        Args: { _region_id: number; _user_id: string }
        Returns: boolean
      }
      has_admin_scope_for_woreda: {
        Args: { _user_id: string; _woreda_id: number }
        Returns: boolean
      }
      has_admin_scope_for_zone: {
        Args: { _user_id: string; _zone_id: number }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_user_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role_type"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      recompute_request_totals: {
        Args: { p_request_id: string }
        Returns: undefined
      }
      refresh_procurement_summary: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reject_role_request: {
        Args: { request_id: string; reviewer_notes?: string }
        Returns: undefined
      }
      submit_rrf: {
        Args: { p_rrf_id: string }
        Returns: undefined
      }
    }
    Enums: {
      admin_level: "facility" | "woreda" | "zone" | "regional" | "national"
      app_role: "admin" | "analyst" | "viewer"
      facility_ownership_type: "public" | "private" | "ngo"
      user_role_type:
        | "facility_logistic_officer"
        | "facility_admin"
        | "facility_manager"
        | "woreda_user"
        | "zone_user"
        | "regional_user"
        | "national_user"
        | "program_officer"
        | "admin"
        | "analyst"
        | "viewer"
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
      admin_level: ["facility", "woreda", "zone", "regional", "national"],
      app_role: ["admin", "analyst", "viewer"],
      facility_ownership_type: ["public", "private", "ngo"],
      user_role_type: [
        "facility_logistic_officer",
        "facility_admin",
        "facility_manager",
        "woreda_user",
        "zone_user",
        "regional_user",
        "national_user",
        "program_officer",
        "admin",
        "analyst",
        "viewer",
      ],
    },
  },
} as const
