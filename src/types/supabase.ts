export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          locale: string;
          premium: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          premium?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          premium?: boolean;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: number;
          code: string;
          name_ru: string;
          name_en: string;
          flag_emoji: string | null;
          group_letter: string | null;
        };
        Insert: {
          id?: number;
          code: string;
          name_ru: string;
          name_en: string;
          flag_emoji?: string | null;
          group_letter?: string | null;
        };
        Update: {
          id?: number;
          code?: string;
          name_ru?: string;
          name_en?: string;
          flag_emoji?: string | null;
          group_letter?: string | null;
        };
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          groups: Json;
          bracket: Json;
          champion_team_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          groups: Json;
          bracket: Json;
          champion_team_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          groups?: Json;
          bracket?: Json;
          champion_team_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      leagues: {
        Row: {
          id: string;
          code: string;
          name: string;
          owner_id: string;
          is_paid: boolean;
          entry_fee: number | null;
          prize_pool: number | null;
          locked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          owner_id: string;
          is_paid?: boolean;
          entry_fee?: number | null;
          prize_pool?: number | null;
          locked_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          owner_id?: string;
          is_paid?: boolean;
          entry_fee?: number | null;
          prize_pool?: number | null;
          locked_at?: string | null;
          created_at?: string;
        };
      };
      league_members: {
        Row: {
          league_id: string;
          user_id: string;
          joined_at: string;
          points: number;
        };
        Insert: {
          league_id: string;
          user_id: string;
          joined_at?: string;
          points?: number;
        };
        Update: {
          league_id?: string;
          user_id?: string;
          joined_at?: string;
          points?: number;
        };
      };
      daily_challenges: {
        Row: {
          id: string;
          active_date: string;
          question_ru: string;
          question_en: string;
          options: Json;
          correct_option_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          active_date: string;
          question_ru: string;
          question_en: string;
          options: Json;
          correct_option_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          active_date?: string;
          question_ru?: string;
          question_en?: string;
          options?: Json;
          correct_option_id?: string | null;
          created_at?: string;
        };
      };
      daily_submissions: {
        Row: {
          challenge_id: string;
          user_id: string;
          option_id: string;
          is_correct: boolean | null;
          submitted_at: string;
        };
        Insert: {
          challenge_id: string;
          user_id: string;
          option_id: string;
          is_correct?: boolean | null;
          submitted_at?: string;
        };
        Update: {
          challenge_id?: string;
          user_id?: string;
          option_id?: string;
          is_correct?: boolean | null;
          submitted_at?: string;
        };
      };
      penalty_scores: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          played_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          played_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score?: number;
          played_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
