/**
 * Supabaseデータベースの型定義
 *
 * このファイルは将来的にSupabase CLIで自動生成することができます:
 * npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          display_name: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_tools: {
        Row: {
          id: string;
          tool_name: string;
          category: string;
          usage_purpose: string;
          user_experience: string;
          rating: number;
          usage_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          tool_name: string;
          category: string;
          usage_purpose: string;
          user_experience: string;
          rating: number;
          usage_date: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          tool_name?: string;
          category?: string;
          usage_purpose?: string;
          user_experience?: string;
          rating?: number;
          usage_date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      prompt_history: {
        Row: {
          id: string;
          user_id: string;
          input_params: Json;
          generated_prompt: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          input_params: Json;
          generated_prompt: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          input_params?: Json;
          generated_prompt?: string;
          created_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          expires_at: string;
          session_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expires_at: string;
          session_token: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          expires_at?: string;
          session_token?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          created_by?: string;
        };
      };
      tool_tags: {
        Row: {
          id: string;
          tool_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          tool_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tool_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tool_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      tool_like_counts: {
        Row: {
          tool_id: string;
          like_count: number;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
