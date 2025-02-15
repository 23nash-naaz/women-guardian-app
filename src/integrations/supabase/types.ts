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
      moderation_history: {
        Row: {
          content_source: Database["public"]["Enums"]["content_source"]
          content_text: string
          created_at: string | null
          external_message_id: string | null
          flag_reason: string | null
          id: string
          is_flagged: boolean
          user_id: string | null
        }
        Insert: {
          content_source: Database["public"]["Enums"]["content_source"]
          content_text: string
          created_at?: string | null
          external_message_id?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          user_id?: string | null
        }
        Update: {
          content_source?: Database["public"]["Enums"]["content_source"]
          content_text?: string
          created_at?: string | null
          external_message_id?: string | null
          flag_reason?: string | null
          id?: string
          is_flagged?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      route_safety_points: {
        Row: {
          created_at: string | null
          id: string
          incident_count: number | null
          last_updated: string | null
          latitude: number
          longitude: number
          safety_score: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          incident_count?: number | null
          last_updated?: string | null
          latitude: number
          longitude: number
          safety_score: number
        }
        Update: {
          created_at?: string | null
          id?: string
          incident_count?: number | null
          last_updated?: string | null
          latitude?: number
          longitude?: number
          safety_score?: number
        }
        Relationships: []
      }
      safety_incidents: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          incident_type: string
          latitude: number
          longitude: number
          reported_by: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          incident_type: string
          latitude: number
          longitude: number
          reported_by?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          incident_type?: string
          latitude?: number
          longitude?: number
          reported_by?: string | null
          verified?: boolean | null
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
      content_source: "forum" | "whatsapp" | "twitter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
