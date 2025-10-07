/**
 * Equipment Kits Service
 * Manages equipment kit bundles (department admin only)
 */

import { equipmentKitsAPI, bookingsAPI } from '../utils/api.js';

/**
 * Get all equipment kits for a department
 * @param {string} departmentId - Department ID
 * @param {boolean} activeOnly - Only return active kits
 * @returns {Promise<Array>} Equipment kits
 */
export async function getKitsByDepartment(departmentId, activeOnly = true) {
  try {
    const params = { department_id: departmentId };
    if (activeOnly) {
      params.is_active = true;
    }
    const response = await equipmentKitsAPI.getAll(params);
    return response.kits || [];
  } catch (error) {
    console.error('Error fetching equipment kits:', error);
    throw error;
  }
}

/**
 * Get kit by ID with full equipment details
 * @param {string} kitId - Kit ID
 * @returns {Promise<Object>} Kit with populated equipment
 */
export async function getKitById(kitId) {
  try {
    const response = await equipmentKitsAPI.getById(kitId);
    return response.kit;
  } catch (error) {
    console.error('Error fetching kit:', error);
    throw error;
  }
}

/**
 * Create a new equipment kit (department admin only)
 * @param {Object} kitData - Kit data
 * @returns {Promise<Object>} Created kit
 */
export async function createKit(kitData) {
  try {
    const response = await equipmentKitsAPI.create(kitData);
    return response.kit;
  } catch (error) {
    console.error('Error creating kit:', error);
    throw error;
  }
}

/**
 * Update an equipment kit
 * @param {string} kitId - Kit ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated kit
 */
export async function updateKit(kitId, updates) {
  try {
    const response = await equipmentKitsAPI.update(kitId, updates);
    return response.kit;
  } catch (error) {
    console.error('Error updating kit:', error);
    throw error;
  }
}

/**
 * Delete an equipment kit (soft delete - set inactive)
 * @param {string} kitId - Kit ID
 * @returns {Promise<void>}
 */
export async function deleteKit(kitId) {
  try {
    await equipmentKitsAPI.delete(kitId);
  } catch (error) {
    console.error('Error deleting kit:', error);
    throw error;
  }
}

/**
 * Check if all equipment in a kit is available for a date range
 * @param {string} kitId - Kit ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} { available: boolean, unavailableItems: Array }
 */
export async function checkKitAvailability(kitId, startDate, endDate) {
  try {
    const kit = await getKitById(kitId);
    const bookingsResponse = await bookingsAPI.getAll({
      status: 'approved',
      start_date: startDate,
      end_date: endDate
    });
    const bookings = bookingsResponse.bookings || [];

    const unavailableItems = [];
    const equipment_ids = kit.equipment_ids || [];

    for (const equipmentId of equipment_ids) {
      // Check if equipment is booked during the requested period
      const conflictingBookings = bookings.filter(booking => {
        if (booking.equipment_id !== equipmentId) return false;

        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        const requestStart = new Date(startDate);
        const requestEnd = new Date(endDate);

        // Check for overlap
        return (requestStart <= bookingEnd && requestEnd >= bookingStart);
      });

      if (conflictingBookings.length > 0) {
        const equipment = kit.equipment.find(eq => eq.id === equipmentId);
        unavailableItems.push({
          equipment,
          conflictingBookings
        });
      }
    }

    return {
      available: unavailableItems.length === 0,
      unavailableItems
    };
  } catch (error) {
    console.error('Error checking kit availability:', error);
    throw error;
  }
}

/**
 * Book an entire equipment kit
 * Creates individual bookings for each equipment item in the kit
 * @param {Object} kitBookingData - { kitId, userId, startDate, endDate, justification }
 * @returns {Promise<Object>} Kit booking with individual booking IDs
 */
export async function bookKit(kitBookingData) {
  const { kitId, userId, startDate, endDate, justification } = kitBookingData;

  try {
    // Check availability first
    const availability = await checkKitAvailability(kitId, startDate, endDate);
    if (!availability.available) {
      throw new Error('Some equipment in this kit is not available for the selected dates');
    }

    const kit = await getKitById(kitId);
    const bookingIds = [];
    const equipment_ids = kit.equipment_ids || [];

    // Create individual booking for each equipment item
    for (const equipmentId of equipment_ids) {
      const response = await bookingsAPI.create({
        equipment_id: equipmentId,
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        justification: justification || `Part of kit booking: ${kit.name}`,
        kit_id: kitId
      });

      if (response.booking) {
        bookingIds.push(response.booking.id);
      }
    }

    return {
      kit_id: kitId,
      booking_ids: bookingIds,
      status: 'pending',
      message: `Created ${bookingIds.length} bookings for kit ${kit.name}`
    };
  } catch (error) {
    console.error('Error booking kit:', error);
    throw error;
  }
}
