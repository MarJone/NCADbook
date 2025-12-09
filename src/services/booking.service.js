import { bookingsAPI } from '../utils/api.js';

export const bookingService = {
  async createBooking(bookingData) {
    const { equipment_id, start_date, end_date, purpose } = bookingData;

    // Backend will handle conflict checking and validation
    try {
      const response = await bookingsAPI.create({
        equipment_id,
        start_date,
        end_date,
        purpose,
        booking_type: 'standard'
      });

      return response.booking;
    } catch (error) {
      throw new Error(error.message || 'Failed to create booking');
    }
  },

  async getUserBookings(userId) {
    try {
      const response = await bookingsAPI.getAll({ user_id: userId });
      return response.bookings || [];
    } catch (error) {
      console.error('Failed to get user bookings:', error);
      return [];
    }
  },

  async getBookingById(bookingId) {
    try {
      const response = await bookingsAPI.getById(bookingId);
      return response.booking;
    } catch (error) {
      throw new Error(error.message || 'Failed to get booking');
    }
  },

  async cancelBooking(bookingId) {
    try {
      await bookingsAPI.delete(bookingId);
    } catch (error) {
      throw new Error(error.message || 'Failed to cancel booking');
    }
  },

  async checkConflicts(equipmentId, startDate, endDate) {
    // Backend conflict detection is handled during booking creation
    // This method can be used for frontend validation
    try {
      const response = await bookingsAPI.getAll({
        equipment_id: equipmentId,
        status: 'approved'
      });

      const bookings = response.bookings || [];

      return bookings.filter(booking => {
      if (['cancelled', 'denied', 'completed'].includes(booking.status)) {
        return false;
      }

      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      const requestStart = new Date(startDate);
      const requestEnd = new Date(endDate);

      return (requestStart <= bookingEnd && requestEnd >= bookingStart);
    });
    } catch (error) {
      console.error('Failed to check conflicts:', error);
      return [];
    }
  },

  async getBookingsWithEquipment(userId) {
    try {
      // Backend already returns equipment info with bookings
      const response = await bookingsAPI.getAll({ user_id: userId });
      return response.bookings || [];
    } catch (error) {
      console.error('Failed to get bookings with equipment:', error);
      return [];
    }
  },

  /**
   * Request an extension for an existing booking
   * @param {string} bookingId - Booking ID to extend
   * @param {string} newEndDate - New end date (YYYY-MM-DD)
   * @param {string} reason - Reason for extension (optional)
   * @returns {Object} Updated booking or error
   */
  async requestExtension(bookingId, newEndDate, reason = '') {
    try {
      // First, get the current booking to validate
      const booking = await this.getBookingById(bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if booking is eligible for extension
      const eligibleStatuses = ['approved', 'checked_out'];
      if (!eligibleStatuses.includes(booking.status)) {
        throw new Error(`Cannot extend a booking with status: ${booking.status}`);
      }

      // Validate new end date is after current end date
      if (newEndDate <= booking.end_date) {
        throw new Error('New end date must be after current end date');
      }

      // Check for conflicts with the extension period
      const conflicts = await this.checkConflicts(
        booking.equipment_id,
        booking.end_date,
        newEndDate
      );

      // Filter out the current booking from conflicts
      const realConflicts = conflicts.filter(c => c.id !== bookingId);

      if (realConflicts.length > 0) {
        throw new Error('Equipment is not available for the requested extension period');
      }

      // Submit the extension request
      const response = await bookingsAPI.update(bookingId, {
        end_date: newEndDate,
        extension_reason: reason,
        extension_requested_at: new Date().toISOString(),
      });

      return response.booking || {
        ...booking,
        end_date: newEndDate,
        extension_reason: reason,
      };
    } catch (error) {
      throw new Error(error.message || 'Failed to request extension');
    }
  },

  /**
   * Get maximum extension date for a booking
   * @param {string} bookingId - Booking ID
   * @returns {Object} Max extension info
   */
  async getMaxExtensionDate(bookingId) {
    try {
      const booking = await this.getBookingById(bookingId);

      if (!booking) {
        return { maxDate: null, reason: 'Booking not found' };
      }

      // Get all future bookings for this equipment
      const response = await bookingsAPI.getAll({
        equipment_id: booking.equipment_id,
        status: 'approved,pending'
      });

      const currentEndDate = new Date(booking.end_date);
      const futureBookings = (response.bookings || [])
        .filter(b => b.id !== bookingId && new Date(b.start_date) > currentEndDate)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      // If there's a future booking, max date is day before it starts
      if (futureBookings.length > 0) {
        const nextBooking = futureBookings[0];
        const maxDate = new Date(nextBooking.start_date);
        maxDate.setDate(maxDate.getDate() - 1);
        return {
          maxDate: maxDate.toISOString().split('T')[0],
          reason: 'Next booking starts on ' + nextBooking.start_date,
          nextBookingDate: nextBooking.start_date
        };
      }

      // No conflicts - allow extension up to 14 days from current end
      const maxDate = new Date(booking.end_date);
      maxDate.setDate(maxDate.getDate() + 14);
      return {
        maxDate: maxDate.toISOString().split('T')[0],
        reason: 'Maximum extension period: 14 days',
        isMaxPeriod: true
      };
    } catch (error) {
      console.error('Error getting max extension date:', error);
      return { maxDate: null, reason: error.message };
    }
  },

  /**
   * Find alternative available dates when there's a conflict
   * @param {string} equipmentId - Equipment ID
   * @param {string} startDate - Requested start date (YYYY-MM-DD)
   * @param {string} endDate - Requested end date (YYYY-MM-DD)
   * @param {number} daysToSearch - How many days forward to search (default: 30)
   * @returns {Array} Array of alternative date ranges
   */
  async findAlternativeDates(equipmentId, startDate, endDate, daysToSearch = 30) {
    try {
      // Get all active bookings for this equipment
      const response = await bookingsAPI.getAll({
        equipment_id: equipmentId,
        status: 'approved,pending'
      });

      const existingBookings = (response.bookings || []).filter(b =>
        !['cancelled', 'denied', 'completed'].includes(b.status)
      );

      // Calculate requested duration
      const requestedStart = new Date(startDate);
      const requestedEnd = new Date(endDate);
      const requestedDuration = Math.ceil((requestedEnd - requestedStart) / (1000 * 60 * 60 * 24)) + 1;

      // Build list of booked date ranges
      const bookedRanges = existingBookings.map(b => ({
        start: new Date(b.start_date),
        end: new Date(b.end_date)
      }));

      // Find available slots
      const alternatives = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Search forward from today
      let searchDate = new Date(Math.max(today.getTime(), requestedStart.getTime()));
      const searchEnd = new Date(searchDate);
      searchEnd.setDate(searchEnd.getDate() + daysToSearch);

      while (searchDate < searchEnd && alternatives.length < 5) {
        // Check if this date range is available
        const potentialEnd = new Date(searchDate);
        potentialEnd.setDate(potentialEnd.getDate() + requestedDuration - 1);

        const hasConflict = bookedRanges.some(range =>
          searchDate <= range.end && potentialEnd >= range.start
        );

        if (!hasConflict) {
          // Check if this is a weekend slot (bonus indicator)
          const isFriday = searchDate.getDay() === 5;

          alternatives.push({
            startDate: searchDate.toISOString().split('T')[0],
            endDate: potentialEnd.toISOString().split('T')[0],
            duration: requestedDuration,
            includesWeekend: isFriday,
            label: formatDateRange(searchDate, potentialEnd),
          });

          // Skip past this slot to find next alternative
          searchDate = new Date(potentialEnd);
          searchDate.setDate(searchDate.getDate() + 1);
        } else {
          // Move to next day
          searchDate.setDate(searchDate.getDate() + 1);
        }
      }

      return alternatives;
    } catch (error) {
      console.error('Failed to find alternative dates:', error);
      return [];
    }
  }
};

/**
 * Format a date range for display
 */
function formatDateRange(start, end) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-IE', options);
  const endStr = end.toLocaleDateString('en-IE', options);

  // If same month, abbreviate
  if (start.getMonth() === end.getMonth()) {
    const startDay = start.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric' });
    return `${startDay} - ${endStr}`;
  }

  return `${startStr} - ${endStr}`;
}
