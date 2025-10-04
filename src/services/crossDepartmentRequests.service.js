/**
 * Cross-Department Requests Service
 * Manages staff requests for equipment from other departments
 * Includes smart routing: single department if one has enough, all departments if quantity exceeds any single department
 */

import { demoMode } from '../mocks/demo-mode';

/**
 * Get equipment availability summary across all departments
 * Returns count of available equipment by type and department
 * @param {string} equipmentType - Equipment product name (e.g., "Canon 250D DSLR Kit")
 * @returns {Promise<Array>} Array of { departmentId, departmentName, availableCount, equipmentIds }
 */
export async function getEquipmentAvailabilityByType(equipmentType) {
  try {
    const allEquipment = await demoMode.query('equipment');
    const subAreas = await demoMode.query('sub_areas');

    // Filter equipment by type name (partial match, case-insensitive)
    const matchingEquipment = allEquipment.filter(eq =>
      eq.product_name.toLowerCase().includes(equipmentType.toLowerCase()) &&
      eq.status === 'available'
    );

    // Group by department
    const byDepartment = {};
    matchingEquipment.forEach(eq => {
      if (!byDepartment[eq.department]) {
        const subArea = subAreas.find(sa => sa.id === eq.sub_area_id);
        byDepartment[eq.department] = {
          departmentId: eq.department,
          departmentName: subArea ? subArea.name : eq.department,
          availableCount: 0,
          equipmentIds: []
        };
      }
      byDepartment[eq.department].availableCount++;
      byDepartment[eq.department].equipmentIds.push(eq.id);
    });

    return Object.values(byDepartment).sort((a, b) => b.availableCount - a.availableCount);
  } catch (error) {
    console.error('Error getting equipment availability:', error);
    throw error;
  }
}

/**
 * Determine which departments to send request to based on quantity needed
 * Smart routing logic:
 * - If one department has enough equipment, route only to that department
 * - If request exceeds any single department's capacity, broadcast to all departments with that equipment type
 * @param {string} equipmentType - Equipment product name
 * @param {number} quantity - Quantity needed
 * @returns {Promise<Object>} { routingType: 'single' | 'broadcast', targetDepartments: Array }
 */
export async function determineRequestRouting(equipmentType, quantity) {
  try {
    const availability = await getEquipmentAvailabilityByType(equipmentType);

    if (availability.length === 0) {
      return {
        routingType: 'none',
        targetDepartments: [],
        message: `No departments have '${equipmentType}' available`
      };
    }

    // Check if any single department has enough
    const departmentWithEnough = availability.find(dept => dept.availableCount >= quantity);

    if (departmentWithEnough) {
      return {
        routingType: 'single',
        targetDepartments: [departmentWithEnough],
        message: `Request will be sent to ${departmentWithEnough.departmentName} (${departmentWithEnough.availableCount} available)`
      };
    } else {
      return {
        routingType: 'broadcast',
        targetDepartments: availability,
        message: `Request exceeds any single department's capacity. Will be broadcast to all ${availability.length} departments with this equipment type.`
      };
    }
  } catch (error) {
    console.error('Error determining request routing:', error);
    throw error;
  }
}

/**
 * Create a cross-department request
 * Automatically determines routing based on availability
 * @param {Object} requestData - { requestingUserId, requestingDepartmentId, equipmentType, quantity, startDate, endDate, justification }
 * @returns {Promise<Object>} Created request (or array of requests if broadcast)
 */
export async function createCrossDepartmentRequest(requestData) {
  const { requestingUserId, requestingDepartmentId, equipmentType, quantity, startDate, endDate, justification } = requestData;

  try {
    // Determine routing
    const routing = await determineRequestRouting(equipmentType, quantity);

    if (routing.routingType === 'none') {
      throw new Error(routing.message);
    }

    const requests = [];

    if (routing.routingType === 'single') {
      // Create single request to one department
      const targetDept = routing.targetDepartments[0];
      const request = {
        id: `req${Date.now()}`,
        requesting_user_id: requestingUserId,
        requesting_department_id: requestingDepartmentId,
        target_department_id: targetDept.departmentId,
        equipment_type: equipmentType,
        quantity,
        start_date: startDate,
        end_date: endDate,
        justification,
        status: 'pending',
        routing_type: 'single',
        created_at: new Date().toISOString()
      };

      const data = demoMode.getData();
      data.cross_department_requests = data.cross_department_requests || [];
      data.cross_department_requests.push(request);
      demoMode.saveData(data);

      requests.push(request);
    } else {
      // Broadcast to all departments with this equipment
      for (const targetDept of routing.targetDepartments) {
        const request = {
          id: `req${Date.now()}_${targetDept.departmentId}`,
          requesting_user_id: requestingUserId,
          requesting_department_id: requestingDepartmentId,
          target_department_id: targetDept.departmentId,
          equipment_type: equipmentType,
          quantity, // Full quantity - dept admin can choose to fulfill partially
          start_date: startDate,
          end_date: endDate,
          justification,
          status: 'pending',
          routing_type: 'broadcast',
          broadcast_group_id: `bcast${Date.now()}`, // Link related broadcast requests
          available_at_department: targetDept.availableCount,
          created_at: new Date().toISOString()
        };

        const data = demoMode.getData();
        data.cross_department_requests = data.cross_department_requests || [];
        data.cross_department_requests.push(request);
        demoMode.saveData(data);

        requests.push(request);
      }
    }

    return {
      routingType: routing.routingType,
      message: routing.message,
      requests
    };
  } catch (error) {
    console.error('Error creating cross-department request:', error);
    throw error;
  }
}

/**
 * Get all requests targeting a specific department
 * @param {string} departmentId - Department ID
 * @param {string} status - Filter by status (optional)
 * @returns {Promise<Array>} Requests
 */
export async function getRequestsForDepartment(departmentId, status = null) {
  try {
    let requests = await demoMode.query('cross_department_requests', { target_department_id: departmentId });

    if (status) {
      requests = requests.filter(req => req.status === status);
    }

    // Populate requesting user details
    const users = await demoMode.query('users');
    requests = requests.map(req => {
      const requestingUser = users.find(u => u.id === req.requesting_user_id);
      return {
        ...req,
        requesting_user_name: requestingUser ? requestingUser.full_name : 'Unknown',
        requesting_user_email: requestingUser ? requestingUser.email : ''
      };
    });

    return requests;
  } catch (error) {
    console.error('Error fetching department requests:', error);
    throw error;
  }
}

/**
 * Get all requests created by a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Requests
 */
export async function getRequestsByUser(userId) {
  try {
    const requests = await demoMode.query('cross_department_requests', { requesting_user_id: userId });
    const subAreas = await demoMode.query('sub_areas');

    // Populate target department names
    return requests.map(req => {
      const targetDept = subAreas.find(sa => sa.id === req.target_department_id);
      return {
        ...req,
        target_department_name: targetDept ? targetDept.name : req.target_department_id
      };
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    throw error;
  }
}

/**
 * Approve a cross-department request with custom instructions
 * @param {string} requestId - Request ID
 * @param {string} reviewerId - Department admin ID
 * @param {string} instructions - Custom pickup/return instructions
 * @returns {Promise<Object>} Updated request
 */
export async function approveRequest(requestId, reviewerId, instructions) {
  try {
    const data = demoMode.getData();
    const requests = data.cross_department_requests || [];
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    requests[requestIndex] = {
      ...requests[requestIndex],
      status: 'approved',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_notes: instructions
    };

    data.cross_department_requests = requests;
    demoMode.saveData(data);

    // In a real app, this would trigger an email notification to the requesting user
    // For now, we'll just log it
    console.log(`Request ${requestId} approved. Staff will receive notification with instructions.`);

    return requests[requestIndex];
  } catch (error) {
    console.error('Error approving request:', error);
    throw error;
  }
}

/**
 * Deny a cross-department request with reason
 * @param {string} requestId - Request ID
 * @param {string} reviewerId - Department admin ID
 * @param {string} reason - Denial reason
 * @returns {Promise<Object>} Updated request
 */
export async function denyRequest(requestId, reviewerId, reason) {
  try {
    const data = demoMode.getData();
    const requests = data.cross_department_requests || [];
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    requests[requestIndex] = {
      ...requests[requestIndex],
      status: 'denied',
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_notes: reason
    };

    data.cross_department_requests = requests;
    demoMode.saveData(data);

    return requests[requestIndex];
  } catch (error) {
    console.error('Error denying request:', error);
    throw error;
  }
}

/**
 * Cancel a pending request (requester only)
 * @param {string} requestId - Request ID
 * @returns {Promise<Object>} Updated request
 */
export async function cancelRequest(requestId) {
  try {
    const data = demoMode.getData();
    const requests = data.cross_department_requests || [];
    const requestIndex = requests.findIndex(r => r.id === requestId);

    if (requestIndex === -1) {
      throw new Error('Request not found');
    }

    if (requests[requestIndex].status !== 'pending') {
      throw new Error('Only pending requests can be cancelled');
    }

    requests[requestIndex] = {
      ...requests[requestIndex],
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    };

    data.cross_department_requests = requests;
    demoMode.saveData(data);

    return requests[requestIndex];
  } catch (error) {
    console.error('Error cancelling request:', error);
    throw error;
  }
}
