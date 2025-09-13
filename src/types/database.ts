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
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          logo: string | null
          website: string | null
          industry: string | null
          size: string | null
          location: string | null
          country: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          location?: string | null
          country?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          description: string
          company_name: string
          company_id: string | null
          location: string
          country: string
          type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP'
          experience_level: 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'
          salary: string | null
          salary_min: number | null
          salary_max: number | null
          currency: string
          remote: boolean
          url: string
          source: string
          source_id: string | null
          posted_at: string
          deadline: string | null
          skills: string[]
          category: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          title: string
          description: string
          company_name: string
          company_id?: string | null
          location: string
          country: string
          type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP'
          experience_level?: 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'
          salary?: string | null
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          remote?: boolean
          url: string
          source: string
          source_id?: string | null
          posted_at: string
          deadline?: string | null
          skills?: string[]
          category?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string
          company_name?: string
          company_id?: string | null
          location?: string
          country?: string
          type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'FREELANCE' | 'INTERNSHIP' | 'APPRENTICESHIP'
          experience_level?: 'ENTRY_LEVEL' | 'JUNIOR' | 'MID_LEVEL' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'
          salary?: string | null
          salary_min?: number | null
          salary_max?: number | null
          currency?: string
          remote?: boolean
          url?: string
          source?: string
          source_id?: string | null
          posted_at?: string
          deadline?: string | null
          skills?: string[]
          category?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      scrape_logs: {
        Row: {
          id: string
          source: string
          status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED'
          jobs_found: number
          jobs_added: number
          error: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          source: string
          status?: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED'
          jobs_found?: number
          jobs_added?: number
          error?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          source?: string
          status?: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED'
          jobs_found?: number
          jobs_added?: number
          error?: string | null
          started_at?: string
          completed_at?: string | null
        }
      }
      tags: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      _jobs_tags: {
        Row: {
          job_id: string
          tag_id: string
        }
        Insert: {
          job_id: string
          tag_id: string
        }
        Update: {
          job_id?: string
          tag_id?: string
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
  }
}
