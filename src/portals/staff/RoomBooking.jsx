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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
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
    setSelectedTimeSlot(slot);
    setShowBookingModal(true);
  };

  const handleCreateBooking = async () => {
    if (!purpose.trim()) {
      showToast('Please provide a purpose for the booking', 'error');
      return;
    }

    try {
      await spaceService.createSpaceBooking({
        space_id: selectedSpace.id,
        booking_date: selectedDate,
        start_time: selectedTimeSlot.start,
        end_time: selectedTimeSlot.end,
        user_id: user.id,
        purpose
      });

      setShowBookingModal(false);
      setPurpose('');
      setSelectedTimeSlot(null);
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
        <h3>Available Time Slots</h3>
        <div className="slots-container" data-testid="time-slots-container">
          {timeSlots.map(slot => {
            const booked = isSlotBooked(slot);
            return (
              <button
                key={slot.start}
                onClick={() => handleSlotClick(slot)}
                className={booked ? 'time-slot time-slot-booked' : 'time-slot time-slot-available'}
                disabled={booked}
                data-testid={`time-slot-${slot.start}`}
              >
                {slot.label}
                {booked && <span className="slot-status">Booked</span>}
              </button>
            );
          })}
        </div>
      </div>

      {showBookingModal && selectedTimeSlot && (
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
                <p><strong>Time:</strong> {selectedTimeSlot.label}</p>
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
