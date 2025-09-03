import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          nickname: string
          age: number
          prefecture: string | null
          city: string | null
          occupation: string | null
          height: number | null
          weight: number | null
          body_type: string | null
          bio: string | null
          interests: string[]
          lifestyle: Record<string, any>
          relationship_status: string | null
          looking_for: string | null
          photos: string[]
          main_photo_url: string | null
          is_verified: boolean
          is_premium: boolean
          is_vip: boolean
          privacy_settings: Record<string, any>
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          nickname: string
          age: number
          prefecture?: string | null
          city?: string | null
          occupation?: string | null
          height?: number | null
          weight?: number | null
          body_type?: string | null
          bio?: string | null
          interests?: string[]
          lifestyle?: Record<string, any>
          relationship_status?: string | null
          looking_for?: string | null
          photos?: string[]
          main_photo_url?: string | null
          is_verified?: boolean
          is_premium?: boolean
          is_vip?: boolean
          privacy_settings?: Record<string, any>
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          nickname?: string
          age?: number
          prefecture?: string | null
          city?: string | null
          occupation?: string | null
          height?: number | null
          weight?: number | null
          body_type?: string | null
          bio?: string | null
          interests?: string[]
          lifestyle?: Record<string, any>
          relationship_status?: string | null
          looking_for?: string | null
          photos?: string[]
          main_photo_url?: string | null
          is_verified?: boolean
          is_premium?: boolean
          is_vip?: boolean
          privacy_settings?: Record<string, any>
          last_active?: string
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          liker_id: string
          liked_id: string
          is_super_like: boolean
          created_at: string
        }
        Insert: {
          id?: string
          liker_id: string
          liked_id: string
          is_super_like?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          liker_id?: string
          liked_id?: string
          is_super_like?: boolean
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          matched_at: string
          status: string
          ended_by: string | null
          ended_at: string | null
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          matched_at?: string
          status?: string
          ended_by?: string | null
          ended_at?: string | null
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          matched_at?: string
          status?: string
          ended_by?: string | null
          ended_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_id: string
          content: string
          message_type: string
          media_url: string | null
          is_read: boolean
          read_at: string | null
          is_deleted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          sender_id: string
          content: string
          message_type?: string
          media_url?: string | null
          is_read?: boolean
          read_at?: string | null
          is_deleted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          sender_id?: string
          content?: string
          message_type?: string
          media_url?: string | null
          is_read?: boolean
          read_at?: string | null
          is_deleted?: boolean
          created_at?: string
        }
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          blocker_id: string
          blocked_id: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          blocker_id?: string
          blocked_id?: string
          reason?: string | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          report_type: string
          description: string | null
          evidence_urls: string[]
          status: string
          resolved_by: string | null
          resolution_notes: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_id: string
          report_type: string
          description?: string | null
          evidence_urls?: string[]
          status?: string
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_id?: string
          report_type?: string
          description?: string | null
          evidence_urls?: string[]
          status?: string
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
      }
      verification_requests: {
        Row: {
          id: string
          user_id: string
          verification_type: string
          document_url: string | null
          selfie_url: string | null
          status: string
          reviewed_by: string | null
          review_notes: string | null
          created_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          verification_type: string
          document_url?: string | null
          selfie_url?: string | null
          status?: string
          reviewed_by?: string | null
          review_notes?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          verification_type?: string
          document_url?: string | null
          selfie_url?: string | null
          status?: string
          reviewed_by?: string | null
          review_notes?: string | null
          created_at?: string
          reviewed_at?: string | null
        }
      }
      profile_views: {
        Row: {
          id: string
          viewer_id: string
          viewed_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          viewer_id: string
          viewed_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          viewer_id?: string
          viewed_id?: string
          viewed_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          amount: number
          currency: string
          payment_method: string | null
          stripe_payment_intent_id: string | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          amount: number
          currency?: string
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          amount?: number
          currency?: string
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          status?: string | null
          created_at?: string
        }
      }
      daily_swipe_limits: {
        Row: {
          id: string
          user_id: string
          date: string
          swipes_used: number
          likes_used: number
          super_likes_used: number
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          swipes_used?: number
          likes_used?: number
          super_likes_used?: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          swipes_used?: number
          likes_used?: number
          super_likes_used?: number
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          data: Record<string, any> | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          data?: Record<string, any> | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          data?: Record<string, any> | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      profiles: {
        Row: {
          id: string
          nickname: string
          age: number
          prefecture: string | null
          city: string | null
          occupation: string | null
          height: number | null
          weight: number | null
          body_type: string | null
          bio: string | null
          interests: string[]
          lifestyle: Record<string, any>
          relationship_status: string | null
          looking_for: string | null
          photos: string[]
          main_photo_url: string | null
          is_verified: boolean
          is_premium: boolean
          is_vip: boolean
          last_active: string
          created_at: string
        }
      }
    }
    Functions: {
      are_matched: {
        Args: {
          user1: string
          user2: string
        }
        Returns: boolean
      }
      get_match: {
        Args: {
          user1: string
          user2: string
        }
        Returns: string | null
      }
      has_liked: {
        Args: {
          liker: string
          liked: string
        }
        Returns: boolean
      }
    }
  }
}