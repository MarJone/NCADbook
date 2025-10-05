import { demoMode } from '../mocks/demo-mode.js';

console.log('🎭 Auth Service - Running in Demo Mode (no database required)');

export const authService = {
  async login(email, password) {
    console.log('🔐 Demo login attempt:', email);

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
  },

  async logout() {
    demoMode.clearCurrentUser();
  },

  async getCurrentUser() {
    return demoMode.getCurrentUser();
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
