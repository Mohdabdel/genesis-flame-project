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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      age_expectations: {
        Row: {
          age_band: Database["public"]["Enums"]["age_band_tier"]
          expectation_id: number
          expected_behavior_ar: string
          expected_behavior_en: string
          station_id: string | null
        }
        Insert: {
          age_band: Database["public"]["Enums"]["age_band_tier"]
          expectation_id?: number
          expected_behavior_ar: string
          expected_behavior_en: string
          station_id?: string | null
        }
        Update: {
          age_band?: Database["public"]["Enums"]["age_band_tier"]
          expectation_id?: number
          expected_behavior_ar?: string
          expected_behavior_en?: string
          station_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "age_expectations_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "transition_stations"
            referencedColumns: ["station_id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          category: string
          created_at: string
          id: string
          max_score: number
          question: string
          sort_order: number
          weight: number
        }
        Insert: {
          assessment_id: string
          category: string
          created_at?: string
          id?: string
          max_score?: number
          question: string
          sort_order?: number
          weight?: number
        }
        Update: {
          assessment_id?: string
          category?: string
          created_at?: string
          id?: string
          max_score?: number
          question?: string
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          notes: string | null
          question_id: string
          score: number
          user_id: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          notes?: string | null
          question_id: string
          score: number
          user_id: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          question_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          organization_id: string
          overall_score: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id: string
          overall_score?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          overall_score?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          destination_id: string
          engine_function: string
          name_ar: string
          name_en: string
        }
        Insert: {
          destination_id: string
          engine_function: string
          name_ar: string
          name_en: string
        }
        Update: {
          destination_id?: string
          engine_function?: string
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      evidence_records: {
        Row: {
          context_verification_metadata: Json
          evaluator_id: string
          evidence_id: number
          independence_score: number
          objective_id: number | null
          task_analysis_payload: Json
          timestamp: string | null
        }
        Insert: {
          context_verification_metadata?: Json
          evaluator_id: string
          evidence_id?: number
          independence_score: number
          objective_id?: number | null
          task_analysis_payload?: Json
          timestamp?: string | null
        }
        Update: {
          context_verification_metadata?: Json
          evaluator_id?: string
          evidence_id?: number
          independence_score?: number
          objective_id?: number | null
          task_analysis_payload?: Json
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_records_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "individual_objectives"
            referencedColumns: ["objective_id"]
          },
        ]
      }
      indicators: {
        Row: {
          description_ar: string
          description_en: string
          evidence_tag: Database["public"]["Enums"]["evidence_level"]
          expectation_id: number | null
          indicator_id: string
          mastery_logic_rules: Json
        }
        Insert: {
          description_ar: string
          description_en: string
          evidence_tag?: Database["public"]["Enums"]["evidence_level"]
          expectation_id?: number | null
          indicator_id: string
          mastery_logic_rules?: Json
        }
        Update: {
          description_ar?: string
          description_en?: string
          evidence_tag?: Database["public"]["Enums"]["evidence_level"]
          expectation_id?: number | null
          indicator_id?: string
          mastery_logic_rules?: Json
        }
        Relationships: [
          {
            foreignKeyName: "indicators_expectation_id_fkey"
            columns: ["expectation_id"]
            isOneToOne: false
            referencedRelation: "age_expectations"
            referencedColumns: ["expectation_id"]
          },
        ]
      }
      individual_objectives: {
        Row: {
          created_at: string | null
          generated_iep_goal_ar: string
          indicator_id: string | null
          is_active: boolean | null
          learner_id: number | null
          objective_id: number
          target_scenario_id: string | null
        }
        Insert: {
          created_at?: string | null
          generated_iep_goal_ar: string
          indicator_id?: string | null
          is_active?: boolean | null
          learner_id?: number | null
          objective_id?: number
          target_scenario_id?: string | null
        }
        Update: {
          created_at?: string | null
          generated_iep_goal_ar?: string
          indicator_id?: string | null
          is_active?: boolean | null
          learner_id?: number | null
          objective_id?: number
          target_scenario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "individual_objectives_indicator_id_fkey"
            columns: ["indicator_id"]
            isOneToOne: false
            referencedRelation: "indicators"
            referencedColumns: ["indicator_id"]
          },
          {
            foreignKeyName: "individual_objectives_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "learners"
            referencedColumns: ["learner_id"]
          },
          {
            foreignKeyName: "individual_objectives_target_scenario_id_fkey"
            columns: ["target_scenario_id"]
            isOneToOne: false
            referencedRelation: "scenarios"
            referencedColumns: ["scenario_id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      learners: {
        Row: {
          created_at: string | null
          current_age_band: Database["public"]["Enums"]["age_band_tier"]
          date_of_birth: string
          first_name: string
          last_name: string
          learner_id: number
          owner_id: string
          support_intensity_profile: Json
        }
        Insert: {
          created_at?: string | null
          current_age_band: Database["public"]["Enums"]["age_band_tier"]
          date_of_birth: string
          first_name: string
          last_name: string
          learner_id?: number
          owner_id?: string
          support_intensity_profile?: Json
        }
        Update: {
          created_at?: string | null
          current_age_band?: Database["public"]["Enums"]["age_band_tier"]
          date_of_birth?: string
          first_name?: string
          last_name?: string
          learner_id?: number
          owner_id?: string
          support_intensity_profile?: Json
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          size: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          size?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          size?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      pathways: {
        Row: {
          deconstruction_text: string
          destination_id: string | null
          pathway_id: string
          title_ar: string
          title_en: string
        }
        Insert: {
          deconstruction_text: string
          destination_id?: string | null
          pathway_id: string
          title_ar: string
          title_en: string
        }
        Update: {
          deconstruction_text?: string
          destination_id?: string | null
          pathway_id?: string
          title_ar?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "pathways_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["destination_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_org_admin: boolean
          job_title: string | null
          organization_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_org_admin?: boolean
          job_title?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_org_admin?: boolean
          job_title?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          organization_id: string
          priority: string
          progress: number
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id: string
          priority?: string
          progress?: number
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          organization_id?: string
          priority?: string
          progress?: number
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scenarios: {
        Row: {
          context_library_type: string
          scenario_id: string
          task_analysis_template: Json
          title_ar: string
          title_en: string
        }
        Insert: {
          context_library_type: string
          scenario_id: string
          task_analysis_template?: Json
          title_ar: string
          title_en: string
        }
        Update: {
          context_library_type?: string
          scenario_id?: string
          task_analysis_template?: Json
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      training_modules: {
        Row: {
          category: string
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      transition_stations: {
        Row: {
          functional_description: string
          name_ar: string
          name_en: string
          pathway_id: string | null
          progression_logic_json: Json
          station_id: string
        }
        Insert: {
          functional_description: string
          name_ar: string
          name_en: string
          pathway_id?: string | null
          progression_logic_json?: Json
          station_id: string
        }
        Update: {
          functional_description?: string
          name_ar?: string
          name_en?: string
          pathway_id?: string | null
          progression_logic_json?: Json
          station_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transition_stations_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["pathway_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_learner_drc: {
        Args: { p_destination_id: string; p_learner_id: number }
        Returns: number
      }
      evaluate_gateway_routing: {
        Args: { p_learner_id: number }
        Returns: Database["public"]["Enums"]["post_school_track"]
      }
      get_evidence_weight: {
        Args: { v_level: Database["public"]["Enums"]["evidence_level"] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      age_band_tier: "0-5" | "6-9" | "10-12" | "13-15" | "16-18" | "18+"
      app_role: "admin" | "consultant" | "user"
      evidence_level: "Evidence-Based" | "Research-Based" | "Promising"
      post_school_track:
        | "TRACK_1_COMPETITIVE_EMPLOYMENT"
        | "TRACK_2_SUPPORTED_ENTREPRENEURSHIP"
        | "TRACK_3_SUPPORTED_LIVING"
        | "TRACK_4_CIVIC_HUB_ACCESS"
        | "TRACK_5_INCLUSIVE_HIGHER_EDUCATION"
        | "TRACK_6_BLENDED_PROFILE_MATRIX"
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
    Enums: {
      age_band_tier: ["0-5", "6-9", "10-12", "13-15", "16-18", "18+"],
      app_role: ["admin", "consultant", "user"],
      evidence_level: ["Evidence-Based", "Research-Based", "Promising"],
      post_school_track: [
        "TRACK_1_COMPETITIVE_EMPLOYMENT",
        "TRACK_2_SUPPORTED_ENTREPRENEURSHIP",
        "TRACK_3_SUPPORTED_LIVING",
        "TRACK_4_CIVIC_HUB_ACCESS",
        "TRACK_5_INCLUSIVE_HIGHER_EDUCATION",
        "TRACK_6_BLENDED_PROFILE_MATRIX",
      ],
    },
  },
} as const
