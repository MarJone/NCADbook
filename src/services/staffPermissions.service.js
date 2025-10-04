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

// NOTE: revokeDepartmentAccess is defined later with expiry support

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

/**
 * Get permission presets for quick application
 * @returns {Object} Object containing admin and staff presets
 */
export function getPermissionPresets() {
  return {
    admin: {
      full_access: {
        name: 'Full Access',
        permissions: {
          manage_equipment: true,
          manage_users: true,
          manage_bookings: true,
          view_analytics: true,
          export_data: true,
          add_equipment_notes: true,
          csv_import: true,
          manage_kits: true,
          accessible_departments: []
        }
      },
      booking_manager: {
        name: 'Booking Manager',
        permissions: {
          manage_equipment: false,
          manage_users: false,
          manage_bookings: true,
          view_analytics: true,
          export_data: true,
          add_equipment_notes: true,
          csv_import: false,
          manage_kits: false,
          accessible_departments: []
        }
      },
      equipment_manager: {
        name: 'Equipment Manager',
        permissions: {
          manage_equipment: true,
          manage_users: false,
          manage_bookings: false,
          view_analytics: true,
          export_data: false,
          add_equipment_notes: true,
          csv_import: false,
          manage_kits: true,
          accessible_departments: []
        }
      },
      view_only: {
        name: 'View Only',
        permissions: {
          manage_equipment: false,
          manage_users: false,
          manage_bookings: false,
          view_analytics: true,
          export_data: false,
          add_equipment_notes: false,
          csv_import: false,
          manage_kits: false,
          accessible_departments: []
        }
      }
    },
    staff: {
      full_staff: {
        name: 'Full Staff Access',
        permissions: {
          can_create_bookings: true,
          can_view_analytics: true,
          can_add_equipment_notes: true,
          can_request_access: true,
          accessible_departments: []
        }
      },
      basic_staff: {
        name: 'Basic Staff Access',
        permissions: {
          can_create_bookings: true,
          can_view_analytics: false,
          can_add_equipment_notes: false,
          can_request_access: true,
          accessible_departments: []
        }
      }
    }
  };
}

/**
 * Apply a permission preset to a user
 * @param {string} userId - User ID
 * @param {string} presetName - Name of the preset to apply
 * @param {boolean} isAdmin - Whether this is an admin (true) or staff (false)
 * @returns {Promise<Object>} Updated permissions
 */
export async function applyPermissionPreset(userId, presetName, isAdmin = true) {
  try {
    const presets = getPermissionPresets();
    const preset = isAdmin ? presets.admin[presetName] : presets.staff[presetName];

    if (!preset) {
      throw new Error(`Preset "${presetName}" not found`);
    }

    if (isAdmin) {
      await updateAdminPermissions(userId, preset.permissions);
    } else {
      await updateStaffPermissions(userId, preset.permissions);
    }

    return preset.permissions;
  } catch (error) {
    console.error('Failed to apply permission preset:', error);
    throw error;
  }
}

/**
 * Grant department access with optional expiry date
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID to grant access to
 * @param {string} expiryDate - Optional ISO date string for when access expires
 * @param {boolean} isAdmin - Whether this is an admin (true) or staff (false)
 * @returns {Promise<Object>} Updated permissions
 */
export async function grantDepartmentAccessWithExpiry(userId, departmentId, expiryDate = null, isAdmin = true) {
  try {
    const currentPermissions = isAdmin
      ? (await demoMode.findOne('users', { id: userId }))?.admin_permissions || {}
      : await getStaffPermissions(userId);

    const accessibleDepartments = currentPermissions.accessible_departments || [];

    if (!accessibleDepartments.includes(departmentId)) {
      accessibleDepartments.push(departmentId);
    }

    // Store expiry dates in a separate object
    const departmentAccessExpiry = currentPermissions.department_access_expiry || {};
    if (expiryDate) {
      departmentAccessExpiry[departmentId] = {
        expiry: expiryDate,
        granted_at: new Date().toISOString()
      };
    }

    const updatedPermissions = {
      ...currentPermissions,
      accessible_departments: accessibleDepartments,
      department_access_expiry: departmentAccessExpiry
    };

    if (isAdmin) {
      await updateAdminPermissions(userId, updatedPermissions);
    } else {
      await updateStaffPermissions(userId, updatedPermissions);
    }

    return updatedPermissions;
  } catch (error) {
    console.error('Failed to grant department access with expiry:', error);
    throw error;
  }
}

/**
 * Revoke department access from a user
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID to revoke access from
 * @param {boolean} isAdmin - Whether this is an admin (true) or staff (false)
 * @returns {Promise<Object>} Updated permissions
 */
export async function revokeDepartmentAccess(userId, departmentId, isAdmin = true) {
  try {
    const currentPermissions = isAdmin
      ? (await demoMode.findOne('users', { id: userId }))?.admin_permissions || {}
      : await getStaffPermissions(userId);

    const accessibleDepartments = (currentPermissions.accessible_departments || [])
      .filter(id => id !== departmentId);

    // Remove expiry data if exists
    const departmentAccessExpiry = { ...currentPermissions.department_access_expiry } || {};
    delete departmentAccessExpiry[departmentId];

    const updatedPermissions = {
      ...currentPermissions,
      accessible_departments: accessibleDepartments,
      department_access_expiry: departmentAccessExpiry
    };

    if (isAdmin) {
      await updateAdminPermissions(userId, updatedPermissions);
    } else {
      await updateStaffPermissions(userId, updatedPermissions);
    }

    return updatedPermissions;
  } catch (error) {
    console.error('Failed to revoke department access:', error);
    throw error;
  }
}

/**
 * Get staff members in a specific department (for department admins)
 * @param {string} departmentId - Department ID to filter by
 * @returns {Promise<Array>} Array of staff members in the department
 */
export async function getDepartmentStaff(departmentId) {
  try {
    const users = await demoMode.query('users');

    // Filter for staff role only in the specified department
    return users.filter(u =>
      u.role === 'staff' &&
      u.managed_department_id === departmentId
    );
  } catch (error) {
    console.error('Failed to get department staff:', error);
    throw error;
  }
}

/**
 * Update staff view permissions (what staff can see/do)
 * @param {string} staffId - Staff user ID
 * @param {Object} permissions - View permissions object
 * @param {string} modifiedBy - Email of admin making the change
 * @returns {Promise<number>} Number of records updated
 */
export async function updateStaffViewPermissions(staffId, permissions, modifiedBy) {
  try {
    const updatedPermissions = {
      ...permissions,
      modified_by: modifiedBy,
      modified_at: new Date().toISOString()
    };

    return await demoMode.update('users', { id: staffId }, {
      view_permissions: updatedPermissions
    });
  } catch (error) {
    console.error('Failed to update staff view permissions:', error);
    throw error;
  }
}

/**
 * Get default staff view permissions (safe defaults)
 * @returns {Object} Default permissions object
 */
export function getDefaultStaffPermissions() {
  return {
    can_view_catalog: true,
    can_create_bookings: true,
    can_cancel_bookings: true,
    can_view_history: true,
    can_view_analytics: false,
    can_export_data: false,
    can_request_access: true,
    email_notifications: true
  };
}

/**
 * Bulk update all staff in a department with same permissions
 * @param {string} departmentId - Department ID
 * @param {Object} permissions - Permissions to apply to all staff
 * @returns {Promise<number>} Number of staff updated
 */
export async function bulkUpdateDepartmentStaff(departmentId, permissions) {
  try {
    const staffMembers = await getDepartmentStaff(departmentId);
    let updateCount = 0;

    for (const staff of staffMembers) {
      await demoMode.update('users', { id: staff.id }, {
        view_permissions: permissions
      });
      updateCount++;
    }

    return updateCount;
  } catch (error) {
    console.error('Failed to bulk update department staff:', error);
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

  // Permission Presets
  getPermissionPresets,
  applyPermissionPreset,

  // Department Access with Expiry
  grantDepartmentAccessWithExpiry,

  // Access Checks
  hasDepartmentAccess,

  // Department-Specific Staff Management (NEW)
  getDepartmentStaff,
  updateStaffViewPermissions,
  getDefaultStaffPermissions,
  bulkUpdateDepartmentStaff
};
