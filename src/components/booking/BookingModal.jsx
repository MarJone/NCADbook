import { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../hooks/useAuth';
import { emailService } from '../../services/email.service';
import { useDateSelector } from '../../hooks/useDateSelector';
import BookingConflictCalendar from './BookingConflictCalendar';
import MobileCalendar from './MobileCalendar';
import AlternativeDateSuggestions from './AlternativeDateSuggestions';

export default function BookingModal({ equipment, onClose, onSuccess }) {
  const { user } = useAuth();
  const [startDateObj, setStartDateObj] = useState(null);
  const [endDateObj, setEndDateObj] = useState(null);
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [useMobileCalendar, setUseMobileCalendar] = useState(window.innerWidth <= 768);
  const [hasConflict, setHasConflict] = useState(false);
  const [checkingConflict, setCheckingConflict] = useState(false);

  // Use date selector hook with weekend auto-inclusion
  const {
    startDate,
    endDate,
    weekendIncluded,
    durationInfo,
    handleStartDateChange,
    handleEndDateChange,
    removeWeekendExtension,
    setDates,
  } = useDateSelector({ autoIncludeWeekend: true, maxDays: 14 });

  // Check for conflicts when dates change
  useEffect(() => {
    if (startDate && endDate && equipment?.id) {
      checkForConflicts();
    } else {
      setHasConflict(false);
    }
  }, [startDate, endDate, equipment?.id]);

  const checkForConflicts = async () => {
    setCheckingConflict(true);
    try {
      const conflicts = await bookingService.checkConflicts(equipment.id, startDate, endDate);
      setHasConflict(conflicts.length > 0);
    } catch (error) {
      console.error('Error checking conflicts:', error);
      setHasConflict(false);
    } finally {
      setCheckingConflict(false);
    }
  };

  // Handle alternative date selection
  const handleSelectAlternative = (newStartDate, newEndDate) => {
    setDates(newStartDate, newEndDate);
    setHasConflict(false); // Clear conflict since we're using a suggested date
  };

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

  // Handle mobile calendar date changes
  const handleMobileStartDateChange = (date) => {
    setStartDateObj(date);
    handleStartDateChange(formatDateForInput(date));
  };

  const handleMobileEndDateChange = (date) => {
    setEndDateObj(date);
    if (date) {
      handleEndDateChange(formatDateForInput(date));
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format end date display to show weekend inclusion
  const getEndDateDisplay = () => {
    if (!endDate) return '';
    if (weekendIncluded) {
      const d = new Date(endDate);
      return d.toLocaleDateString('en-IE', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    return '';
  };

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
            <div className="restriction-message">
              <h3>Cannot Create Booking</h3>
              <p>You do not have permission to create equipment bookings.</p>
              <p>Please contact your department admin to request access.</p>
            </div>
            <div className="modal-actions">
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

          {/* Cross-Department Access Notice */}
          {equipment.isCrossDepartment && (
            <div className="cross-department-notice">
              <div className="cross-department-notice-header">
                <span className="icon">🔄</span>
                <h4>Cross-Department Equipment</h4>
              </div>

              <p>
                <strong>From:</strong> {equipment.lendingDepartment}
              </p>

              <div className="collection-instructions">
                <h5>📍 Collection Instructions</h5>
                <p>{equipment.collectionInstructions}</p>
              </div>

              {equipment.crossDeptTerms && (
                <div className="terms-conditions">
                  <h5>⚠️ Terms & Conditions</h5>
                  <p>{equipment.crossDeptTerms}</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="booking-form" noValidate>
            {useMobileCalendar ? (
              <div className="form-group">
                <label>Select Dates</label>
                <MobileCalendar
                  selectedStartDate={startDateObj}
                  selectedEndDate={endDateObj}
                  onStartDateChange={handleMobileStartDateChange}
                  onEndDateChange={handleMobileEndDateChange}
                  minDate={new Date()}
                  mode="range"
                />
                {(fieldErrors.startDate || fieldErrors.endDate) && (
                  <div className="field-error" role="alert">
                    {fieldErrors.startDate || fieldErrors.endDate}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="start-date">Start Date</label>
                  <input
                    id="start-date"
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
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
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={startDate || today}
                    required
                    data-testid="end-date-input"
                    className={fieldErrors.endDate ? 'error' : ''}
                  />
                  {fieldErrors.endDate && <div className="field-error" role="alert">{fieldErrors.endDate}</div>}

                  {/* Weekend auto-inclusion notice */}
                  {weekendIncluded && (
                    <div className="weekend-notice" style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'var(--theme-info-bg, #e3f2fd)',
                      borderRadius: '6px',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}>
                      <span>
                        <strong>Weekend included:</strong> Return extended to {getEndDateDisplay()}
                      </span>
                      <button
                        type="button"
                        onClick={removeWeekendExtension}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--theme-text-secondary)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          textDecoration: 'underline',
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Duration summary */}
                {startDate && endDate && (
                  <div className="duration-summary" style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--theme-bg-secondary, #f5f5f5)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}>
                    <strong>Loan duration:</strong> {durationInfo.message}
                    {checkingConflict && (
                      <span style={{ marginLeft: '8px', color: 'var(--theme-text-secondary)' }}>
                        Checking availability...
                      </span>
                    )}
                    {durationInfo.isOverLimit && (
                      <div className="field-error" role="alert" style={{ marginTop: '4px' }}>
                        Maximum booking duration is 14 days
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Alternative date suggestions when there's a conflict */}
            <AlternativeDateSuggestions
              equipmentId={equipment.id}
              startDate={startDate}
              endDate={endDate}
              hasConflict={hasConflict}
              onSelectAlternative={handleSelectAlternative}
            />

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
