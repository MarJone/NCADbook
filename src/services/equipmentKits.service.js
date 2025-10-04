/**
 * Equipment Kits Service
 * Manages equipment kit bundles (department admin only)
 */

import { demoMode } from '../mocks/demo-mode';

/**
 * Get all equipment kits for a department
 * @param {string} departmentId - Department ID
 * @param {boolean} activeOnly - Only return active kits
 * @returns {Promise<Array>} Equipment kits
 */
export async function getKitsByDepartment(departmentId, activeOnly = true) {
  try {
    const kits = await demoMode.query('equipment_kits', { department_id: departmentId });
    return activeOnly ? kits.filter(kit => kit.is_active) : kits;
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
    const kits = await demoMode.query('equipment_kits', { id: kitId });
    if (kits.length === 0) {
      throw new Error('Kit not found');
    }

    const kit = kits[0];

    // Populate equipment details
    const allEquipment = await demoMode.query('equipment');
    kit.equipment = kit.equipment_ids.map(eqId => {
      return allEquipment.find(eq => eq.id === eqId);
    }).filter(Boolean);

    return kit;
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
    const newKit = {
      id: `kit${Date.now()}`,
      ...kitData,
      created_at: new Date().toISOString(),
      is_active: true
    };

    const data = demoMode.getData();
    data.equipment_kits = data.equipment_kits || [];
    data.equipment_kits.push(newKit);
    demoMode.saveData(data);

    return newKit;
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
    const data = demoMode.getData();
    const kits = data.equipment_kits || [];
    const kitIndex = kits.findIndex(k => k.id === kitId);

    if (kitIndex === -1) {
      throw new Error('Kit not found');
    }

    kits[kitIndex] = {
      ...kits[kitIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    data.equipment_kits = kits;
    demoMode.saveData(data);

    return kits[kitIndex];
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
    await updateKit(kitId, { is_active: false });
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
    const bookings = await demoMode.query('bookings');

    const unavailableItems = [];

    for (const equipmentId of kit.equipment_ids) {
      // Check if equipment is booked during the requested period
      const conflictingBookings = bookings.filter(booking => {
        if (booking.equipment_id !== equipmentId) return false;
        if (booking.status !== 'approved') return false;

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

    // Create individual booking for each equipment item
    for (const equipmentId of kit.equipment_ids) {
      const booking = {
        id: `book${Date.now()}_${equipmentId}`,
        equipment_id: equipmentId,
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        status: 'pending',
        justification: justification || `Part of kit booking: ${kit.name}`,
        kit_booking_id: `kitbook${Date.now()}`, // Link to kit booking
        created_at: new Date().toISOString()
      };

      const data = demoMode.getData();
      data.bookings = data.bookings || [];
      data.bookings.push(booking);
      demoMode.saveData(data);

      bookingIds.push(booking.id);
    }

    // Create kit booking record
    const kitBooking = {
      id: `kitbook${Date.now()}`,
      kit_id: kitId,
      booking_ids: bookingIds,
      user_id: userId,
      start_date: startDate,
      end_date: endDate,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const data = demoMode.getData();
    data.kit_bookings = data.kit_bookings || [];
    data.kit_bookings.push(kitBooking);
    demoMode.saveData(data);

    return kitBooking;
  } catch (error) {
    console.error('Error booking kit:', error);
    throw error;
  }
}
