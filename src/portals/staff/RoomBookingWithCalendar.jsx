import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { spaceService } from '../../services/space.service';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import RoomCalendar from '../../components/room/RoomCalendar';
import RecurringBookingSelector, { generateRecurringDates } from '../../components/room/RecurringBookingSelector';

export default function RoomBookingWithCalendar() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [selectedDateTimeSlots, setSelectedDateTimeSlots] = useState({}); // { 'YYYY-MM-DD': [slots] }
  const [recurringPattern, setRecurringPattern] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'legacy'
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadSpaces();
  }, []);

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

  const handleDateTimeSelect = (date, slots) => {
    if (slots.length === 0) {
      // Remove date if no slots selected
      const { [date]: removed, ...rest } = selectedDateTimeSlots;
      setSelectedDateTimeSlots(rest);
    } else {
      setSelectedDateTimeSlots({
        ...selectedDateTimeSlots,
        [date]: slots
      });
    }
  };

  const handleRecurringPatternChange = (pattern) => {
    setRecurringPattern(pattern);
  };

  const getTotalSelectedSlots = () => {
    return Object.values(selectedDateTimeSlots).reduce((total, slots) => total + slots.length, 0);
  };

  const getSelectedDatesCount = () => {
    return Object.keys(selectedDateTimeSlots).length;
  };

  const handleOpenBookingModal = () => {
    if (getTotalSelectedSlots() === 0) {
      showToast('Please select at least one date and time slot', 'error');
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
      let datesToBook = Object.keys(selectedDateTimeSlots);

      // If recurring pattern is set, generate all dates
      if (recurringPattern) {
        const baseDate = datesToBook[0]; // Use first selected date as base
        const baseSlots = selectedDateTimeSlots[baseDate];

        const recurringDates = generateRecurringDates(baseDate, recurringPattern);

        // Create slots for all recurring dates
        const newDateTimeSlots = {};
        recurringDates.forEach(date => {
          newDateTimeSlots[date] = baseSlots;
        });

        datesToBook = recurringDates;
        setSelectedDateTimeSlots(newDateTimeSlots);
      }

      // Create bookings for all dates
      const bookingPromises = datesToBook.map(async (date) => {
        const slots = selectedDateTimeSlots[date];
        if (!slots || slots.length === 0) return null;

        // Sort slots to get continuous range
        const sortedSlots = [...slots].sort((a, b) => {
          return spaceService.timeToMinutes(a.start) - spaceService.timeToMinutes(b.start);
        });

        const startTime = sortedSlots[0].start;
        const endTime = sortedSlots[sortedSlots.length - 1].end;

        return spaceService.createSpaceBooking({
          space_id: selectedSpace.id,
          booking_date: date,
          start_time: startTime,
          end_time: endTime,
          user_id: user.id,
          purpose
        });
      });

      const results = await Promise.allSettled(bookingPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      setShowBookingModal(false);
      setPurpose('');
      setSelectedDateTimeSlots({});
      setRecurringPattern(null);

      if (failed === 0) {
        showToast(`Successfully created ${successful} booking${successful !== 1 ? 's' : ''}!`, 'success');
      } else {
        showToast(`Created ${successful} booking(s), ${failed} failed (likely conflicts)`, 'warning');
      }
    } catch (error) {
      showToast('Failed to create bookings: ' + error.message, 'error');
    }
  };

  if (loading) {
    return <div className="loading">Loading spaces...</div>;
  }

  return (
    <div className="room-booking-calendar">
      <h2>Room & Space Booking</h2>
      <p className="subtitle">Select dates and times from the calendar below</p>

      <div className="booking-controls">
        <div className="form-group">
          <label htmlFor="space-select">Select Space</label>
          <select
            id="space-select"
            value={selectedSpace?.id || ''}
            onChange={(e) => {
              const space = spaces.find(s => s.id === e.target.value);
              setSelectedSpace(space);
              setSelectedDateTimeSlots({}); // Reset selections when changing room
            }}
            className="select-input"
          >
            {spaces.map(space => (
              <option key={space.id} value={space.id}>
                {space.name} (Capacity: {space.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="view-toggle-group">
          <button
            className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Calendar View
          </button>
          <button
            className={`btn ${viewMode === 'legacy' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('legacy')}
          >
            📋 Day View
          </button>
        </div>
      </div>

      {selectedSpace && (
        <div className="space-details">
          <h3>{selectedSpace.name}</h3>
          <p>{selectedSpace.description}</p>
          <p className="equipment-list">
            <strong>Available Equipment:</strong> {selectedSpace.equipment_available}
          </p>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <>
          <RoomCalendar
            selectedRoom={selectedSpace}
            onDateTimeSelect={handleDateTimeSelect}
            selectedDates={Object.keys(selectedDateTimeSlots)}
          />

          <RecurringBookingSelector
            onPatternChange={handleRecurringPatternChange}
          />

          {getTotalSelectedSlots() > 0 && (
            <div className="booking-summary-card">
              <div className="summary-content">
                <h4>Booking Summary</h4>
                <p>
                  <strong>{getSelectedDatesCount()} date{getSelectedDatesCount() !== 1 ? 's' : ''}</strong> selected
                  with <strong>{getTotalSelectedSlots()} time slot{getTotalSelectedSlots() !== 1 ? 's' : ''}</strong>
                </p>
                {recurringPattern && recurringPattern.type !== 'none' && (
                  <p className="recurring-info">
                    🔄 Recurring pattern will be applied
                  </p>
                )}
              </div>
              <button
                onClick={handleOpenBookingModal}
                className="btn btn-primary btn-lg"
              >
                Proceed to Book
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="legacy-view-message">
          <p>Switch to Calendar View to see room availability and book multiple dates</p>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Booking</h2>
              <button className="btn-close" onClick={() => setShowBookingModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="booking-summary">
                <p><strong>Space:</strong> {selectedSpace.name}</p>
                <p><strong>Dates:</strong> {getSelectedDatesCount()} date(s)</p>
                <p><strong>Total Time Slots:</strong> {getTotalSelectedSlots()}</p>

                {recurringPattern && recurringPattern.type !== 'none' && (
                  <div className="recurring-summary">
                    <p className="recurring-badge">🔄 Recurring Booking</p>
                    <p>Pattern will be applied to generate multiple bookings</p>
                  </div>
                )}

                <div className="dates-list">
                  <h4>Selected Dates & Times:</h4>
                  {Object.entries(selectedDateTimeSlots).slice(0, 5).map(([date, slots]) => {
                    const sortedSlots = [...slots].sort((a, b) =>
                      spaceService.timeToMinutes(a.start) - spaceService.timeToMinutes(b.start)
                    );
                    return (
                      <div key={date} className="date-entry">
                        <strong>{new Date(date).toLocaleDateString()}</strong>
                        <span> {sortedSlots[0].start} - {sortedSlots[sortedSlots.length - 1].end}</span>
                      </div>
                    );
                  })}
                  {Object.keys(selectedDateTimeSlots).length > 5 && (
                    <p className="more-dates">... and {Object.keys(selectedDateTimeSlots).length - 5} more</p>
                  )}
                </div>
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
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowBookingModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateBooking} className="btn btn-primary">
                Confirm Booking
              </button>
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

      <style jsx>{`
        .room-booking-calendar {
          padding: var(--space-4);
        }

        .booking-controls {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
          align-items: flex-end;
        }

        .form-group {
          flex: 1;
          min-width: 250px;
        }

        .view-toggle-group {
          display: flex;
          gap: var(--space-2);
        }

        .space-details {
          background: var(--theme-bg-secondary);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-4);
        }

        .space-details h3 {
          margin: 0 0 var(--space-2) 0;
        }

        .space-details p {
          margin: var(--space-2) 0;
          color: var(--theme-text-secondary);
        }

        .equipment-list {
          font-size: var(--text-sm);
        }

        .booking-summary-card {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          margin-top: var(--space-4);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .summary-content h4 {
          margin: 0 0 var(--space-2) 0;
        }

        .summary-content p {
          margin: var(--space-1) 0;
        }

        .recurring-info {
          font-style: italic;
          opacity: 0.9;
        }

        .btn-lg {
          padding: var(--space-3) var(--space-6);
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
        }

        .booking-modal {
          max-width: 600px;
        }

        .booking-summary {
          background: var(--theme-bg-secondary);
          padding: var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-4);
        }

        .recurring-summary {
          background: #fef3c7;
          padding: var(--space-3);
          border-radius: var(--radius-sm);
          margin-top: var(--space-3);
        }

        .recurring-badge {
          color: #92400e;
          font-weight: var(--font-semibold);
          margin-bottom: var(--space-1);
        }

        .dates-list {
          margin-top: var(--space-3);
        }

        .dates-list h4 {
          font-size: var(--text-sm);
          margin-bottom: var(--space-2);
          text-transform: uppercase;
          color: var(--theme-text-secondary);
        }

        .date-entry {
          padding: var(--space-2);
          background: var(--theme-bg-tertiary);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-1);
          display: flex;
          justify-content: space-between;
        }

        .more-dates {
          font-style: italic;
          color: var(--theme-text-secondary);
          text-align: center;
          margin-top: var(--space-2);
        }

        .legacy-view-message {
          text-align: center;
          padding: var(--space-6);
          background: var(--theme-bg-secondary);
          border-radius: var(--radius-lg);
          color: var(--theme-text-secondary);
        }
      `}</style>
    </div>
  );
}
