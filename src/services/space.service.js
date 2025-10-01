import { demoMode } from '../mocks/demo-mode.js';

export const spaceService = {
  async createSpaceBooking(bookingData) {
    const { space_id, booking_date, start_time, end_time, user_id, purpose } = bookingData;

    // Check for conflicts
    const conflicts = await this.checkConflicts(space_id, booking_date, start_time, end_time);
    if (conflicts.length > 0) {
      throw new Error('Space is already booked for selected time slot');
    }

    const newBooking = {
      id: 'sb' + Date.now(),
      user_id,
      space_id,
      booking_date,
      start_time,
      end_time,
      purpose,
      status: 'approved', // Staff bookings are auto-approved
      created_at: new Date().toISOString(),
      approved_at: new Date().toISOString()
    };

    await demoMode.insert('spaceBookings', newBooking);
    return newBooking;
  },

  async getUserSpaceBookings(userId) {
    return await demoMode.query('spaceBookings', { user_id: userId });
  },

  async getSpaceBookingById(bookingId) {
    return await demoMode.findOne('spaceBookings', { id: bookingId });
  },

  async cancelSpaceBooking(bookingId) {
    await demoMode.update('spaceBookings', { id: bookingId }, {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    });
  },

  async checkConflicts(spaceId, date, startTime, endTime) {
    const allBookings = await demoMode.query('spaceBookings', { space_id: spaceId });

    return allBookings.filter(booking => {
      if (booking.status === 'cancelled') {
        return false;
      }

      if (booking.booking_date !== date) {
        return false;
      }

      // Convert times to minutes for easier comparison
      const bookingStart = this.timeToMinutes(booking.start_time);
      const bookingEnd = this.timeToMinutes(booking.end_time);
      const requestStart = this.timeToMinutes(startTime);
      const requestEnd = this.timeToMinutes(endTime);

      return (requestStart < bookingEnd && requestEnd > bookingStart);
    });
  },

  async getSpaceBookingsWithDetails(userId) {
    const bookings = await this.getUserSpaceBookings(userId);
    const bookingsWithSpaces = await Promise.all(
      bookings.map(async (booking) => {
        const space = await demoMode.findOne('spaces', { id: booking.space_id });
        return { ...booking, space };
      })
    );
    return bookingsWithSpaces;
  },

  async getSpaceBookingsForDate(spaceId, date) {
    const allBookings = await demoMode.query('spaceBookings', { space_id: spaceId });
    return allBookings.filter(b => b.booking_date === date && b.status !== 'cancelled');
  },

  timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  },

  minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
};
