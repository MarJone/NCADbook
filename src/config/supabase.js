/**
 * Supabase Configuration
 *
 * DEMO MODE: Always uses mock Supabase client with local data
 * No external database required - perfect for demos!
 */

import mockSupabase from './supabase-mock';

// Always use demo mode for GitHub Pages deployment
console.log('🎭 Running in DEMO MODE - Using local data only (no database required)');

// Export mock client as supabase
export const supabase = mockSupabase;

// Export demo mode flag (always true)
export const isDemoMode = true;
