import { useState, useEffect } from 'react';
import { spaceService } from '../../services/space.service';
import './RoomCalendar.css';

/**
 * Room Calendar Component
 *
 * Monthly calendar view showing room availability with:
 * - Visual availability indicators
 * - Multi-day selection
 * - Recurring booking patterns
 * - Time slot selection per day
 */

export default function RoomCalendar({
  selectedRoom,
  onDateTimeSelect,
  selectedDates = [],
  recurringPattern = null
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [selectedSlots, setSelectedSlots] = useState({}); // { 'YYYY-MM-DD': [slots] }
  const [loading, setLoading] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [currentDateForTime, setCurrentDateForTime] = useState(null);

  useEffect(() => {
    if (selectedRoom) {
      loadMonthAvailability();
    }
  }, [selectedRoom, currentMonth]);

  const loadMonthAvailability = async () => {
    if (!selectedRoom) return;

    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const availabilityData = {};

      // Load availability for all days in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];

        // Skip past dates
        if (date < new Date().setHours(0, 0, 0, 0)) {
          availabilityData[dateStr] = { available: false, isPast: true };
          continue;
        }

        const bookings = await spaceService.getSpaceBookingsForDate(selectedRoom.id, dateStr);
        const totalSlots = 9; // 9am-6pm = 9 hours
        const bookedSlots = bookings.length;
        const availableSlots = totalSlots - bookedSlots;

        availabilityData[dateStr] = {
          available: availableSlots > 0,
          totalSlots,
          bookedSlots,
          availableSlots,
          bookings
        };
      }

      setAvailability(availabilityData);
    } catch (error) {
      console.error('Failed to load availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 18; hour++) {
      slots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`,
        label: `${hour}:00 - ${hour + 1}:00`
      });
    }
    return slots;
  };

  const isSlotBookedForDate = (date, slot) => {
    const dateAvailability = availability[date];
    if (!dateAvailability || !dateAvailability.bookings) return false;

    return dateAvailability.bookings.some(booking => {
      const bookingStart = spaceService.timeToMinutes(booking.start_time);
      const bookingEnd = spaceService.timeToMinutes(booking.end_time);
      const slotStart = spaceService.timeToMinutes(slot.start);
      const slotEnd = spaceService.timeToMinutes(slot.end);
      return (slotStart < bookingEnd && slotEnd > bookingStart);
    });
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availability[dateStr];

    if (!dayAvailability || !dayAvailability.available || dayAvailability.isPast) {
      return;
    }

    setCurrentDateForTime(dateStr);
    setShowTimeModal(true);
  };

  const handleTimeSlotSelect = (slot) => {
    if (!currentDateForTime) return;

    const isBooked = isSlotBookedForDate(currentDateForTime, slot);
    if (isBooked) return;

    const currentSlots = selectedSlots[currentDateForTime] || [];
    const slotIndex = currentSlots.findIndex(s => s.start === slot.start);

    if (slotIndex >= 0) {
      // Remove slot
      const newSlots = currentSlots.filter(s => s.start !== slot.start);
      setSelectedSlots({
        ...selectedSlots,
        [currentDateForTime]: newSlots
      });
    } else {
      // Add slot
      setSelectedSlots({
        ...selectedSlots,
        [currentDateForTime]: [...currentSlots, slot]
      });
    }
  };

  const handleConfirmTimeSelection = () => {
    if (onDateTimeSelect) {
      onDateTimeSelect(currentDateForTime, selectedSlots[currentDateForTime] || []);
    }
    setShowTimeModal(false);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const dayAvailability = availability[dateStr] || {};
      const isPast = dayAvailability.isPast;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      const hasTimeSlots = selectedSlots[dateStr]?.length > 0;

      let className = 'calendar-day';
      if (isPast) className += ' past';
      else if (!dayAvailability.available) className += ' unavailable';
      else if (hasTimeSlots) className += ' selected';
      else if (dayAvailability.availableSlots === dayAvailability.totalSlots) className += ' fully-available';
      else if (dayAvailability.availableSlots > 0) className += ' partially-available';

      if (isToday) className += ' today';

      days.push(
        <div
          key={day}
          className={className}
          onClick={() => handleDateClick(date)}
          title={dayAvailability.available ?
            `${dayAvailability.availableSlots}/${dayAvailability.totalSlots} slots available` :
            'No slots available'}
        >
          <div className="day-number">{day}</div>
          {!isPast && dayAvailability.available && (
            <div className="availability-indicator">
              <div
                className="availability-bar"
                style={{
                  width: `${(dayAvailability.availableSlots / dayAvailability.totalSlots) * 100}%`
                }}
              />
            </div>
          )}
          {hasTimeSlots && (
            <div className="selected-badge">{selectedSlots[dateStr].length}</div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const timeSlots = generateTimeSlots();

  return (
    <div className="room-calendar">
      <div className="calendar-header">
        <button onClick={prevMonth} className="btn-month-nav" aria-label="Previous month">
          ←
        </button>
        <h3 className="calendar-month">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="btn-month-nav" aria-label="Next month">
          →
        </button>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color fully-available"></div>
          <span>Fully Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color partially-available"></div>
          <span>Partially Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color unavailable"></div>
          <span>Unavailable</span>
        </div>
        <div className="legend-item">
          <div className="legend-color selected"></div>
          <span>Selected</span>
        </div>
      </div>

      <div className="calendar-weekdays">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="calendar-grid">
        {loading ? (
          <div className="calendar-loading">Loading availability...</div>
        ) : (
          renderCalendar()
        )}
      </div>

      {/* Time Slot Selection Modal */}
      {showTimeModal && currentDateForTime && (
        <div className="modal-overlay" onClick={() => setShowTimeModal(false)}>
          <div className="modal-content time-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Time Slots</h3>
              <button className="btn-close" onClick={() => setShowTimeModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="time-modal-date">
                {new Date(currentDateForTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <div className="time-slots-grid">
                {timeSlots.map(slot => {
                  const isBooked = isSlotBookedForDate(currentDateForTime, slot);
                  const isSelected = selectedSlots[currentDateForTime]?.some(s => s.start === slot.start);

                  let className = 'time-slot';
                  if (isBooked) className += ' booked';
                  else if (isSelected) className += ' selected';

                  return (
                    <button
                      key={slot.start}
                      className={className}
                      onClick={() => handleTimeSlotSelect(slot)}
                      disabled={isBooked}
                    >
                      {slot.label}
                      {isBooked && <span className="slot-badge">Booked</span>}
                      {isSelected && !isBooked && <span className="slot-badge">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowTimeModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmTimeSelection}
                disabled={!selectedSlots[currentDateForTime]?.length}
              >
                Confirm ({selectedSlots[currentDateForTime]?.length || 0} slots)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
