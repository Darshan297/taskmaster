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
          username: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          name: string
          repeat_days: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          repeat_days: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          repeat_days?: string[]
          created_at?: string
        }
      }
      task_completions: {
        Row: {
          id: string
          task_id: string
          user_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          completed_at?: string
        }
      }
    }
  }
}