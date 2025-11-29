import { createClient } from '@supabase/supabase-js';
import { Task } from '../types';

// Supabase configuration
// Get these from your Supabase project settings: https://app.supabase.com
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key not found. Using localStorage fallback.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database types (will be generated from Supabase schema)
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: Task & {
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Task, 'id'> & {
          user_id: string;
          id?: string;
        };
        Update: Partial<Task> & {
          updated_at?: string;
        };
      };
    };
  };
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Export typed client
export type SupabaseClient = typeof supabase;

