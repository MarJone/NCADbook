import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function UnifiedCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [spaceBookings, setSpaceBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('equipment'); // 'equipment', 'rooms', 'all'

  useEffect(() => {
    loadBookings();
  }, [currentDate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Load equipment bookings
      const equipBookings = await demoMode.query('bookings');
      const bookingsWithDetails = await Promise.all(
        equipBookings.map(async (booking) => {
          const equipment = await demoMode.findOne('equipment', { id: booking.equipment_id });
          return { ...booking, equipment, type: 'equipment' };
        })
      );

      // Load space/room bookings
      const roomBookings = await demoMode.query('spaceBookings');
      const spaceBookingsWithDetails = await Promise.all(
        roomBookings.map(async (booking) => {
          const space = await demoMode.findOne('spaces', { id: booking.space_id });
          return { ...booking, space, type: 'room' };
        })
      );

      setBookings(bookingsWithDetails);
      setSpaceBookings(spaceBookingsWithDetails);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    let allBookings = [];

    if (viewType === 'equipment' || viewType === 'all') {
      allBookings = [...allBookings, ...bookings];
    }

    if (viewType === 'rooms' || viewType === 'all') {
      allBookings = [...allBookings, ...spaceBookings];
    }

    return allBookings.filter(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      const checkDate = new Date(dateStr);
      return checkDate >= start && checkDate <= end;
    });
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <LoadingSkeleton type="card" count={1} />;
  }

  return (
    <div className="unified-calendar" data-testid="unified-calendar">
      <div className="calendar-header">
        <h2>Unified Booking Calendar</h2>
        <div className="view-type-selector">
          <button
            onClick={() => setViewType('equipment')}
            className={viewType === 'equipment' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            data-testid="view-equipment"
          >
            Equipment Only
          </button>
          <button
            onClick={() => setViewType('rooms')}
            className={viewType === 'rooms' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            data-testid="view-rooms"
          >
            Rooms Only
          </button>
          <button
            onClick={() => setViewType('all')}
            className={viewType === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            data-testid="view-all"
          >
            All Bookings
          </button>
        </div>
      </div>

      <div className="calendar-navigation">
        <button
          onClick={() => changeMonth(-1)}
          className="btn btn-secondary"
          aria-label="Previous month"
        >
          ← Previous
        </button>
        <h3>{monthNames[month]} {year}</h3>
        <button
          onClick={() => changeMonth(1)}
          className="btn btn-secondary"
          aria-label="Next month"
        >
          Next →
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-header-row">
          {dayNames.map(day => (
            <div key={day} className="calendar-header-cell">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-body">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-cell empty" />
          ))}

          {/* Calendar days */}
          {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const date = new Date(year, month, day);
            const dayBookings = getBookingsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={day}
                className={`calendar-cell ${isToday ? 'today' : ''}`}
                data-testid={`calendar-day-${day}`}
              >
                <div className="calendar-day-number">{day}</div>
                {dayBookings.length > 0 && (
                  <div className="calendar-bookings">
                    <span className="booking-count">
                      {dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}
                    </span>
                    <div className="booking-indicators">
                      {dayBookings.slice(0, 3).map((booking, idx) => (
                        <div
                          key={idx}
                          className={`booking-indicator ${booking.type}`}
                          title={booking.equipment?.product_name || booking.space?.name}
                        >
                          {booking.type === 'equipment' ? 'E' : 'R'}
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="booking-indicator-more">
                          +{dayBookings.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-indicator equipment">E</span>
          <span>Equipment Booking</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator room">R</span>
          <span>Room Booking</span>
        </div>
      </div>
    </div>
  );
}
