/**
 * Mock Supabase Client for Demo Mode
 * Completely local - no external dependencies
 */

import { phase8Users } from '../mocks/demo-data-phase8';

// Mock storage for current session
let currentSession = null;

// Mock Supabase client that returns demo data
export const mockSupabase = {
  auth: {
    // Sign in with email/password
    signInWithPassword: async ({ email, password }) => {
      const user = phase8Users.find(u => u.email === email && u.password === password);

      if (!user) {
        return {
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials' }
        };
      }

      // Create mock session
      currentSession = {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: {
            full_name: user.full_name,
            role: user.role,
            department: user.department
          }
        },
        access_token: 'mock-token-' + user.id
      };

      // Store in localStorage
      localStorage.setItem('demo_session', JSON.stringify(currentSession));

      return {
        data: { user: currentSession.user, session: currentSession },
        error: null
      };
    },

    // Sign out
    signOut: async () => {
      currentSession = null;
      localStorage.removeItem('demo_session');
      return { error: null };
    },

    // Get current session
    getSession: async () => {
      const stored = localStorage.getItem('demo_session');
      if (stored) {
        currentSession = JSON.parse(stored);
      }
      return {
        data: { session: currentSession },
        error: null
      };
    },

    // Get current user
    getUser: async () => {
      const stored = localStorage.getItem('demo_session');
      if (stored) {
        currentSession = JSON.parse(stored);
      }
      return {
        data: { user: currentSession?.user || null },
        error: null
      };
    },

    // On auth state change (mock event listener)
    onAuthStateChange: (callback) => {
      // Call immediately with current state
      callback('INITIAL_SESSION', currentSession);

      // Return unsubscribe function
      return {
        data: { subscription: { unsubscribe: () => {} } }
      };
    }
  },

  // Mock database queries (not needed for demo but prevents errors)
  from: (table) => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: null })
      }),
      order: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  }),

  // Mock RPC calls
  rpc: () => Promise.resolve({ data: null, error: null })
};

// Export as default
export default mockSupabase;
