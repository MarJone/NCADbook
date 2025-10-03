import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { spaceService } from '../../services/space.service';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function RoomBooking() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [isBlockBooking, setIsBlockBooking] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadSpaces();
  }, []);

  useEffect(() => {
    if (selectedSpace && selectedDate) {
      loadBookedSlots();
    }
  }, [selectedSpace, selectedDate]);

  const loadSpaces = async () => {
    try {
      const data = await demoMode.query('spaces');
      setSpaces(data);
      if (data.length > 0) {
        setSelectedSpace(data[0]);
      }
    } catch (error) {
      console.error('Failed to load spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookedSlots = async () => {
    try {
      const bookings = await spaceService.getSpaceBookingsForDate(selectedSpace.id, selectedDate);
      setBookedSlots(bookings);
    } catch (error) {
      console.error('Failed to load booked slots:', error);
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

  const isSlotBooked = (slot) => {
    return bookedSlots.some(booking => {
      const bookingStart = spaceService.timeToMinutes(booking.start_time);
      const bookingEnd = spaceService.timeToMinutes(booking.end_time);
      const slotStart = spaceService.timeToMinutes(slot.start);
      const slotEnd = spaceService.timeToMinutes(slot.end);
      return (slotStart < bookingEnd && slotEnd > bookingStart);
    });
  };

  const handleSlotClick = (slot) => {
    if (isSlotBooked(slot)) {
      showToast('This time slot is already booked', 'error');
      return;
    }

    // Toggle slot selection for multi-hour booking
    const slotIndex = selectedSlots.findIndex(s => s.start === slot.start);
    if (slotIndex >= 0) {
      // Remove slot if already selected
      setSelectedSlots(selectedSlots.filter(s => s.start !== slot.start));
    } else {
      // Add slot
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const isSlotSelected = (slot) => {
    return selectedSlots.some(s => s.start === slot.start);
  };

  const handleBlockBookingToggle = (checked) => {
    setIsBlockBooking(checked);
    if (checked) {
      // Select all available slots for the day
      const allSlots = generateTimeSlots();
      const availableSlots = allSlots.filter(slot => !isSlotBooked(slot));
      setSelectedSlots(availableSlots);
    } else {
      setSelectedSlots([]);
    }
  };

  const handleOpenBookingModal = () => {
    if (selectedSlots.length === 0) {
      showToast('Please select at least one time slot', 'error');
      return;
    }
    setShowBookingModal(true);
  };

  const handleCreateBooking = async () => {
    if (!purpose.trim()) {
      showToast('Please provide a purpose for the booking', 'error');
      return;
    }

    try {
      // Sort slots by start time to get the full range
      const sortedSlots = [...selectedSlots].sort((a, b) => {
        return spaceService.timeToMinutes(a.start) - spaceService.timeToMinutes(b.start);
      });

      const startTime = sortedSlots[0].start;
      const endTime = sortedSlots[sortedSlots.length - 1].end;

      await spaceService.createSpaceBooking({
        space_id: selectedSpace.id,
        booking_date: selectedDate,
        start_time: startTime,
        end_time: endTime,
        user_id: user.id,
        purpose
      });

      setShowBookingModal(false);
      setPurpose('');
      setSelectedSlots([]);
      setIsBlockBooking(false);
      await loadBookedSlots();
      showToast('Room booked successfully!', 'success');
    } catch (error) {
      showToast('Failed to book room: ' + error.message, 'error');
    }
  };

  if (loading) {
    return <div className="loading">Loading spaces...</div>;
  }

  const timeSlots = generateTimeSlots();

  return (
    <div className="room-booking">
      <h2>Room & Space Booking</h2>
      <p className="subtitle">Book rooms and spaces by the hour</p>

      <div className="booking-controls">
        <div className="form-group">
          <label htmlFor="space-select">Select Space</label>
          <select
            id="space-select"
            value={selectedSpace?.id || ''}
            onChange={(e) => {
              const space = spaces.find(s => s.id === e.target.value);
              setSelectedSpace(space);
            }}
            className="select-input"
            data-testid="space-select"
          >
            {spaces.map(space => (
              <option key={space.id} value={space.id}>
                {space.name} (Capacity: {space.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date-select">Select Date</label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="date-input"
            data-testid="date-select"
          />
        </div>
      </div>

      {selectedSpace && (
        <div className="space-details" data-testid="space-details">
          <h3>{selectedSpace.name}</h3>
          <p>{selectedSpace.description}</p>
          <p className="equipment-list">
            <strong>Available Equipment:</strong> {selectedSpace.equipment_available}
          </p>
        </div>
      )}

      <div className="time-slots-grid">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ margin: 0 }}>Available Time Slots</h3>
          <div className="booking-options">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isBlockBooking}
                onChange={(e) => handleBlockBookingToggle(e.target.checked)}
                data-testid="block-booking-toggle"
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: '500' }}>Book Entire Day (9am - 6pm)</span>
            </label>
          </div>
        </div>

        {selectedSlots.length > 0 && (
          <div style={{
            background: 'var(--color-success-pale)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--spacing-lg)',
            border: '1px solid var(--color-success)'
          }}>
            <strong>{selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''} selected</strong>
            <button
              onClick={handleOpenBookingModal}
              className="btn btn-primary"
              style={{ marginLeft: 'var(--spacing-md)' }}
              data-testid="proceed-booking-btn"
            >
              Proceed to Book
            </button>
          </div>
        )}

        <div className="slots-container" data-testid="time-slots-container">
          {timeSlots.map(slot => {
            const booked = isSlotBooked(slot);
            const selected = isSlotSelected(slot);
            let slotClass = 'time-slot';
            if (booked) slotClass += ' time-slot-booked';
            else if (selected) slotClass += ' time-slot-selected';
            else slotClass += ' time-slot-available';

            return (
              <button
                key={slot.start}
                onClick={() => handleSlotClick(slot)}
                className={slotClass}
                disabled={booked}
                data-testid={`time-slot-${slot.start}`}
              >
                {slot.label}
                {booked && <span className="slot-status">Booked</span>}
                {selected && !booked && <span className="slot-status">Selected</span>}
              </button>
            );
          })}
        </div>
      </div>

      {showBookingModal && selectedSlots.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)} data-testid="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="room-booking-modal">
            <div className="modal-header">
              <h2>Book {selectedSpace.name}</h2>
              <button className="modal-close" onClick={() => setShowBookingModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="booking-summary">
                <p><strong>Space:</strong> {selectedSpace.name}</p>
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Time Slots:</strong> {selectedSlots.length} slot{selectedSlots.length !== 1 ? 's' : ''}</p>
                <p><strong>Duration:</strong> {(() => {
                  const sortedSlots = [...selectedSlots].sort((a, b) =>
                    spaceService.timeToMinutes(a.start) - spaceService.timeToMinutes(b.start)
                  );
                  return `${sortedSlots[0].start} - ${sortedSlots[sortedSlots.length - 1].end}`;
                })()}</p>
              </div>

              <div className="form-group">
                <label htmlFor="purpose">Purpose</label>
                <textarea
                  id="purpose"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="What will you use this space for?"
                  rows="3"
                  required
                  data-testid="room-purpose-input"
                />
              </div>

              <div className="modal-actions">
                <button onClick={() => setShowBookingModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleCreateBooking} className="btn btn-primary" data-testid="confirm-room-booking-btn">
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
