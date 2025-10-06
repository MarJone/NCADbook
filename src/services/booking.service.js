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
  }
};
