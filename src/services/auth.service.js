import { demoMode } from '../mocks/demo-mode.js';
import { supabase } from '../config/supabase';

const USE_SUPABASE = import.meta.env.VITE_DEMO_MODE !== 'true';

// Debug logging
console.log('🔍 Auth Debug:', {
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
  USE_SUPABASE,
  mode: USE_SUPABASE ? 'Supabase' : 'Demo Mode'
});

export const authService = {
  async login(email, password) {
    console.log('🔐 Login attempt:', { email, USE_SUPABASE });

    if (USE_SUPABASE) {
      // Use Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);

      console.log('✅ Supabase auth successful, user ID:', data.user.id);

      // Wait a moment for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh session to ensure it's active
      await supabase.auth.refreshSession();

      // Fetch user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('❌ User profile fetch error:', userError);
        console.log('Trying to fetch user ID:', data.user.id);

        // Debug: Check current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session user:', sessionData?.session?.user?.id);

        throw new Error(`User profile not found: ${userError.message}`);
      }

      console.log('✅ User profile loaded:', userData.email, userData.role);
      return userData;
    } else {
      // Demo mode
      console.log('📦 Demo mode - searching for user:', email);

      const user = await demoMode.findOne('users', { email, password });

      console.log('👤 User search result:', user ? 'Found' : 'Not found');

      if (!user) {
        // Debug: Show all available users
        const allUsers = await demoMode.query('users');
        console.log('📋 Available demo users:', allUsers.map(u => ({ email: u.email, role: u.role })));
        throw new Error('Invalid email or password');
      }

      const { password: _, ...userWithoutPassword } = user;
      demoMode.setCurrentUser(userWithoutPassword);

      console.log('✅ Demo login successful:', userWithoutPassword.email, userWithoutPassword.role);
      return userWithoutPassword;
    }
  },

  async logout() {
    if (USE_SUPABASE) {
      await supabase.auth.signOut();
    } else {
      demoMode.clearCurrentUser();
    }
  },

  async getCurrentUser() {
    if (USE_SUPABASE) {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) return null;

      // Fetch user profile from users table
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return userData;
    } else {
      return demoMode.getCurrentUser();
    }
  },

  async register(userData) {
    const existing = await demoMode.findOne('users', { email: userData.email });
    if (existing) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      created_at: new Date().toISOString()
    };

    await demoMode.insert('users', newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  hasPermission(user, requiredRole) {
    const roleHierarchy = {
      student: 1,
      staff: 2,
      admin: 3,
      master_admin: 4
    };

    return roleHierarchy[user?.role] >= roleHierarchy[requiredRole];
  }
};
