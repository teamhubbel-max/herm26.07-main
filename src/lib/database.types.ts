export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          color: string
          status: string
          owner_id: string
          created_at: string
          updated_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          color?: string
          status?: string
          owner_id: string
          created_at?: string
          updated_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          color?: string
          status?: string
          owner_id?: string
          created_at?: string
          updated_at?: string
          last_activity?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          priority: string
          category: string
          project_id: string
          assignee_id: string | null
          created_by: string
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status?: string
          priority?: string
          category?: string
          project_id: string
          assignee_id?: string | null
          created_by: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          category?: string
          project_id?: string
          assignee_id?: string | null
          created_by?: string
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          title: string
          description: string
          template_id: string | null
          project_id: string
          created_by: string
          status: string
          counterparty: Json | null
          template_fields: Json
          file_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          template_id?: string | null
          project_id: string
          created_by: string
          status?: string
          counterparty?: Json | null
          template_fields?: Json
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          template_id?: string | null
          project_id?: string
          created_by?: string
          status?: string
          counterparty?: Json | null
          template_fields?: Json
          file_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      document_templates: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          content: string
          fields: Json
          is_custom: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          category?: string
          content: string
          fields?: Json
          is_custom?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          content?: string
          fields?: Json
          is_custom?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          project_id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          details?: Json
          created_at?: string
        }
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