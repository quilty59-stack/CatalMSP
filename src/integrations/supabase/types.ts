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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      msp: {
        Row: {
          address: string | null
          authorizations: string | null
          cognitive_effects: string | null
          commune: string
          competences: string | null
          constraints: string | null
          created_at: string
          difficulty: number
          difficulty_complex: string | null
          difficulty_facilitator: string | null
          difficulty_initial: string | null
          equipment: string[] | null
          expected_activities: string | null
          has_water_point: boolean | null
          id: string
          instructions: string | null
          maps_link: string | null
          mission_reason: string | null
          objectives: string | null
          other_equipment: string | null
          public_url: string | null
          reservation_details: string | null
          safety_briefing: string | null
          site_conventionne_id: string | null
          site_name: string
          site_notes: string | null
          site_type: string
          situation: string | null
          slug: string
          status: string
          theme: string
          title: string
          updated_at: string
          water_point_details: string | null
        }
        Insert: {
          address?: string | null
          authorizations?: string | null
          cognitive_effects?: string | null
          commune: string
          competences?: string | null
          constraints?: string | null
          created_at?: string
          difficulty?: number
          difficulty_complex?: string | null
          difficulty_facilitator?: string | null
          difficulty_initial?: string | null
          equipment?: string[] | null
          expected_activities?: string | null
          has_water_point?: boolean | null
          id?: string
          instructions?: string | null
          maps_link?: string | null
          mission_reason?: string | null
          objectives?: string | null
          other_equipment?: string | null
          public_url?: string | null
          reservation_details?: string | null
          safety_briefing?: string | null
          site_conventionne_id?: string | null
          site_name: string
          site_notes?: string | null
          site_type: string
          situation?: string | null
          slug: string
          status?: string
          theme?: string
          title: string
          updated_at?: string
          water_point_details?: string | null
        }
        Update: {
          address?: string | null
          authorizations?: string | null
          cognitive_effects?: string | null
          commune?: string
          competences?: string | null
          constraints?: string | null
          created_at?: string
          difficulty?: number
          difficulty_complex?: string | null
          difficulty_facilitator?: string | null
          difficulty_initial?: string | null
          equipment?: string[] | null
          expected_activities?: string | null
          has_water_point?: boolean | null
          id?: string
          instructions?: string | null
          maps_link?: string | null
          mission_reason?: string | null
          objectives?: string | null
          other_equipment?: string | null
          public_url?: string | null
          reservation_details?: string | null
          safety_briefing?: string | null
          site_conventionne_id?: string | null
          site_name?: string
          site_notes?: string | null
          site_type?: string
          situation?: string | null
          slug?: string
          status?: string
          theme?: string
          title?: string
          updated_at?: string
          water_point_details?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "msp_site_conventionne_id_fkey"
            columns: ["site_conventionne_id"]
            isOneToOne: false
            referencedRelation: "sites_conventionnes"
            referencedColumns: ["id"]
          },
        ]
      }
      msp_photos: {
        Row: {
          category: string
          comment: string | null
          created_at: string
          id: string
          image_url: string
          msp_id: string
        }
        Insert: {
          category: string
          comment?: string | null
          created_at?: string
          id?: string
          image_url: string
          msp_id: string
        }
        Update: {
          category?: string
          comment?: string | null
          created_at?: string
          id?: string
          image_url?: string
          msp_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "msp_photos_msp_id_fkey"
            columns: ["msp_id"]
            isOneToOne: false
            referencedRelation: "msp"
            referencedColumns: ["id"]
          },
        ]
      }
      sites_conventionnes: {
        Row: {
          address: string
          commune: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          convention_expires_at: string | null
          convention_notes: string | null
          convention_signed_at: string | null
          created_at: string
          domains: string[] | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          opening_hours: string | null
          photo_url: string | null
          postal_code: string | null
          site_type: string
          slug: string
          updated_at: string
        }
        Insert: {
          address: string
          commune: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          convention_expires_at?: string | null
          convention_notes?: string | null
          convention_signed_at?: string | null
          created_at?: string
          domains?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          opening_hours?: string | null
          photo_url?: string | null
          postal_code?: string | null
          site_type?: string
          slug: string
          updated_at?: string
        }
        Update: {
          address?: string
          commune?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          convention_expires_at?: string | null
          convention_notes?: string | null
          convention_signed_at?: string | null
          created_at?: string
          domains?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          opening_hours?: string | null
          photo_url?: string | null
          postal_code?: string | null
          site_type?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
