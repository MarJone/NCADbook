import { authAPI, tokenManager } from '../utils/api';

console.log('🔐 Auth Service - Using Backend API');

export const authService = {
  async login(email, password) {
    console.log('🔐 API login attempt:', email);

    try {
      const response = await authAPI.login(email, password);

      // Store user in localStorage
      localStorage.setItem('ncadbook_user', JSON.stringify(response.user));

      console.log('✅ API login successful:', response.user.email, response.user.role);
      return response.user;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  async demoLogin(role) {
    console.log('🔐 Demo login attempt:', role);

    try {
      const response = await authAPI.demoLogin(role);

      // Store user in localStorage
      localStorage.setItem('ncadbook_user', JSON.stringify(response.user));

      console.log('✅ Demo login successful:', response.user.email, response.user.role);
      return response.user;
    } catch (error) {
      console.error('❌ Demo login failed:', error);
      throw error;
    }
  },

  async logout() {
    authAPI.logout();
    localStorage.removeItem('ncadbook_user');
  },

  async getCurrentUser() {
    // First check localStorage for cached user
    const cachedUser = localStorage.getItem('ncadbook_user');

    if (!cachedUser) {
      return null;
    }

    // If we have a token, verify it's still valid by fetching from API
    if (tokenManager.hasToken()) {
      try {
        const response = await authAPI.getCurrentUser();

        // Update cached user
        localStorage.setItem('ncadbook_user', JSON.stringify(response.user));

        return response.user;
      } catch (error) {
        // Token is invalid, clear cache
        console.warn('Token invalid, clearing auth cache');
        localStorage.removeItem('ncadbook_user');
        tokenManager.removeToken();
        return null;
      }
    }

    return JSON.parse(cachedUser);
  },

  async register(userData) {
    try {
      const response = await authAPI.register(userData);

      // Store user in localStorage
      localStorage.setItem('ncadbook_user', JSON.stringify(response.user));

      return response.user;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  hasPermission(user, requiredRole) {
    const roleHierarchy = {
      student: 1,
      staff: 2,
      department_admin: 3,
      master_admin: 4
    };

    return roleHierarchy[user?.role] >= roleHierarchy[requiredRole];
  }
};
