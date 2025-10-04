import { useState } from 'react';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../hooks/useAuth';
import { emailService } from '../../services/email.service';
import { demoMode } from '../../mocks/demo-mode';
import BookingConflictCalendar from './BookingConflictCalendar';

export default function BookingModal({ equipment, onClose, onSuccess }) {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Check if user has permission to create bookings (for staff only)
  const canCreateBooking = () => {
    if (!user) return false;
    // Students and admins always have access
    if (user.role === 'student' || user.role === 'department_admin' || user.role === 'master_admin') return true;
    // Staff users need view_permissions
    if (user.role === 'staff') {
      return user.view_permissions?.can_create_bookings !== false;
    }
    return true;
  };

  const validateForm = () => {
    const errors = {};

    if (!startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!endDate) {
      errors.endDate = 'End date is required';
    } else if (startDate && endDate < startDate) {
      errors.endDate = 'End date must be after start date';
    }

    if (equipment.requires_justification && (!purpose || purpose.trim().length < 10)) {
      errors.purpose = 'Purpose must be at least 10 characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const booking = await bookingService.createBooking({
        equipment_id: equipment.id,
        start_date: startDate,
        end_date: endDate,
        purpose,
        user_id: user.id
      });

      // Send booking confirmation email
      try {
        const equipmentItems = [equipment]; // Single item for now, could be array for multi-item bookings
        const emailResult = await emailService.sendBookingConfirmation(booking, user, equipmentItems);
        if (!emailResult.success && emailService.isConfigured()) {
          console.warn('Email notification failed, but booking was created:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
        // Don't block booking success if email fails
      }

      onSuccess(booking);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // Check if user has permission
  if (!canCreateBooking()) {
    return (
      <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
        <div className="modal-content modal" onClick={(e) => e.stopPropagation()} data-testid="booking-modal">
          <div className="modal-header">
            <h2>Access Restricted</h2>
            <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
          </div>
          <div className="modal-body">
            <div className="restriction-message" style={{ textAlign: 'center', padding: '2rem', background: '#fff3cd', border: '2px solid #ffc107', borderRadius: '8px' }}>
              <h3 style={{ color: '#856404', marginBottom: '1rem' }}>Cannot Create Booking</h3>
              <p style={{ color: '#856404', marginBottom: '0.5rem' }}>You do not have permission to create equipment bookings.</p>
              <p style={{ color: '#856404' }}>Please contact your department admin to request access.</p>
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button onClick={onClose} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
      <div className="modal-content modal" onClick={(e) => e.stopPropagation()} data-testid="booking-modal">
        <div className="modal-header">
          <h2>Book Equipment</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className="modal-body">
          <div className="equipment-summary">
            <h3>{equipment.product_name}</h3>
            <p>{equipment.category} - {equipment.department}</p>
          </div>

          <form onSubmit={handleSubmit} data-testid="booking-form" noValidate>
            <div className="form-group">
              <label htmlFor="start-date">Start Date</label>
              <input
                id="start-date"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                required
                data-testid="start-date-input"
                className={fieldErrors.startDate ? 'error' : ''}
              />
              {fieldErrors.startDate && <div className="field-error" role="alert">{fieldErrors.startDate}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="end-date">End Date</label>
              <input
                id="end-date"
                name="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                required
                data-testid="end-date-input"
                className={fieldErrors.endDate ? 'error' : ''}
              />
              {fieldErrors.endDate && <div className="field-error" role="alert">{fieldErrors.endDate}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="purpose">
                Purpose/Justification
                {equipment.requires_justification && <span className="required"> *Required (min 10 chars)</span>}
              </label>
              <textarea
                id="purpose"
                name="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Describe how you will use this equipment..."
                rows="4"
                required={equipment.requires_justification}
                data-testid="purpose-input"
                className={fieldErrors.purpose ? 'error' : ''}
              />
              {fieldErrors.purpose && <div className="field-error" role="alert">{fieldErrors.purpose}</div>}
            </div>

            {/* Show conflict calendar if dates are selected */}
            {startDate && endDate && (
              <div className="form-group">
                <label>Booking Availability Calendar</label>
                <BookingConflictCalendar
                  equipmentId={equipment.id}
                  selectedStartDate={startDate}
                  selectedEndDate={endDate}
                />
              </div>
            )}

            {error && <div className="error-message" role="alert">{error}</div>}

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary" data-testid="cancel-booking-btn">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading} data-testid="submit-booking-btn">
                {loading ? 'Creating Booking...' : 'Create Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
