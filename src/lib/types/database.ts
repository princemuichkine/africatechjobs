export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      _jobs_tags: {
        Row: {
          job_id: string;
          tag_id: string;
        };
        Insert: {
          job_id: string;
          tag_id: string;
        };
        Update: {
          job_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "_jobs_tags_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "_jobs_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          country: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          industry: string | null;
          location: string | null;
          logo: string | null;
          name: string;
          size: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          country?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          industry?: string | null;
          location?: string | null;
          logo?: string | null;
          name: string;
          size?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          country?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          industry?: string | null;
          location?: string | null;
          logo?: string | null;
          name?: string;
          size?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      jobs: {
        Row: {
          category: string | null;
          company_id: string | null;
          company_name: string;
          country: string;
          created_at: string | null;
          currency: string | null;
          deadline: string | null;
          description: string;
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null;
          id: string;
          is_active: boolean | null;
          location: string;
          posted_at: string;
          remote: boolean | null;
          salary: string | null;
          salary_max: number | null;
          salary_min: number | null;
          skills: string[] | null;
          source: string;
          source_id: string | null;
          title: string;
          type: Database["public"]["Enums"]["job_type"] | null;
          updated_at: string | null;
          url: string;
        };
        Insert: {
          category?: string | null;
          company_id?: string | null;
          company_name: string;
          country: string;
          created_at?: string | null;
          currency?: string | null;
          deadline?: string | null;
          description: string;
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null;
          id?: string;
          is_active?: boolean | null;
          location: string;
          posted_at: string;
          remote?: boolean | null;
          salary?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          skills?: string[] | null;
          source: string;
          source_id?: string | null;
          title: string;
          type?: Database["public"]["Enums"]["job_type"] | null;
          updated_at?: string | null;
          url: string;
        };
        Update: {
          category?: string | null;
          company_id?: string | null;
          company_name?: string;
          country?: string;
          created_at?: string | null;
          currency?: string | null;
          deadline?: string | null;
          description?: string;
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null;
          id?: string;
          is_active?: boolean | null;
          location?: string;
          posted_at?: string;
          remote?: boolean | null;
          salary?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          skills?: string[] | null;
          source?: string;
          source_id?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["job_type"] | null;
          updated_at?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      scrape_logs: {
        Row: {
          completed_at: string | null;
          error: string | null;
          id: string;
          jobs_added: number | null;
          jobs_found: number | null;
          source: string;
          started_at: string | null;
          status: Database["public"]["Enums"]["scrape_status"] | null;
        };
        Insert: {
          completed_at?: string | null;
          error?: string | null;
          id?: string;
          jobs_added?: number | null;
          jobs_found?: number | null;
          source: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["scrape_status"] | null;
        };
        Update: {
          completed_at?: string | null;
          error?: string | null;
          id?: string;
          jobs_added?: number | null;
          jobs_found?: number | null;
          source?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["scrape_status"] | null;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      experience_level:
        | "ENTRY_LEVEL"
        | "JUNIOR"
        | "MID_LEVEL"
        | "SENIOR"
        | "LEAD"
        | "EXECUTIVE";
      job_type:
        | "FULL_TIME"
        | "PART_TIME"
        | "CONTRACT"
        | "FREELANCE"
        | "INTERNSHIP"
        | "APPRENTICESHIP";
      scrape_status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      experience_level: [
        "ENTRY_LEVEL",
        "JUNIOR",
        "MID_LEVEL",
        "SENIOR",
        "LEAD",
        "EXECUTIVE",
      ],
      job_type: [
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "FREELANCE",
        "INTERNSHIP",
        "APPRENTICESHIP",
      ],
      scrape_status: ["SUCCESS", "PARTIAL_SUCCESS", "FAILED"],
    },
  },
} as const;
