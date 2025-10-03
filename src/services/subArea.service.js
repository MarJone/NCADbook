import { demoMode } from '../mocks/demo-mode.js';

/**
 * Sub-Area Service
 *
 * Provides functions for managing sub-areas, area admins, student assignments,
 * and interdisciplinary access grants.
 */

// ===== SUB-AREAS =====

/**
 * Get all sub-areas
 * @returns {Promise<Array>} Array of sub-area objects
 */
export async function getAllSubAreas() {
  try {
    const subAreas = await demoMode.query('sub_areas');
    return subAreas || [];
  } catch (error) {
    console.error('Failed to get sub-areas:', error);
    throw error;
  }
}

/**
 * Get a single sub-area by ID
 * @param {string} id - Sub-area ID
 * @returns {Promise<Object|null>} Sub-area object or null
 */
export async function getSubAreaById(id) {
  try {
    return await demoMode.findOne('sub_areas', { id });
  } catch (error) {
    console.error('Failed to get sub-area:', error);
    throw error;
  }
}

/**
 * Create a new sub-area
 * @param {string} name - Sub-area name
 * @param {string} description - Description
 * @param {string} parentDepartment - Parent department
 * @returns {Promise<Object>} Created sub-area object
 */
export async function createSubArea(name, description, parentDepartment) {
  try {
    const newSubArea = {
      id: `sa${Date.now()}`,
      name,
      description: description || '',
      parent_department: parentDepartment || '',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await demoMode.insert('sub_areas', newSubArea);
    return newSubArea;
  } catch (error) {
    console.error('Failed to create sub-area:', error);
    throw error;
  }
}

/**
 * Update a sub-area
 * @param {string} id - Sub-area ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<number>} Number of records updated
 */
export async function updateSubArea(id, updates) {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    return await demoMode.update('sub_areas', { id }, updateData);
  } catch (error) {
    console.error('Failed to update sub-area:', error);
    throw error;
  }
}

/**
 * Deactivate a sub-area
 * @param {string} id - Sub-area ID
 * @returns {Promise<number>} Number of records updated
 */
export async function deactivateSubArea(id) {
  try {
    return await demoMode.update('sub_areas', { id }, {
      is_active: false,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to deactivate sub-area:', error);
    throw error;
  }
}

/**
 * Get equipment count by sub-area
 * @returns {Promise<Object>} Object mapping sub-area IDs to equipment counts
 */
export async function getEquipmentCountBySubArea() {
  try {
    const equipment = await demoMode.query('equipment');
    const counts = {};

    equipment.forEach(item => {
      if (item.sub_area_id) {
        counts[item.sub_area_id] = (counts[item.sub_area_id] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error('Failed to get equipment counts:', error);
    throw error;
  }
}

// ===== AREA ADMINS =====

/**
 * Get all area admins for a sub-area
 * @param {string} subAreaId - Sub-area ID
 * @returns {Promise<Array>} Array of area admin assignments
 */
export async function getAreaAdmins(subAreaId) {
  try {
    return await demoMode.query('area_admins', { sub_area_id: subAreaId });
  } catch (error) {
    console.error('Failed to get area admins:', error);
    throw error;
  }
}

/**
 * Assign a user as area admin for a sub-area
 * @param {string} userId - User ID
 * @param {string} subAreaId - Sub-area ID
 * @returns {Promise<Object>} Created assignment
 */
export async function assignAreaAdmin(userId, subAreaId) {
  try {
    const assignment = {
      id: `aa${Date.now()}`,
      user_id: userId,
      sub_area_id: subAreaId,
      created_at: new Date().toISOString()
    };

    await demoMode.insert('area_admins', assignment);
    return assignment;
  } catch (error) {
    console.error('Failed to assign area admin:', error);
    throw error;
  }
}

/**
 * Remove area admin assignment
 * @param {string} userId - User ID
 * @param {string} subAreaId - Sub-area ID
 * @returns {Promise<number>} Number of records deleted
 */
export async function removeAreaAdmin(userId, subAreaId) {
  try {
    return await demoMode.delete('area_admins', {
      user_id: userId,
      sub_area_id: subAreaId
    });
  } catch (error) {
    console.error('Failed to remove area admin:', error);
    throw error;
  }
}

// ===== STUDENT ASSIGNMENTS =====

/**
 * Get all sub-areas assigned to a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of sub-area assignments
 */
export async function getUserSubAreas(userId) {
  try {
    return await demoMode.query('user_sub_areas', { user_id: userId });
  } catch (error) {
    console.error('Failed to get user sub-areas:', error);
    throw error;
  }
}

/**
 * Get all students in a sub-area
 * @param {string} subAreaId - Sub-area ID
 * @returns {Promise<Array>} Array of user objects
 */
export async function getStudentsInSubArea(subAreaId) {
  try {
    const assignments = await demoMode.query('user_sub_areas', { sub_area_id: subAreaId });
    const userIds = assignments.map(a => a.user_id);

    const allUsers = await demoMode.query('users');
    return allUsers.filter(u => userIds.includes(u.id));
  } catch (error) {
    console.error('Failed to get students in sub-area:', error);
    throw error;
  }
}

/**
 * Assign a student to a sub-area
 * @param {string} userId - User ID
 * @param {string} subAreaId - Sub-area ID
 * @param {boolean} isPrimary - Whether this is the primary sub-area
 * @param {string} assignedBy - ID of user who assigned
 * @returns {Promise<Object>} Created assignment
 */
export async function assignStudentToSubArea(userId, subAreaId, isPrimary = false, assignedBy = null) {
  try {
    const assignment = {
      id: `usa${Date.now()}`,
      user_id: userId,
      sub_area_id: subAreaId,
      is_primary: isPrimary,
      assigned_at: new Date().toISOString(),
      assigned_by: assignedBy
    };

    await demoMode.insert('user_sub_areas', assignment);
    return assignment;
  } catch (error) {
    console.error('Failed to assign student to sub-area:', error);
    throw error;
  }
}

/**
 * Remove student from sub-area
 * @param {string} userId - User ID
 * @param {string} subAreaId - Sub-area ID
 * @returns {Promise<number>} Number of records deleted
 */
export async function removeStudentFromSubArea(userId, subAreaId) {
  try {
    return await demoMode.delete('user_sub_areas', {
      user_id: userId,
      sub_area_id: subAreaId
    });
  } catch (error) {
    console.error('Failed to remove student from sub-area:', error);
    throw error;
  }
}

/**
 * Bulk assign students to a sub-area
 * @param {Array<string>} userIds - Array of user IDs
 * @param {string} subAreaId - Sub-area ID
 * @param {string} assignedBy - ID of user who assigned
 * @returns {Promise<Array>} Array of created assignments
 */
export async function bulkAssignStudents(userIds, subAreaId, assignedBy = null) {
  try {
    const assignments = [];

    for (const userId of userIds) {
      // Check if already assigned
      const existing = await demoMode.query('user_sub_areas', {
        user_id: userId,
        sub_area_id: subAreaId
      });

      if (existing.length === 0) {
        const assignment = await assignStudentToSubArea(userId, subAreaId, false, assignedBy);
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
 * @param {string} fromSubAreaId - Source sub-area ID
 * @param {string} toSubAreaId - Target sub-area ID
 * @param {string} expiresAt - Expiration date (ISO string) or null for permanent
 * @param {string} notes - Notes about the grant
 * @param {string} grantedBy - ID of user who granted access
 * @returns {Promise<Object>} Created access grant
 */
export async function grantAccess(fromSubAreaId, toSubAreaId, expiresAt = null, notes = '', grantedBy = null) {
  try {
    const grant = {
      id: `ida${Date.now()}`,
      from_sub_area_id: fromSubAreaId,
      to_sub_area_id: toSubAreaId,
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
 * Check if a user has access to equipment from a specific sub-area
 * @param {string} userId - User ID
 * @param {string} subAreaId - Sub-area ID
 * @returns {Promise<Object>} { hasAccess: boolean, accessType: 'direct' | 'interdisciplinary' | null }
 */
export async function checkUserSubAreaAccess(userId, subAreaId) {
  try {
    // Check direct access
    const directAssignments = await demoMode.query('user_sub_areas', {
      user_id: userId,
      sub_area_id: subAreaId
    });

    if (directAssignments.length > 0) {
      return { hasAccess: true, accessType: 'direct' };
    }

    // Check interdisciplinary access
    const userSubAreas = await getUserSubAreas(userId);
    const userSubAreaIds = userSubAreas.map(a => a.sub_area_id);

    const allGrants = await getInterdisciplinaryAccess(true); // Active only

    const hasInterdisciplinaryAccess = allGrants.some(grant =>
      userSubAreaIds.includes(grant.from_sub_area_id) &&
      grant.to_sub_area_id === subAreaId
    );

    if (hasInterdisciplinaryAccess) {
      return { hasAccess: true, accessType: 'interdisciplinary' };
    }

    return { hasAccess: false, accessType: null };
  } catch (error) {
    console.error('Failed to check user sub-area access:', error);
    throw error;
  }
}

/**
 * Get all equipment accessible by a user (based on sub-area assignments and role)
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

    // Sub-area admins can VIEW all equipment but only BOOK their managed sub-area + grants
    if (user?.role === 'sub_area_admin' && user?.managed_sub_area_id) {
      const userSubAreas = [{ sub_area_id: user.managed_sub_area_id }];
      const userSubAreaIds = [user.managed_sub_area_id];
      const interdisciplinaryGrants = await getInterdisciplinaryAccess(true);

      const accessibleEquipment = allEquipment.map(equipment => {
        // Equipment with no sub-area is accessible to all
        if (!equipment.sub_area_id) {
          return { ...equipment, accessType: 'shared', isInterdisciplinary: false, canBook: true };
        }

        // Check if it's their managed sub-area
        if (equipment.sub_area_id === user.managed_sub_area_id) {
          return { ...equipment, accessType: 'direct', isInterdisciplinary: false, canBook: true };
        }

        // Check interdisciplinary access grants
        const grant = interdisciplinaryGrants.find(g =>
          g.from_sub_area_id === user.managed_sub_area_id &&
          g.to_sub_area_id === equipment.sub_area_id
        );

        if (grant) {
          return {
            ...equipment,
            accessType: 'interdisciplinary',
            isInterdisciplinary: true,
            fromSubAreaId: grant.from_sub_area_id,
            canBook: true
          };
        }

        // Can VIEW but not BOOK
        return { ...equipment, accessType: 'view_only', isInterdisciplinary: false, canBook: false };
      });

      return accessibleEquipment;
    }

    // Students and staff - restricted to their sub-area + grants + shared
    const userSubAreas = await getUserSubAreas(userId);
    const userSubAreaIds = userSubAreas.map(a => a.sub_area_id);
    const interdisciplinaryGrants = await getInterdisciplinaryAccess(true);

    const accessibleEquipment = allEquipment.map(equipment => {
      // Equipment with no sub-area is accessible to all
      if (!equipment.sub_area_id) {
        return { ...equipment, accessType: 'shared', isInterdisciplinary: false, canBook: true };
      }

      // Check direct access
      if (userSubAreaIds.includes(equipment.sub_area_id)) {
        return { ...equipment, accessType: 'direct', isInterdisciplinary: false, canBook: true };
      }

      // Check interdisciplinary access
      const grant = interdisciplinaryGrants.find(g =>
        userSubAreaIds.includes(g.from_sub_area_id) &&
        g.to_sub_area_id === equipment.sub_area_id
      );

      if (grant) {
        return {
          ...equipment,
          accessType: 'interdisciplinary',
          isInterdisciplinary: true,
          fromSubAreaId: grant.from_sub_area_id,
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
 * Create a new access request from a sub-area admin
 * @param {string} requestingAdminId - ID of the sub-area admin making the request
 * @param {string} fromSubAreaId - Sub-area ID they manage
 * @param {string} toSubAreaId - Sub-area ID they want access to
 * @param {string} reason - Reason for the request
 * @returns {Promise<Object>} Created access request
 */
export async function createAccessRequest(requestingAdminId, fromSubAreaId, toSubAreaId, reason) {
  try {
    const accessRequest = {
      id: `ar${Date.now()}`,
      requesting_admin_id: requestingAdminId,
      from_sub_area_id: fromSubAreaId,
      to_sub_area_id: toSubAreaId,
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
 * Get access requests for a specific sub-area admin
 * @param {string} subAreaAdminId - ID of the sub-area admin
 * @returns {Promise<Array>} Array of access requests
 */
export async function getSubAreaAdminRequests(subAreaAdminId) {
  try {
    return await demoMode.query('access_requests', { requesting_admin_id: subAreaAdminId });
  } catch (error) {
    console.error('Failed to get sub-area admin requests:', error);
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
  // Sub-Areas
  getAllSubAreas,
  getSubAreaById,
  createSubArea,
  updateSubArea,
  deactivateSubArea,
  getEquipmentCountBySubArea,

  // Area Admins
  getAreaAdmins,
  assignAreaAdmin,
  removeAreaAdmin,

  // Student Assignments
  getUserSubAreas,
  getStudentsInSubArea,
  assignStudentToSubArea,
  removeStudentFromSubArea,
  bulkAssignStudents,

  // Interdisciplinary Access
  getInterdisciplinaryAccess,
  grantAccess,
  revokeAccess,
  toggleAccess,
  checkUserSubAreaAccess,
  getAccessibleEquipment,

  // Access Requests
  createAccessRequest,
  getAccessRequests,
  getSubAreaAdminRequests,
  approveAccessRequest,
  denyAccessRequest
};
