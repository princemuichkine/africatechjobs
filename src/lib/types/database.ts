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
      cities: {
        Row: {
          country_id: string;
          id: string;
          is_tech_hub: boolean | null;
          name: string;
        };
        Insert: {
          country_id: string;
          id?: string;
          is_tech_hub?: boolean | null;
          name: string;
        };
        Update: {
          country_id?: string;
          id?: string;
          is_tech_hub?: boolean | null;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cities_country_id_fkey";
            columns: ["country_id"];
            isOneToOne: false;
            referencedRelation: "countries";
            referencedColumns: ["id"];
          },
        ];
      };
      companies: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string | null;
          description: string | null;
          id: string;
          industry: Database["public"]["Enums"]["company_industry"] | null;
          logo: string | null;
          name: string;
          name_search: string | null;
          size: Database["public"]["Enums"]["company_size"] | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          industry?: Database["public"]["Enums"]["company_industry"] | null;
          logo?: string | null;
          name: string;
          name_search?: string | null;
          size?: Database["public"]["Enums"]["company_size"] | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          industry?: Database["public"]["Enums"]["company_industry"] | null;
          logo?: string | null;
          name?: string;
          name_search?: string | null;
          size?: Database["public"]["Enums"]["company_size"] | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      company_follows: {
        Row: {
          company_id: string;
          followed_at: string | null;
          follower_id: string;
          id: string;
        };
        Insert: {
          company_id: string;
          followed_at?: string | null;
          follower_id: string;
          id?: string;
        };
        Update: {
          company_id?: string;
          followed_at?: string | null;
          follower_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "company_follows_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "company_follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      countries: {
        Row: {
          code: string;
          currency: string | null;
          id: string;
          is_active: boolean | null;
          name: string;
          region: string;
          timezone: string[] | null;
        };
        Insert: {
          code: string;
          currency?: string | null;
          id?: string;
          is_active?: boolean | null;
          name: string;
          region: string;
          timezone?: string[] | null;
        };
        Update: {
          code?: string;
          currency?: string | null;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          region?: string;
          timezone?: string[] | null;
        };
        Relationships: [];
      };
      job_alerts: {
        Row: {
          created_at: string | null;
          filters: Json;
          frequency: string | null;
          id: string;
          is_active: boolean | null;
          last_sent: string | null;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          filters: Json;
          frequency?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_sent?: string | null;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          filters?: Json;
          frequency?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_sent?: string | null;
          name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_alerts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      job_views: {
        Row: {
          id: string;
          ip_address: unknown | null;
          job_id: string;
          referrer: string | null;
          session_id: string | null;
          viewed_at: string | null;
          viewer_id: string | null;
        };
        Insert: {
          id?: string;
          ip_address?: unknown | null;
          job_id: string;
          referrer?: string | null;
          session_id?: string | null;
          viewed_at?: string | null;
          viewer_id?: string | null;
        };
        Update: {
          id?: string;
          ip_address?: unknown | null;
          job_id?: string;
          referrer?: string | null;
          session_id?: string | null;
          viewed_at?: string | null;
          viewer_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_views_viewer_id_fkey";
            columns: ["viewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          city: string;
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
          is_sponsored: boolean | null;
          job_category: Database["public"]["Enums"]["job_category"] | null;
          posted_at: string;
          remote: boolean | null;
          salary: string | null;
          salary_max: number | null;
          salary_min: number | null;
          source: string;
          source_id: string | null;
          title: string;
          title_search: string | null;
          type: Database["public"]["Enums"]["job_type"] | null;
          updated_at: string | null;
          url: string;
        };
        Insert: {
          city: string;
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
          is_sponsored?: boolean | null;
          job_category?: Database["public"]["Enums"]["job_category"] | null;
          posted_at: string;
          remote?: boolean | null;
          salary?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          source: string;
          source_id?: string | null;
          title: string;
          title_search?: string | null;
          type?: Database["public"]["Enums"]["job_type"] | null;
          updated_at?: string | null;
          url: string;
        };
        Update: {
          city?: string;
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
          is_sponsored?: boolean | null;
          job_category?: Database["public"]["Enums"]["job_category"] | null;
          posted_at?: string;
          remote?: boolean | null;
          salary?: string | null;
          salary_max?: number | null;
          salary_min?: number | null;
          source?: string;
          source_id?: string | null;
          title?: string;
          title_search?: string | null;
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
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          country: string | null;
          created_at: string | null;
          email: string | null;
          github_url: string | null;
          id: string;
          is_public: boolean | null;
          is_verified: boolean | null;
          linkedin_url: string | null;
          location: string | null;
          name: string | null;
          phone: string | null;
          slug: string | null;
          social_x_link: string | null;
          status: string | null;
          updated_at: string | null;
          website: string | null;
          work: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          created_at?: string | null;
          email?: string | null;
          github_url?: string | null;
          id: string;
          is_public?: boolean | null;
          is_verified?: boolean | null;
          linkedin_url?: string | null;
          location?: string | null;
          name?: string | null;
          phone?: string | null;
          slug?: string | null;
          social_x_link?: string | null;
          status?: string | null;
          updated_at?: string | null;
          website?: string | null;
          work?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          country?: string | null;
          created_at?: string | null;
          email?: string | null;
          github_url?: string | null;
          id?: string;
          is_public?: boolean | null;
          is_verified?: boolean | null;
          linkedin_url?: string | null;
          location?: string | null;
          name?: string | null;
          phone?: string | null;
          slug?: string | null;
          social_x_link?: string | null;
          status?: string | null;
          updated_at?: string | null;
          website?: string | null;
          work?: string | null;
        };
        Relationships: [];
      };
      role_category_mappings: {
        Row: {
          category: Database["public"]["Enums"]["job_category"];
          created_at: string | null;
          id: string;
          keyword: string;
        };
        Insert: {
          category: Database["public"]["Enums"]["job_category"];
          created_at?: string | null;
          id?: string;
          keyword: string;
        };
        Update: {
          category?: Database["public"]["Enums"]["job_category"];
          created_at?: string | null;
          id?: string;
          keyword?: string;
        };
        Relationships: [];
      };
      scrape_logs: {
        Row: {
          completed_at: string | null;
          error: string | null;
          id: string;
          jobs_added: number | null;
          jobs_found: number | null;
          jobs_skipped: number | null;
          jobs_updated: number | null;
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
          jobs_skipped?: number | null;
          jobs_updated?: number | null;
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
          jobs_skipped?: number | null;
          jobs_updated?: number | null;
          source?: string;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["scrape_status"] | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cleanup_old_data: {
        Args: { days_to_keep?: number };
        Returns: {
          job_views_deleted: number;
          old_jobs_deactivated: number;
        }[];
      };
      cleanup_old_job_views: {
        Args: { days_old?: number };
        Returns: number;
      };
      find_duplicate_jobs: {
        Args: Record<PropertyKey, never>;
        Returns: {
          company_name: string;
          duplicate_id: string;
          job_id: string;
          similarity_score: number;
          title: string;
        }[];
      };
      get_current_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: {
          avatar_url: string | null;
          bio: string | null;
          country: string | null;
          created_at: string | null;
          email: string | null;
          github_url: string | null;
          id: string;
          is_public: boolean | null;
          is_verified: boolean | null;
          linkedin_url: string | null;
          location: string | null;
          name: string | null;
          phone: string | null;
          slug: string | null;
          social_x_link: string | null;
          status: string | null;
          updated_at: string | null;
          website: string | null;
          work: string | null;
        };
      };
      get_job_stats: {
        Args: Record<PropertyKey, never>;
        Returns: Json;
      };
      get_job_stats_by_country: {
        Args: { country_name?: string };
        Returns: {
          active_jobs: number;
          avg_days_old: number;
          country: string;
          remote_jobs: number;
          total_jobs: number;
        }[];
      };
      increment_job_view: {
        Args: {
          job_uuid: string;
          referrer_url?: string;
          session_uuid?: string;
          user_ip?: unknown;
          viewer_uuid?: string;
        };
        Returns: undefined;
      };
      is_admin_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_valid_url: {
        Args: { url: string };
        Returns: boolean;
      };
      toggle_company_follow: {
        Args: { company_uuid: string };
        Returns: boolean;
      };
    };
    Enums: {
      company_industry:
        | "FINANCE"
        | "HEALTHCARE"
        | "EDUCATION"
        | "AGRITECH"
        | "E_COMMERCE"
        | "LOGISTICS"
        | "REAL_ESTATE"
        | "INSURANCE"
        | "BANKING"
        | "PAYMENTS"
        | "INVESTMENT"
        | "BLOCKCHAIN"
        | "AI"
        | "DATA"
        | "CYBERSECURITY"
        | "CLOUD"
        | "SOFTWARE"
        | "CONSUMER"
        | "AGENCY"
        | "MARKETPLACE"
        | "MEDIA"
        | "TELECOM"
        | "ENERGY"
        | "TRANSPORTATION"
        | "OTHER";
      company_size: "1_10" | "11_50" | "51_200" | "201_1000" | "1000_PLUS";
      experience_level:
        | "ENTRY_LEVEL"
        | "JUNIOR"
        | "MID_LEVEL"
        | "SENIOR"
        | "EXECUTIVE";
      job_category:
        | "ENGINEERING"
        | "SALES"
        | "MARKETING"
        | "DATA"
        | "DEVOPS"
        | "PRODUCT"
        | "DESIGN"
        | "CLOUD"
        | "SUPPORT"
        | "MANAGEMENT"
        | "RESEARCH"
        | "LEGAL"
        | "FINANCE"
        | "OPERATIONS"
        | "PR"
        | "HR"
        | "OTHER";
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
      company_industry: [
        "FINANCE",
        "HEALTHCARE",
        "EDUCATION",
        "AGRITECH",
        "E_COMMERCE",
        "LOGISTICS",
        "REAL_ESTATE",
        "INSURANCE",
        "BANKING",
        "PAYMENTS",
        "INVESTMENT",
        "BLOCKCHAIN",
        "AI",
        "DATA",
        "CYBERSECURITY",
        "CLOUD",
        "SOFTWARE",
        "CONSUMER",
        "AGENCY",
        "MARKETPLACE",
        "MEDIA",
        "TELECOM",
        "ENERGY",
        "TRANSPORTATION",
        "OTHER",
      ],
      company_size: ["1_10", "11_50", "51_200", "201_1000", "1000_PLUS"],
      experience_level: [
        "ENTRY_LEVEL",
        "JUNIOR",
        "MID_LEVEL",
        "SENIOR",
        "EXECUTIVE",
      ],
      job_category: [
        "ENGINEERING",
        "SALES",
        "MARKETING",
        "DATA",
        "DEVOPS",
        "PRODUCT",
        "DESIGN",
        "CLOUD",
        "SUPPORT",
        "MANAGEMENT",
        "RESEARCH",
        "LEGAL",
        "FINANCE",
        "OPERATIONS",
        "PR",
        "HR",
        "OTHER",
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
