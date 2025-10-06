/**
 * API Client for NCADbook Backend
 * Handles all HTTP requests with authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Get auth token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('ncadbook_token');
};

/**
 * Set auth token in localStorage
 */
const setToken = (token) => {
  localStorage.setItem('ncadbook_token', token);
};

/**
 * Remove auth token from localStorage
 */
const removeToken = () => {
  localStorage.removeItem('ncadbook_token');
};

/**
 * Make authenticated API request
 */
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    }

    const data = await response.json();

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        removeToken();
        window.location.href = '/NCADbook/';
      }
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  /**
   * Login with email and password
   */
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  /**
   * Demo login by role (no password)
   */
  demoLogin: async (role) => {
    const data = await request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  /**
   * Register new user (Master Admin only)
   */
  register: async (userData) => {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    return await request('/auth/me');
  },

  /**
   * Update password
   */
  updatePassword: async (currentPassword, newPassword) => {
    return await request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },

  /**
   * Logout
   */
  logout: () => {
    removeToken();
    window.location.href = '/NCADbook/';
  },
};

// ============================================
// EQUIPMENT API
// ============================================

export const equipmentAPI = {
  /**
   * Get all equipment with optional filters
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/equipment?${queryString}` : '/equipment';
    return await request(endpoint);
  },

  /**
   * Get single equipment by ID
   */
  getById: async (id) => {
    return await request(`/equipment/${id}`);
  },

  /**
   * Check equipment availability
   */
  checkAvailability: async (id, startDate, endDate) => {
    return await request(
      `/equipment/${id}/availability?start_date=${startDate}&end_date=${endDate}`
    );
  },

  /**
   * Create new equipment (Admin only)
   */
  create: async (equipmentData) => {
    return await request('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData),
    });
  },

  /**
   * Update equipment (Admin only)
   */
  update: async (id, equipmentData) => {
    return await request(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipmentData),
    });
  },

  /**
   * Delete equipment (Master Admin only)
   */
  delete: async (id) => {
    return await request(`/equipment/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// BOOKINGS API (Placeholder - to be implemented)
// ============================================

export const bookingsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/bookings?${queryString}` : '/bookings';
    return await request(endpoint);
  },

  getById: async (id) => {
    return await request(`/bookings/${id}`);
  },

  create: async (bookingData) => {
    return await request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  approve: async (id) => {
    return await request(`/bookings/${id}/approve`, {
      method: 'PUT',
    });
  },

  deny: async (id, reason) => {
    return await request(`/bookings/${id}/deny`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },

  return: async (id) => {
    return await request(`/bookings/${id}/return`, {
      method: 'PUT',
    });
  },
};

// ============================================
// USERS API (Placeholder - to be implemented)
// ============================================

export const usersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return await request(endpoint);
  },

  getById: async (id) => {
    return await request(`/users/${id}`);
  },

  update: async (id, userData) => {
    return await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  delete: async (id) => {
    return await request(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// DEPARTMENTS API (Placeholder - to be implemented)
// ============================================

export const departmentsAPI = {
  getAll: async () => {
    return await request('/departments');
  },

  getById: async (id) => {
    return await request(`/departments/${id}`);
  },
};

// ============================================
// CSV IMPORT API
// ============================================

export const csvAPI = {
  /**
   * Preview CSV before import
   */
  preview: async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return await fetch(`${API_BASE_URL}/csv/preview`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  /**
   * Import users from CSV
   */
  importUsers: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await fetch(`${API_BASE_URL}/csv/import/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  /**
   * Import equipment from CSV
   */
  importEquipment: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await fetch(`${API_BASE_URL}/csv/import/equipment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    }).then(res => res.json());
  },

  /**
   * Download CSV template
   */
  downloadTemplate: async (type) => {
    const token = getToken();
    window.open(
      `${API_BASE_URL}/csv/template/${type}?token=${token}`,
      '_blank'
    );
  },
};

// ============================================
// ANALYTICS API (Placeholder - to be implemented)
// ============================================

export const analyticsAPI = {
  getDashboard: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/dashboard?${queryString}` : '/analytics/dashboard';
    return await request(endpoint);
  },

  exportReport: async (format, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/analytics/export/${format}?${queryString}`;
    return await request(endpoint);
  },
};

// Export token management functions
export const tokenManager = {
  getToken,
  setToken,
  removeToken,
  hasToken: () => !!getToken(),
};

export default {
  authAPI,
  equipmentAPI,
  bookingsAPI,
  usersAPI,
  departmentsAPI,
  csvAPI,
  analyticsAPI,
  tokenManager,
};
