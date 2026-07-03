// TypeScript types for the Supabase schema (see supabase/migrations/0001_init.sql).
// If the schema changes, regenerate with:
//   npx supabase gen types typescript --project-id <id> > types/database.ts
// For now this is hand-written to match the canonical schema in the brief.

import type { DecisionTypeId, OutcomeId } from "@/lib/constants";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      decisions: {
        Row: {
          id: string;
          user_id: string;
          type: DecisionTypeId;
          title: string;
          decision_timestamp: string;
          setting: string | null;
          pressure_level: number | null;
          context_notes: string | null;
          stakeholders: string | null;
          outcome: OutcomeId;
          reflection_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: DecisionTypeId;
          title: string;
          decision_timestamp: string;
          setting?: string | null;
          pressure_level?: number | null;
          context_notes?: string | null;
          stakeholders?: string | null;
          outcome?: OutcomeId;
          reflection_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["decisions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
  };
}

// Convenience aliases used throughout the app.
export type Decision = Database["public"]["Tables"]["decisions"]["Row"];
export type DecisionInsert = Database["public"]["Tables"]["decisions"]["Insert"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
