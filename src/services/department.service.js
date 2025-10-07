import { departmentsAPI, equipmentAPI, usersAPI } from '../utils/api.js';
import { demoMode } from '../mocks/demo-mode.js';

/**
 * Department Service
 *
 * Provides functions for managing departments, department admins, student assignments,
 * and interdisciplinary access grants.
 * Note: Advanced features (dept admins, student assignments, interdisciplinary access)
 * still use demoMode pending backend endpoints.
 */

// ===== DEPARTMENTS =====

/**
 * Get all departments
 * @returns {Promise<Array>} Array of department objects
 */
export async function getAllDepartments() {
  try {
    const response = await departmentsAPI.getAll();
    return response.departments || [];
  } catch (error) {
    console.error('Failed to get departments:', error);
    throw error;
  }
}

/**
 * Get a single department by ID
 * @param {string} id - Department ID
 * @returns {Promise<Object|null>} Department object or null
 */
export async function getDepartmentById(id) {
  try {
    const response = await departmentsAPI.getById(id);
    return response.department || null;
  } catch (error) {
    console.error('Failed to get department:', error);
    throw error;
  }
}

/**
 * Create a new department
 * @param {string} name - Department name
 * @param {string} description - Description
 * @param {string} parentDepartment - Parent department
 * @returns {Promise<Object>} Created department object
 */
export async function createDepartment(name, description, parentDepartment) {
  try {
    const response = await departmentsAPI.create({
      name,
      description: description || '',
      school: parentDepartment || '',
    });
    return response.department;
  } catch (error) {
    console.error('Failed to create department:', error);
    throw error;
  }
}

/**
 * Update a department
 * @param {string} id - Department ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated department object
 */
export async function updateDepartment(id, updates) {
  try {
    const response = await departmentsAPI.update(id, updates);
    return response.department;
  } catch (error) {
    console.error('Failed to update department:', error);
    throw error;
  }
}

/**
 * Deactivate a department
 * @param {string} id - Department ID
 * @returns {Promise<Object>} Updated department object
 */
export async function deactivateDepartment(id) {
  try {
    const response = await departmentsAPI.update(id, { is_active: false });
    return response.department;
  } catch (error) {
    console.error('Failed to deactivate department:', error);
    throw error;
  }
}

/**
 * Get equipment count by department
 * @returns {Promise<Object>} Object mapping department IDs to equipment counts
 */
export async function getEquipmentCountByDepartment() {
  try {
    const response = await equipmentAPI.getAll();
    const equipment = response.equipment || [];
    const counts = {};

    equipment.forEach(item => {
      if (item.department || item.sub_area_id) {
        const deptId = item.department || item.sub_area_id;
        counts[deptId] = (counts[deptId] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error('Failed to get equipment counts:', error);
    throw error;
  }
}

// ===== DEPARTMENT ADMINS =====

/**
 * Get all department admins for a department
 * @param {string} departmentId - Department ID
 * @returns {Promise<Array>} Array of department admin assignments
 */
export async function getDepartmentAdmins(departmentId) {
  try {
    return await demoMode.query('area_admins', { sub_area_id: departmentId });
  } catch (error) {
    console.error('Failed to get department admins:', error);
    throw error;
  }
}

/**
 * Assign a user as department admin for a department
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID
 * @returns {Promise<Object>} Created assignment
 */
export async function assignDepartmentAdmin(userId, departmentId) {
  try {
    const assignment = {
      id: `aa${Date.now()}`,
      user_id: userId,
      sub_area_id: departmentId,
      created_at: new Date().toISOString()
    };

    await demoMode.insert('area_admins', assignment);
    return assignment;
  } catch (error) {
    console.error('Failed to assign department admin:', error);
    throw error;
  }
}

/**
 * Remove department admin assignment
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID
 * @returns {Promise<number>} Number of records deleted
 */
export async function removeDepartmentAdmin(userId, departmentId) {
  try {
    return await demoMode.delete('area_admins', {
      user_id: userId,
      sub_area_id: departmentId
    });
  } catch (error) {
    console.error('Failed to remove department admin:', error);
    throw error;
  }
}

// ===== STUDENT ASSIGNMENTS =====

/**
 * Get all departments assigned to a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of department assignments
 */
export async function getUserDepartments(userId) {
  try {
    return await demoMode.query('user_sub_areas', { user_id: userId });
  } catch (error) {
    console.error('Failed to get user departments:', error);
    throw error;
  }
}

/**
 * Get all students in a department
 * @param {string} departmentId - Department ID
 * @returns {Promise<Array>} Array of user objects
 */
export async function getStudentsInDepartment(departmentId) {
  try {
    const assignments = await demoMode.query('user_sub_areas', { sub_area_id: departmentId });
    const userIds = assignments.map(a => a.user_id);

    const allUsers = await demoMode.query('users');
    return allUsers.filter(u => userIds.includes(u.id));
  } catch (error) {
    console.error('Failed to get students in department:', error);
    throw error;
  }
}

/**
 * Assign a student to a department
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID
 * @param {boolean} isPrimary - Whether this is the primary department
 * @param {string} assignedBy - ID of user who assigned
 * @returns {Promise<Object>} Created assignment
 */
export async function assignStudentToDepartment(userId, departmentId, isPrimary = false, assignedBy = null) {
  try {
    const assignment = {
      id: `usa${Date.now()}`,
      user_id: userId,
      sub_area_id: departmentId,
      is_primary: isPrimary,
      assigned_at: new Date().toISOString(),
      assigned_by: assignedBy
    };

    await demoMode.insert('user_sub_areas', assignment);
    return assignment;
  } catch (error) {
    console.error('Failed to assign student to department:', error);
    throw error;
  }
}

/**
 * Remove student from department
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID
 * @returns {Promise<number>} Number of records deleted
 */
export async function removeStudentFromDepartment(userId, departmentId) {
  try {
    return await demoMode.delete('user_sub_areas', {
      user_id: userId,
      sub_area_id: departmentId
    });
  } catch (error) {
    console.error('Failed to remove student from department:', error);
    throw error;
  }
}

/**
 * Bulk assign students to a department
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} departmentId - Department ID
 * @param {string} assignedBy - ID of user who assigned
 * @returns {Promise<Array>} Array of created assignments
 */
export async function bulkAssignStudents(userIds, departmentId, assignedBy = null) {
  try {
    const assignments = [];

    for (const userId of userIds) {
      // Check if already assigned
      const existing = await demoMode.query('user_sub_areas', {
        user_id: userId,
        sub_area_id: departmentId
      });

      if (existing.length === 0) {
        const assignment = await assignStudentToDepartment(userId, departmentId, false, assignedBy);
        assignments.push(assignment);
      }
    }

    return assignments;
  } catch (error) {
    console.error('Failed to bulk assign students:', error);
    throw error;
  }
}

// ===== INTERDISCIPLINARY ACCESS =====

/**
 * Get all interdisciplinary access grants
 * @param {boolean} activeOnly - Only return active grants
 * @returns {Promise<Array>} Array of access grants
 */
export async function getInterdisciplinaryAccess(activeOnly = false) {
  try {
    const grants = await demoMode.query('interdisciplinary_access');

    if (!activeOnly) {
      return grants;
    }

    // Filter for active and non-expired grants
    const now = new Date();
    return grants.filter(grant => {
      if (!grant.is_active) return false;
      if (!grant.expires_at) return true;
      return new Date(grant.expires_at) > now;
    });
  } catch (error) {
    console.error('Failed to get interdisciplinary access:', error);
    throw error;
  }
}

/**
 * Grant interdisciplinary access
 * @param {string} fromDepartmentId - Source department ID
 * @param {string} toDepartmentId - Target department ID
 * @param {string} expiresAt - Expiration date (ISO string) or null for permanent
 * @param {string} notes - Notes about the grant
 * @param {string} grantedBy - ID of user who granted access
 * @returns {Promise<Object>} Created access grant
 */
export async function grantAccess(fromDepartmentId, toDepartmentId, expiresAt = null, notes = '', grantedBy = null) {
  try {
    const grant = {
      id: `ida${Date.now()}`,
      from_sub_area_id: fromDepartmentId,
      to_sub_area_id: toDepartmentId,
      granted_by: grantedBy,
      granted_at: new Date().toISOString(),
      expires_at: expiresAt,
      is_active: true,
      notes: notes || ''
    };

    await demoMode.insert('interdisciplinary_access', grant);
    return grant;
  } catch (error) {
    console.error('Failed to grant access:', error);
    throw error;
  }
}

/**
 * Revoke interdisciplinary access
 * @param {string} id - Access grant ID
 * @returns {Promise<number>} Number of records deleted
 */
export async function revokeAccess(id) {
  try {
    return await demoMode.delete('interdisciplinary_access', { id });
  } catch (error) {
    console.error('Failed to revoke access:', error);
    throw error;
  }
}

/**
 * Toggle access grant active status
 * @param {string} id - Access grant ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<number>} Number of records updated
 */
export async function toggleAccess(id, isActive) {
  try {
    return await demoMode.update('interdisciplinary_access', { id }, { is_active: isActive });
  } catch (error) {
    console.error('Failed to toggle access:', error);
    throw error;
  }
}

/**
 * Check if a user has access to equipment from a specific department
 * @param {string} userId - User ID
 * @param {string} departmentId - Department ID
 * @returns {Promise<Object>} { hasAccess: boolean, accessType: 'direct' | 'interdisciplinary' | null }
 */
export async function checkUserDepartmentAccess(userId, departmentId) {
  try {
    // Check direct access
    const directAssignments = await demoMode.query('user_sub_areas', {
      user_id: userId,
      sub_area_id: departmentId
    });

    if (directAssignments.length > 0) {
      return { hasAccess: true, accessType: 'direct' };
    }

    // Check interdisciplinary access
    const userDepartments = await getUserDepartments(userId);
    const userDepartmentIds = userDepartments.map(a => a.sub_area_id);

    const allGrants = await getInterdisciplinaryAccess(true); // Active only

    const hasInterdisciplinaryAccess = allGrants.some(grant =>
      userDepartmentIds.includes(grant.from_sub_area_id) &&
      grant.to_sub_area_id === departmentId
    );

    if (hasInterdisciplinaryAccess) {
      return { hasAccess: true, accessType: 'interdisciplinary' };
    }

    return { hasAccess: false, accessType: null };
  } catch (error) {
    console.error('Failed to check user department access:', error);
    throw error;
  }
}

/**
 * Get all equipment accessible by a user (based on department assignments and role)
 * @param {string} userId - User ID
 * @param {Object} user - User object (optional, for role checking)
 * @returns {Promise<Array>} Array of equipment with access type annotation
 */
export async function getAccessibleEquipment(userId, user = null) {
  try {
    const allEquipment = await demoMode.query('equipment');

    // If no user object provided, fetch it
    if (!user) {
      user = await demoMode.findOne('users', { id: userId });
    }

    // Master admin can see everything
    if (user?.role === 'master_admin') {
      return allEquipment.map(eq => ({ ...eq, accessType: 'admin', isInterdisciplinary: false }));
    }

    // Department admins can VIEW all equipment but only BOOK their managed department + grants
    if (user?.role === 'department_admin' && user?.managed_department_id) {
      const userDepartments = [{ sub_area_id: user.managed_department_id }];
      const userDepartmentIds = [user.managed_department_id];
      const interdisciplinaryGrants = await getInterdisciplinaryAccess(true);

      const accessibleEquipment = allEquipment.map(equipment => {
        // Equipment with no department is accessible to all
        if (!equipment.sub_area_id) {
          return { ...equipment, accessType: 'shared', isInterdisciplinary: false, canBook: true };
        }

        // Check if it's their managed department
        if (equipment.sub_area_id === user.managed_department_id) {
          return { ...equipment, accessType: 'direct', isInterdisciplinary: false, canBook: true };
        }

        // Check interdisciplinary access grants
        const grant = interdisciplinaryGrants.find(g =>
          g.from_sub_area_id === user.managed_department_id &&
          g.to_sub_area_id === equipment.sub_area_id
        );

        if (grant) {
          return {
            ...equipment,
            accessType: 'interdisciplinary',
            isInterdisciplinary: true,
            fromDepartmentId: grant.from_sub_area_id,
            canBook: true
          };
        }

        // Can VIEW but not BOOK
        return { ...equipment, accessType: 'view_only', isInterdisciplinary: false, canBook: false };
      });

      return accessibleEquipment;
    }

    // Students and staff - restricted to their department + grants + shared
    const userDepartments = await getUserDepartments(userId);
    const userDepartmentIds = userDepartments.map(a => a.sub_area_id);
    const interdisciplinaryGrants = await getInterdisciplinaryAccess(true);

    const accessibleEquipment = allEquipment.map(equipment => {
      // Equipment with no department is accessible to all
      if (!equipment.sub_area_id) {
        return { ...equipment, accessType: 'shared', isInterdisciplinary: false, canBook: true };
      }

      // Check direct access
      if (userDepartmentIds.includes(equipment.sub_area_id)) {
        return { ...equipment, accessType: 'direct', isInterdisciplinary: false, canBook: true };
      }

      // Check interdisciplinary access
      const grant = interdisciplinaryGrants.find(g =>
        userDepartmentIds.includes(g.from_sub_area_id) &&
        g.to_sub_area_id === equipment.sub_area_id
      );

      if (grant) {
        return {
          ...equipment,
          accessType: 'interdisciplinary',
          isInterdisciplinary: true,
          fromDepartmentId: grant.from_sub_area_id,
          canBook: true
        };
      }

      return null;
    }).filter(Boolean); // Remove null entries

    return accessibleEquipment;
  } catch (error) {
    console.error('Failed to get accessible equipment:', error);
    throw error;
  }
}

// ===== ACCESS REQUESTS =====

/**
 * Create a new access request from a department admin
 * @param {string} requestingAdminId - ID of the department admin making the request
 * @param {string} fromDepartmentId - Department ID they manage
 * @param {string} toDepartmentId - Department ID they want access to
 * @param {string} reason - Reason for the request
 * @returns {Promise<Object>} Created access request
 */
export async function createAccessRequest(requestingAdminId, fromDepartmentId, toDepartmentId, reason) {
  try {
    const accessRequest = {
      id: `ar${Date.now()}`,
      requesting_admin_id: requestingAdminId,
      from_sub_area_id: fromDepartmentId,
      to_sub_area_id: toDepartmentId,
      status: 'pending',
      reason: reason || '',
      requested_at: new Date().toISOString(),
      reviewed_by: null,
      reviewed_at: null,
      notes: null
    };

    await demoMode.insert('access_requests', accessRequest);
    return accessRequest;
  } catch (error) {
    console.error('Failed to create access request:', error);
    throw error;
  }
}

/**
 * Get all access requests (optionally filtered by status)
 * @param {string} filterStatus - Optional status filter ('pending', 'approved', 'denied')
 * @returns {Promise<Array>} Array of access requests
 */
export async function getAccessRequests(filterStatus = null) {
  try {
    let requests = await demoMode.query('access_requests');

    if (filterStatus) {
      requests = requests.filter(r => r.status === filterStatus);
    }

    return requests;
  } catch (error) {
    console.error('Failed to get access requests:', error);
    throw error;
  }
}

/**
 * Get access requests for a specific department admin
 * @param {string} departmentAdminId - ID of the department admin
 * @returns {Promise<Array>} Array of access requests
 */
export async function getDepartmentAdminRequests(departmentAdminId) {
  try {
    return await demoMode.query('access_requests', { requesting_admin_id: departmentAdminId });
  } catch (error) {
    console.error('Failed to get department admin requests:', error);
    throw error;
  }
}

/**
 * Approve an access request and create interdisciplinary grant
 * @param {string} requestId - Access request ID
 * @param {string} masterAdminId - ID of master admin approving
 * @param {string} expiresAt - Optional expiration date (ISO string)
 * @returns {Promise<Object>} Updated access request and created grant
 */
export async function approveAccessRequest(requestId, masterAdminId, expiresAt = null) {
  try {
    const request = await demoMode.findOne('access_requests', { id: requestId });

    if (!request) {
      throw new Error('Access request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Can only approve pending requests');
    }

    // Create interdisciplinary access grant
    const grant = await grantAccess(
      request.from_sub_area_id,
      request.to_sub_area_id,
      expiresAt,
      `Created from access request ${requestId}`,
      masterAdminId
    );

    // Update access request to approved
    await demoMode.update('access_requests', { id: requestId }, {
      status: 'approved',
      reviewed_by: masterAdminId,
      reviewed_at: new Date().toISOString(),
      notes: `Approved - interdisciplinary access grant created (${grant.id})`
    });

    const updatedRequest = await demoMode.findOne('access_requests', { id: requestId });

    return { request: updatedRequest, grant };
  } catch (error) {
    console.error('Failed to approve access request:', error);
    throw error;
  }
}

/**
 * Deny an access request
 * @param {string} requestId - Access request ID
 * @param {string} masterAdminId - ID of master admin denying
 * @param {string} notes - Reason for denial
 * @returns {Promise<Object>} Updated access request
 */
export async function denyAccessRequest(requestId, masterAdminId, notes) {
  try {
    const request = await demoMode.findOne('access_requests', { id: requestId });

    if (!request) {
      throw new Error('Access request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Can only deny pending requests');
    }

    await demoMode.update('access_requests', { id: requestId }, {
      status: 'denied',
      reviewed_by: masterAdminId,
      reviewed_at: new Date().toISOString(),
      notes: notes || 'Request denied'
    });

    return await demoMode.findOne('access_requests', { id: requestId });
  } catch (error) {
    console.error('Failed to deny access request:', error);
    throw error;
  }
}

export default {
  // Departments
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
  getEquipmentCountByDepartment,

  // Department Admins
  getDepartmentAdmins,
  assignDepartmentAdmin,
  removeDepartmentAdmin,

  // Student Assignments
  getUserDepartments,
  getStudentsInDepartment,
  assignStudentToDepartment,
  removeStudentFromDepartment,
  bulkAssignStudents,

  // Interdisciplinary Access
  getInterdisciplinaryAccess,
  grantAccess,
  revokeAccess,
  toggleAccess,
  checkUserDepartmentAccess,
  getAccessibleEquipment,

  // Access Requests
  createAccessRequest,
  getAccessRequests,
  getDepartmentAdminRequests,
  approveAccessRequest,
  denyAccessRequest
};
