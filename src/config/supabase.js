import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode fallback - use placeholder values if not configured
const DEMO_MODE = !supabaseUrl || !supabaseAnonKey ||
                  supabaseUrl.includes('YOUR_') || supabaseAnonKey.includes('YOUR_');

if (DEMO_MODE) {
  console.log('🎭 Running in DEMO MODE - Using local data only (no database)');
}

// Create Supabase client with demo fallback
export const supabase = createClient(
  supabaseUrl || 'https://demo.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

// Export demo mode flag for use in other modules
export const isDemoMode = DEMO_MODE;
