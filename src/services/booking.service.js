import { demoMode } from '../mocks/demo-mode.js';

export const bookingService = {
  async createBooking(bookingData) {
    const { equipment_id, start_date, end_date, user_id, purpose } = bookingData;

    const conflicts = await this.checkConflicts(equipment_id, start_date, end_date);
    if (conflicts.length > 0) {
      throw new Error('Equipment is already booked for selected dates');
    }

    const equipment = await demoMode.findOne('equipment', { id: equipment_id });
    if (equipment.requires_justification && (!purpose || purpose.trim().length < 10)) {
      throw new Error('This equipment requires a detailed justification (minimum 10 characters)');
    }

    const newBooking = {
      id: 'bk' + Date.now(),
      user_id,
      equipment_id,
      start_date,
      end_date,
      purpose,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await demoMode.insert('bookings', newBooking);
    return newBooking;
  },

  async getUserBookings(userId) {
    return await demoMode.query('bookings', { user_id: userId });
  },

  async getBookingById(bookingId) {
    return await demoMode.findOne('bookings', { id: bookingId });
  },

  async cancelBooking(bookingId) {
    await demoMode.update('bookings', { id: bookingId }, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    });
  },

  async checkConflicts(equipmentId, startDate, endDate) {
    const allBookings = await demoMode.query('bookings', { equipment_id: equipmentId });
    
    return allBookings.filter(booking => {
      if (['cancelled', 'denied', 'completed'].includes(booking.status)) {
        return false;
      }

      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      const requestStart = new Date(startDate);
      const requestEnd = new Date(endDate);

      return (requestStart <= bookingEnd && requestEnd >= bookingStart);
    });
  },

  async getBookingsWithEquipment(userId) {
    const bookings = await this.getUserBookings(userId);
    const bookingsWithEquipment = await Promise.all(
      bookings.map(async (booking) => {
        const equipment = await demoMode.findOne('equipment', { id: booking.equipment_id });
        return { ...booking, equipment };
      })
    );
    return bookingsWithEquipment;
  }
};
