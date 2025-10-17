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
      // TEMPORARILY DISABLED: No login in this version
      // if (response.status === 401) {
      //   removeToken();
      //   window.location.href = '/NCADbook/';
      // }
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

  /**
   * Get equipment notes (Admin only)
   */
  getNotes: async (id) => {
    return await request(`/equipment/${id}/notes`);
  },

  /**
   * Add equipment note (Admin only)
   */
  addNote: async (id, noteData) => {
    return await request(`/equipment/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  /**
   * Delete equipment note (Admin only)
   */
  deleteNote: async (id, noteId) => {
    return await request(`/equipment/${id}/notes/${noteId}`, {
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
  /**
   * Get all users with optional filters
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return await request(endpoint);
  },

  /**
   * Get user by ID
   */
  getById: async (id) => {
    return await request(`/users/${id}`);
  },

  /**
   * Create new user (Master Admin only)
   */
  create: async (userData) => {
    return await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user (Master Admin only)
   */
  update: async (id, userData) => {
    return await request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user (Master Admin only)
   */
  delete: async (id) => {
    return await request(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Add strike to user (Admin only)
   */
  addStrike: async (userId, strikeData) => {
    return await request(`/users/${userId}/strikes`, {
      method: 'POST',
      body: JSON.stringify(strikeData),
    });
  },

  /**
   * Get user strikes
   */
  getStrikes: async (userId) => {
    return await request(`/users/${userId}/strikes`);
  },

  /**
   * Revoke a strike (Admin only)
   */
  revokeStrike: async (userId, strikeId, reason) => {
    return await request(`/users/${userId}/strikes/${strikeId}/revoke`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  },
};

// ============================================
// DEPARTMENTS API
// ============================================

export const departmentsAPI = {
  /**
   * Get all departments/sub-areas
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/departments?${queryString}` : '/departments';
    return await request(endpoint);
  },

  /**
   * Get department by ID
   */
  getById: async (id) => {
    return await request(`/departments/${id}`);
  },

  /**
   * Create new department (Master Admin only)
   */
  create: async (departmentData) => {
    return await request('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData),
    });
  },

  /**
   * Update department (Master Admin only)
   */
  update: async (id, departmentData) => {
    return await request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData),
    });
  },

  /**
   * Delete department (Master Admin only)
   */
  delete: async (id) => {
    return await request(`/departments/${id}`, {
      method: 'DELETE',
    });
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
// ANALYTICS API
// ============================================

export const analyticsAPI = {
  /**
   * Get comprehensive dashboard analytics
   * @param {Object} params - Optional filters (start_date, end_date, department)
   */
  getDashboard: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/dashboard?${queryString}` : '/analytics/dashboard';
    return await request(endpoint);
  },

  /**
   * Get equipment utilization report
   * @param {Object} params - Optional filters (start_date, end_date, department)
   */
  getUtilization: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/utilization?${queryString}` : '/analytics/utilization';
    return await request(endpoint);
  },

  /**
   * Export analytics to CSV
   * @param {Object} params - Filters and type (start_date, end_date, department, type: 'bookings'|'equipment')
   */
  exportCSV: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/analytics/export/csv?${queryString}` : '/analytics/export/csv';

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    // Trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  },

  /**
   * Export analytics to PDF (Frontend implementation using jsPDF)
   * Note: PDF generation is done client-side using jsPDF library
   * @param {Object} analyticsData - Dashboard data to export
   * @param {Object} options - Export options (title, filters, etc.)
   */
  exportPDF: async (analyticsData, options = {}) => {
    // This is a placeholder - actual PDF generation should be done in the frontend
    // using jsPDF library which is already in package.json
    console.warn('PDF export should be implemented in the frontend using jsPDF');
    return { success: false, message: 'Use frontend jsPDF implementation' };
  },
};

// ============================================
// SYSTEM SETTINGS API
// ============================================

export const systemSettingsAPI = {
  /**
   * Get all system settings
   */
  getAll: async () => {
    return await request('/settings');
  },

  /**
   * Get single setting by key
   */
  getByKey: async (key) => {
    return await request(`/settings/${key}`);
  },

  /**
   * Update or create system setting (Master Admin only)
   */
  update: async (key, value, description) => {
    return await request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value, description }),
    });
  },

  /**
   * Delete system setting (Master Admin only)
   */
  delete: async (key) => {
    return await request(`/settings/${key}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// EQUIPMENT KITS API
// ============================================

export const equipmentKitsAPI = {
  /**
   * Get all equipment kits
   */
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/kits?${queryString}` : '/kits';
    return await request(endpoint);
  },

  /**
   * Get kit by ID with equipment details
   */
  getById: async (id) => {
    return await request(`/kits/${id}`);
  },

  /**
   * Create new equipment kit (Admin only)
   */
  create: async (kitData) => {
    return await request('/kits', {
      method: 'POST',
      body: JSON.stringify(kitData),
    });
  },

  /**
   * Update equipment kit (Admin only)
   */
  update: async (id, kitData) => {
    return await request(`/kits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(kitData),
    });
  },

  /**
   * Delete equipment kit (Admin only)
   */
  delete: async (id) => {
    return await request(`/kits/${id}`, {
      method: 'DELETE',
    });
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
  systemSettingsAPI,
  equipmentKitsAPI,
  tokenManager,
};
