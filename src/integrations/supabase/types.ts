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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          created_at: string
          id: string
          question_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_at: string | null
          banned_by: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_at?: string | null
          banned_by: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_at?: string | null
          banned_by?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ip_accounts: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      ip_bypass_requests: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string
          reason: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: string
          reason?: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string
          reason?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_broadcast: boolean
          read_at: string | null
          recipient_id: string | null
          sender_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
          read_at?: string | null
          recipient_id?: string | null
          sender_id: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_broadcast?: boolean
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string
          title?: string
        }
        Relationships: []
      }
      pacman_attempts: {
        Row: {
          completed_at: string
          correct_count: number
          game_id: string
          id: string
          points_earned: number
          student_id: string
        }
        Insert: {
          completed_at?: string
          correct_count?: number
          game_id: string
          id?: string
          points_earned?: number
          student_id: string
        }
        Update: {
          completed_at?: string
          correct_count?: number
          game_id?: string
          id?: string
          points_earned?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacman_attempts_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "pacman_games"
            referencedColumns: ["id"]
          },
        ]
      }
      pacman_games: {
        Row: {
          created_at: string
          description: string | null
          grade: Database["public"]["Enums"]["grade_level"] | null
          id: string
          is_published: boolean
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          is_published?: boolean
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          is_published?: boolean
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pacman_questions: {
        Row: {
          answer_a: string
          answer_b: string
          answer_c: string
          answer_d: string
          correct_answer: string
          created_at: string
          game_id: string
          id: string
          order_index: number
          question_text: string
        }
        Insert: {
          answer_a: string
          answer_b: string
          answer_c: string
          answer_d: string
          correct_answer: string
          created_at?: string
          game_id: string
          id?: string
          order_index?: number
          question_text: string
        }
        Update: {
          answer_a?: string
          answer_b?: string
          answer_c?: string
          answer_d?: string
          correct_answer?: string
          created_at?: string
          game_id?: string
          id?: string
          order_index?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacman_questions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "pacman_games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          grade: Database["public"]["Enums"]["grade_level"] | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          ai_feedback: string | null
          answers: Json
          created_at: string
          id: string
          max_score: number | null
          quiz_id: string
          score: number | null
          started_at: string
          status: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          ai_feedback?: string | null
          answers?: Json
          created_at?: string
          id?: string
          max_score?: number | null
          quiz_id: string
          score?: number | null
          started_at?: string
          status?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          ai_feedback?: string | null
          answers?: Json
          created_at?: string
          id?: string
          max_score?: number | null
          quiz_id?: string
          score?: number | null
          started_at?: string
          status?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          options: Json | null
          order_index: number
          points: number
          question_text: string
          question_type: string
          quiz_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          points?: number
          question_text: string
          question_type?: string
          quiz_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          points?: number
          question_text?: string
          question_type?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          grade: Database["public"]["Enums"]["grade_level"] | null
          id: string
          is_published: boolean
          teacher_id: string
          time_limit_minutes: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          is_published?: boolean
          teacher_id: string
          time_limit_minutes?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          is_published?: boolean
          teacher_id?: string
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      teacher_invite_codes: {
        Row: {
          code_hash: string
          created_at: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          code_hash: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          code_hash?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_scores: {
        Row: {
          id: string
          quiz_correct_answers: number
          total_points: number
          updated_at: string
          user_id: string
          video_watch_time_minutes: number
        }
        Insert: {
          id?: string
          quiz_correct_answers?: number
          total_points?: number
          updated_at?: string
          user_id: string
          video_watch_time_minutes?: number
        }
        Update: {
          id?: string
          quiz_correct_answers?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          video_watch_time_minutes?: number
        }
        Relationships: []
      }
      video_views: {
        Row: {
          id: string
          last_viewed_at: string | null
          user_id: string
          video_id: string
          view_count: number | null
        }
        Insert: {
          id?: string
          last_viewed_at?: string | null
          user_id: string
          video_id: string
          view_count?: number | null
        }
        Update: {
          id?: string
          last_viewed_at?: string | null
          user_id?: string
          video_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: Database["public"]["Enums"]["video_category"]
          created_at: string | null
          description: string | null
          duration: number | null
          grade: Database["public"]["Enums"]["grade_level"] | null
          id: string
          quality_hd: string | null
          quality_standard: string | null
          teacher_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          video_url: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["video_category"]
          created_at?: string | null
          description?: string | null
          duration?: number | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          quality_hd?: string | null
          quality_standard?: string | null
          teacher_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          video_url: string
        }
        Update: {
          category?: Database["public"]["Enums"]["video_category"]
          created_at?: string | null
          description?: string | null
          duration?: number | null
          grade?: Database["public"]["Enums"]["grade_level"] | null
          id?: string
          quality_hd?: string | null
          quality_standard?: string | null
          teacher_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_points: {
        Args: {
          p_correct_answers?: number
          p_points: number
          p_user_id: string
          p_watch_minutes?: number
        }
        Returns: undefined
      }
      assign_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      can_ip_register: {
        Args: {
          p_ip_address: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_view_count: { Args: { p_video_id: string }; Returns: Json }
      is_user_banned: { Args: { user_id: string }; Returns: boolean }
      register_ip_account: {
        Args: {
          p_ip_address: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "teacher" | "student" | "admin"
      grade_level:
        | "الصف السابع"
        | "الصف الثامن"
        | "الصف التاسع"
        | "الصف العاشر"
        | "الصف الحادي عشر"
        | "الصف الثاني عشر"
      video_category:
        | "عربي"
        | "English"
        | "علوم حياتية"
        | "كيمياء"
        | "رياضيات"
        | "مالية"
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
      app_role: ["teacher", "student", "admin"],
      grade_level: [
        "الصف السابع",
        "الصف الثامن",
        "الصف التاسع",
        "الصف العاشر",
        "الصف الحادي عشر",
        "الصف الثاني عشر",
      ],
      video_category: [
        "عربي",
        "English",
        "علوم حياتية",
        "كيمياء",
        "رياضيات",
        "مالية",
      ],
    },
  },
} as const
