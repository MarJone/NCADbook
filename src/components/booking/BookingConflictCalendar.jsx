import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../utils/api';

export default function BookingConflictCalendar({ equipmentId, selectedStartDate, selectedEndDate }) {
  const [bookings, setBookings] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (equipmentId) {
      loadBookingsForEquipment();
    }
  }, [equipmentId, currentMonth]);

  const loadBookingsForEquipment = async () => {
    try {
      const response = await bookingsAPI.getAll({ equipment_id: equipmentId, status: 'approved' });
      // Only show approved bookings for conflict visualization
      const approvedBookings = response.bookings || [];
      setBookings(approvedBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      setBookings([]);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const isDateBooked = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.some(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

  const isDateSelected = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const dateStr = date.toISOString().split('T')[0];
    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);
    const current = new Date(dateStr);
    return current >= start && current <= end;
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1));
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="booking-conflict-calendar" data-testid="conflict-calendar">
      <div className="calendar-header">
        <button
          onClick={previousMonth}
          className="btn btn-secondary btn-sm"
          aria-label="Previous month"
          data-testid="prev-month-btn"
        >
          Previous
        </button>
        <h3>{monthNames[month]} {year}</h3>
        <button
          onClick={nextMonth}
          className="btn btn-secondary btn-sm"
          aria-label="Next month"
          data-testid="next-month-btn"
        >
          Next
        </button>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-color booked"></span>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <span className="legend-color selected"></span>
          <span>Your Selection</span>
        </div>
        <div className="legend-item">
          <span className="legend-color past"></span>
          <span>Past</span>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-days-header">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-name">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(year, month, day);
            const booked = isDateBooked(date);
            const selected = isDateSelected(date);
            const past = isPastDate(date);

            const classNames = [
              'calendar-day',
              booked && 'booked',
              selected && 'selected',
              past && 'past'
            ].filter(Boolean).join(' ');

            return (
              <div
                key={day}
                className={classNames}
                data-testid={`calendar-day-${day}`}
                aria-label={`${monthNames[month]} ${day}, ${year}${booked ? ' - Booked' : ''}${selected ? ' - Selected' : ''}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-info">
        <p>This calendar shows when this equipment is already booked. Select dates that are available.</p>
      </div>
    </div>
  );
}
