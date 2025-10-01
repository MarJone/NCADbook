import { demoMode } from '../mocks/demo-mode.js';

export const authService = {
  async login(email, password) {
    const user = await demoMode.findOne('users', { email, password });
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    demoMode.setCurrentUser(userWithoutPassword);
    
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
