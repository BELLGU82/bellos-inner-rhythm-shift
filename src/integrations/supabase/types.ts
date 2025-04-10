export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_blocks: {
        Row: {
          block_type: string | null
          created_at: string | null
          duration_minutes: number | null
          embedding: string | null
          energy_score: number | null
          id: number
          label: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          block_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          embedding?: string | null
          energy_score?: number | null
          id?: number
          label?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          block_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          embedding?: string | null
          energy_score?: number | null
          id?: number
          label?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      daily_reflections: {
        Row: {
          content: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      decision_logs: {
        Row: {
          created_at: string | null
          decision: string | null
          embedding: string | null
          id: number
          impact_rating: number | null
          lesson: string | null
          metadata: Json | null
          outcome: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          decision?: string | null
          embedding?: string | null
          id?: number
          impact_rating?: number | null
          lesson?: string | null
          metadata?: Json | null
          outcome?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          decision?: string | null
          embedding?: string | null
          id?: number
          impact_rating?: number | null
          lesson?: string | null
          metadata?: Json | null
          outcome?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      delegation_entries: {
        Row: {
          action: string | null
          created_at: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          notes: string | null
          task: string | null
          time_cost: number | null
          user_id: string | null
          value_estimate: number | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          notes?: string | null
          task?: string | null
          time_cost?: number | null
          user_id?: string | null
          value_estimate?: number | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          notes?: string | null
          task?: string | null
          time_cost?: number | null
          user_id?: string | null
          value_estimate?: number | null
        }
        Relationships: []
      }
      document_metadata: {
        Row: {
          created_at: string | null
          id: string
          schema: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          schema?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          schema?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      document_rows: {
        Row: {
          dataset_id: string | null
          id: number
          row_data: Json | null
        }
        Insert: {
          dataset_id?: string | null
          id?: number
          row_data?: Json | null
        }
        Update: {
          dataset_id?: string | null
          id?: number
          row_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_rows_dataset_id_fkey"
            columns: ["dataset_id"]
            isOneToOne: false
            referencedRelation: "document_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      identity_core_snapshots: {
        Row: {
          created_at: string | null
          dropped_pattern: string | null
          embedding: string | null
          embodied_message: string | null
          id: number
          metadata: Json | null
          snapshot_reflection: string | null
          user_id: string | null
          weekly_identity_focus: string | null
        }
        Insert: {
          created_at?: string | null
          dropped_pattern?: string | null
          embedding?: string | null
          embodied_message?: string | null
          id?: number
          metadata?: Json | null
          snapshot_reflection?: string | null
          user_id?: string | null
          weekly_identity_focus?: string | null
        }
        Update: {
          created_at?: string | null
          dropped_pattern?: string | null
          embedding?: string | null
          embodied_message?: string | null
          id?: number
          metadata?: Json | null
          snapshot_reflection?: string | null
          user_id?: string | null
          weekly_identity_focus?: string | null
        }
        Relationships: []
      }
      identity_entries: {
        Row: {
          affirmation: string | null
          context: Json | null
          created_at: string | null
          embedding: string | null
          id: number
          identity_from: string | null
          identity_to: string | null
          user_id: string | null
        }
        Insert: {
          affirmation?: string | null
          context?: Json | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          identity_from?: string | null
          identity_to?: string | null
          user_id?: string | null
        }
        Update: {
          affirmation?: string | null
          context?: Json | null
          created_at?: string | null
          embedding?: string | null
          id?: number
          identity_from?: string | null
          identity_to?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      process_map_entries: {
        Row: {
          created_at: string | null
          embedding: string | null
          focus_area: string | null
          id: number
          metadata: Json | null
          notes: string | null
          project_name: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          focus_area?: string | null
          id?: number
          metadata?: Json | null
          notes?: string | null
          project_name?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          focus_area?: string | null
          id?: number
          metadata?: Json | null
          notes?: string | null
          project_name?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rest_sessions: {
        Row: {
          created_at: string | null
          embedding: string | null
          gratitude_entry: string | null
          id: number
          intention_release: string | null
          metadata: Json | null
          mood_after: string | null
          mood_before: string | null
          rest_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          embedding?: string | null
          gratitude_entry?: string | null
          id?: number
          intention_release?: string | null
          metadata?: Json | null
          mood_after?: string | null
          mood_before?: string | null
          rest_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          embedding?: string | null
          gratitude_entry?: string | null
          id?: number
          intention_release?: string | null
          metadata?: Json | null
          mood_after?: string | null
          mood_before?: string | null
          rest_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string | null
          description: string | null
          embedding: string | null
          id: number
          metadata: Json | null
          roi_score: number | null
          status: string | null
          title: string | null
          type: string | null
          urgency: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          roi_score?: number | null
          status?: string | null
          title?: string | null
          type?: string | null
          urgency?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          id?: number
          metadata?: Json | null
          roi_score?: number | null
          status?: string | null
          title?: string | null
          type?: string | null
          urgency?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": unknown } | { "": string }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": unknown } | { "": string } | { "": unknown }
        Returns: unknown
      }
      match_documents: {
        Args: { query_embedding: string; match_count?: number; filter?: Json }
        Returns: {
          id: number
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": unknown } | { "": string }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
