import { demoMode } from '../mocks/demo-mode.js';

/**
 * Staff Permissions Service
 *
 * Provides functions for managing granular staff permissions and department access.
 * Master admins can manage all staff, department admins can manage their department's staff.
 */

// ===== STAFF PERMISSIONS =====

/**
 * Get all staff members (or filter by department for department admins)
 * @param {string} departmentFilter - Optional department to filter by
 * @returns {Promise<Array>} Array of staff/admin users
 */
export async function getAllStaff(departmentFilter = null) {
  try {
    const users = await demoMode.query('users');

    // Filter for non-student roles
    let staff = users.filter(u =>
      u.role === 'staff' ||
      u.role === 'department_admin' ||
      u.role === 'master_admin'
    );

    if (departmentFilter) {
      staff = staff.filter(u => u.department === departmentFilter);
    }

    return staff;
  } catch (error) {
    console.error('Failed to get staff:', error);
    throw error;
  }
}

/**
 * Get staff permissions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Permissions object
 */
export async function getStaffPermissions(userId) {
  try {
    const user = await demoMode.findOne('users', { id: userId });
    return user?.staff_permissions || {
      can_create_bookings: true,
      can_view_analytics: false,
      can_add_equipment_notes: false,
      can_request_access: false,
      accessible_departments: []
    };
  } catch (error) {
    console.error('Failed to get staff permissions:', error);
    throw error;
  }
}

/**
 * Update staff permissions
 * @param {string} userId - User ID
 * @param {Object} permissions - New permissions object
 * @returns {Promise<number>} Number of records updated
 */
export async function updateStaffPermissions(userId, permissions) {
  try {
    return await demoMode.update('users', { id: userId }, {
      staff_permissions: permissions
    });
  } catch (error) {
    console.error('Failed to update staff permissions:', error);
    throw error;
  }
}

/**
 * Grant department access to a staff member
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID to grant access to
 * @returns {Promise<Object>} Updated permissions
 */
export async function grantDepartmentAccess(userId, departmentId) {
  try {
    const currentPermissions = await getStaffPermissions(userId);
    const accessibleDepartments = currentPermissions.accessible_departments || [];

    if (!accessibleDepartments.includes(departmentId)) {
      accessibleDepartments.push(departmentId);
    }

    const updatedPermissions = {
      ...currentPermissions,
      accessible_departments: accessibleDepartments
    };

    await updateStaffPermissions(userId, updatedPermissions);
    return updatedPermissions;
  } catch (error) {
    console.error('Failed to grant department access:', error);
    throw error;
  }
}

/**
 * Revoke department access from a staff member
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID to revoke access from
 * @returns {Promise<Object>} Updated permissions
 */
export async function revokeDepartmentAccess(userId, departmentId) {
  try {
    const currentPermissions = await getStaffPermissions(userId);
    const accessibleDepartments = (currentPermissions.accessible_departments || [])
      .filter(id => id !== departmentId);

    const updatedPermissions = {
      ...currentPermissions,
      accessible_departments: accessibleDepartments
    };

    await updateStaffPermissions(userId, updatedPermissions);
    return updatedPermissions;
  } catch (error) {
    console.error('Failed to revoke department access:', error);
    throw error;
  }
}

/**
 * Toggle a specific feature permission for a staff member
 * @param {string} userId - User ID
 * @param {string} permissionKey - Permission key to toggle
 * @returns {Promise<Object>} Updated permissions
 */
export async function toggleFeaturePermission(userId, permissionKey) {
  try {
    const currentPermissions = await getStaffPermissions(userId);

    const updatedPermissions = {
      ...currentPermissions,
      [permissionKey]: !currentPermissions[permissionKey]
    };

    await updateStaffPermissions(userId, updatedPermissions);
    return updatedPermissions;
  } catch (error) {
    console.error('Failed to toggle feature permission:', error);
    throw error;
  }
}

/**
 * Get all admin users with their permissions
 * @returns {Promise<Array>} Array of admin users with admin_permissions
 */
export async function getAllAdmins() {
  try {
    const users = await demoMode.query('users');
    return users.filter(u =>
      u.role === 'department_admin' ||
      u.role === 'master_admin'
    );
  } catch (error) {
    console.error('Failed to get admins:', error);
    throw error;
  }
}

/**
 * Update admin permissions (master admin only)
 * @param {string} userId - User ID
 * @param {Object} permissions - Admin permissions object
 * @returns {Promise<number>} Number of records updated
 */
export async function updateAdminPermissions(userId, permissions) {
  try {
    return await demoMode.update('users', { id: userId }, {
      admin_permissions: permissions
    });
  } catch (error) {
    console.error('Failed to update admin permissions:', error);
    throw error;
  }
}

/**
 * Grant cross-department equipment access to a department admin
 * @param {string} adminId - Admin user ID
 * @param {string} departmentId - Department ID to grant access to
 * @returns {Promise<Object>} Updated permissions
 */
export async function grantAdminDepartmentAccess(adminId, departmentId) {
  try {
    const user = await demoMode.findOne('users', { id: adminId });
    const currentPermissions = user?.admin_permissions || {};
    const accessibleDepartments = currentPermissions.accessible_departments || [];

    if (!accessibleDepartments.includes(departmentId)) {
      accessibleDepartments.push(departmentId);
    }

    const updatedPermissions = {
      ...currentPermissions,
      accessible_departments: accessibleDepartments
    };

    await updateAdminPermissions(adminId, updatedPermissions);
    return updatedPermissions;
  } catch (error) {
    console.error('Failed to grant admin department access:', error);
    throw error;
  }
}

/**
 * Check if user has access to a specific department
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID
 * @param {Object} user - Optional user object (to avoid extra query)
 * @returns {Promise<boolean>} True if user has access
 */
export async function hasDepartmentAccess(userId, departmentId, user = null) {
  try {
    if (!user) {
      user = await demoMode.findOne('users', { id: userId });
    }

    // Master admin has access to all
    if (user.role === 'master_admin') return true;

    // Department admin has access to their managed department
    if (user.role === 'department_admin' && user.managed_department_id === departmentId) {
      return true;
    }

    // Check additional granted departments
    const permissions = user.admin_permissions || user.staff_permissions || {};
    const accessibleDepartments = permissions.accessible_departments || [];

    return accessibleDepartments.includes(departmentId);
  } catch (error) {
    console.error('Failed to check department access:', error);
    throw error;
  }
}

export default {
  // Staff Management
  getAllStaff,
  getStaffPermissions,
  updateStaffPermissions,
  grantDepartmentAccess,
  revokeDepartmentAccess,
  toggleFeaturePermission,

  // Admin Management
  getAllAdmins,
  updateAdminPermissions,
  grantAdminDepartmentAccess,

  // Access Checks
  hasDepartmentAccess
};
