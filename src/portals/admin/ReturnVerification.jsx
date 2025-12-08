import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsAPI, equipmentAPI } from '../../utils/api';
import QRScanner from '../../components/common/QRScanner';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import './ReturnVerification.css';

/**
 * ReturnVerification - Equipment return verification workflow
 *
 * Admin scans equipment QR code or enters ID to:
 * 1. Find checked-out booking for that equipment
 * 2. Compare condition against checkout state
 * 3. Verify all accessories are returned
 * 4. Record any damage or issues
 * 5. Mark booking as returned/completed
 */
export default function ReturnVerification() {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  // State
  const [step, setStep] = useState('scan'); // 'scan' | 'verify' | 'complete'
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [checkoutVerification, setCheckoutVerification] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [accessoryChecklist, setAccessoryChecklist] = useState([]);
  const [conditionRating, setConditionRating] = useState('normal');
  const [conditionNotes, setConditionNotes] = useState('');
  const [damageReported, setDamageReported] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load accessories when equipment is found
  useEffect(() => {
    if (equipment?.id) {
      loadAccessories(equipment.id);
    }
  }, [equipment?.id]);

  // Initialize accessory checklist when accessories load
  useEffect(() => {
    if (accessories.length > 0) {
      // If we have checkout verification data, use it to pre-populate
      const checkoutChecklist = checkoutVerification?.accessory_checklist || [];

      setAccessoryChecklist(
        accessories.map(acc => {
          const checkoutItem = checkoutChecklist.find(c => c.name === acc.accessory_name);
          return {
            id: acc.id,
            name: acc.accessory_name,
            description: acc.accessory_description,
            is_required: acc.is_required,
            quantity: acc.quantity,
            present_at_checkout: checkoutItem?.present ?? true,
            present: true,
            notes: ''
          };
        })
      );
    }
  }, [accessories, checkoutVerification]);

  // Load equipment accessories
  const loadAccessories = async (equipmentId) => {
    try {
      const response = await equipmentAPI.getAccessories?.(equipmentId);
      if (response?.accessories) {
        setAccessories(response.accessories);
      } else {
        // Mock accessories for demo
        setAccessories([
          { id: 1, accessory_name: 'Battery', accessory_description: 'Main battery pack', is_required: true, quantity: 1 },
          { id: 2, accessory_name: 'Charger', accessory_description: 'AC power adapter', is_required: true, quantity: 1 },
          { id: 3, accessory_name: 'Carry Case', accessory_description: 'Protective carrying case', is_required: true, quantity: 1 },
        ]);
      }
    } catch (error) {
      console.warn('Failed to load accessories, using mock data:', error);
      setAccessories([
        { id: 1, accessory_name: 'Battery', accessory_description: 'Main battery pack', is_required: true, quantity: 1 },
        { id: 2, accessory_name: 'Charger', accessory_description: 'AC power adapter', is_required: true, quantity: 1 },
      ]);
    }
  };

  // Handle QR scan or manual entry
  const handleScan = useCallback(async (data, source) => {
    setLoading(true);
    try {
      const equipmentId = data.id || data;

      // Find checked-out booking for this equipment
      const bookingsResponse = await bookingsAPI.getAll({
        equipment_id: equipmentId,
        status: 'checked_out'
      });

      let checkedOutBookings = bookingsResponse?.bookings?.filter(
        b => (b.status === 'checked_out' || b.status === 'approved') &&
             b.equipment_id === parseInt(equipmentId)
      ) || [];

      if (checkedOutBookings.length === 0) {
        // Try to find any approved booking (maybe checkout verification wasn't done)
        const allBookingsResponse = await bookingsAPI.getAll({ equipment_id: equipmentId });
        const anyBookings = allBookingsResponse?.bookings || [];

        checkedOutBookings = anyBookings.filter(b =>
          b.status === 'approved' || b.status === 'checked_out'
        );

        if (checkedOutBookings.length === 0) {
          showToast('No active bookings found for this equipment', 'warning');
          setLoading(false);
          return;
        }
      }

      // Use the first active booking
      const selectedBooking = checkedOutBookings[0];

      // Try to load checkout verification data
      try {
        const verificationResponse = await bookingsAPI.getVerification?.(selectedBooking.id, 'checkout');
        if (verificationResponse?.verification) {
          setCheckoutVerification(verificationResponse.verification);
        }
      } catch (error) {
        // No checkout verification found, that's okay
        console.log('No checkout verification found');
      }

      setBooking(selectedBooking);
      setEquipment({
        id: selectedBooking.equipment_id,
        product_name: selectedBooking.equipment_name,
        category: selectedBooking.equipment_category,
        department: selectedBooking.equipment_department
      });

      setStep('verify');
      showToast(`Equipment found: scanned via ${source}`, 'success');
    } catch (error) {
      console.error('Scan error:', error);
      showToast('Failed to find equipment: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Handle accessory checkbox change
  const handleAccessoryChange = (accessoryId, field, value) => {
    setAccessoryChecklist(prev =>
      prev.map(acc =>
        acc.id === accessoryId
          ? { ...acc, [field]: value }
          : acc
      )
    );
  };

  // Submit return verification
  const handleSubmit = async () => {
    // Check for missing required accessories
    const missingRequired = accessoryChecklist.filter(
      acc => acc.is_required && !acc.present
    );

    if (missingRequired.length > 0) {
      const missing = missingRequired.map(a => a.name).join(', ');
      const confirm = window.confirm(
        `Warning: Required accessories missing: ${missing}\n\nThis may result in a fine. Continue with return?`
      );
      if (!confirm) return;
    }

    // Check for damage
    if (conditionRating !== 'normal' && !conditionNotes.trim()) {
      showToast('Please add notes describing the damage', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Create verification record
      const verificationData = {
        booking_id: booking.id,
        verification_type: 'return',
        verified_by: user.id,
        condition_rating: conditionRating,
        condition_notes: conditionNotes,
        accessory_checklist: accessoryChecklist.map(acc => ({
          name: acc.name,
          present: acc.present,
          notes: acc.notes,
          was_present_at_checkout: acc.present_at_checkout
        }))
      };

      // Submit verification
      if (bookingsAPI.createVerification) {
        await bookingsAPI.createVerification(verificationData);
      }

      // Determine final status based on condition
      const finalStatus = conditionRating === 'major_damage' || missingRequired.length > 0
        ? 'returned' // Needs follow-up
        : 'completed'; // All good

      // Update booking status
      if (bookingsAPI.markReturned) {
        await bookingsAPI.markReturned(booking.id, { condition: conditionRating });
      } else {
        await bookingsAPI.updateStatus?.(booking.id, finalStatus);
      }

      // If damage reported, flag for follow-up
      if (conditionRating !== 'normal' || missingRequired.length > 0) {
        setDamageReported(true);
      }

      setStep('complete');
      showToast('Return verification complete!', 'success');
    } catch (error) {
      console.error('Verification error:', error);
      showToast('Verification failed: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset for next return
  const handleReset = () => {
    setStep('scan');
    setBooking(null);
    setEquipment(null);
    setCheckoutVerification(null);
    setAccessories([]);
    setAccessoryChecklist([]);
    setConditionRating('normal');
    setConditionNotes('');
    setDamageReported(false);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if overdue
  const isOverdue = booking && new Date(booking.end_date) < new Date();

  return (
    <div className="return-verification" data-testid="return-verification">
      <div className="verification-header">
        <h2>Equipment Return</h2>
        <p className="verification-subtitle">
          Scan equipment QR code to begin return verification
        </p>
      </div>

      {/* Step Indicator */}
      <div className="verification-steps">
        <div className={`verification-step ${step === 'scan' ? 'active' : step !== 'scan' ? 'completed' : ''}`}>
          <span className="step-number">1</span>
          <span className="step-label">Scan</span>
        </div>
        <div className="step-connector" />
        <div className={`verification-step ${step === 'verify' ? 'active' : step === 'complete' ? 'completed' : ''}`}>
          <span className="step-number">2</span>
          <span className="step-label">Verify</span>
        </div>
        <div className="step-connector" />
        <div className={`verification-step ${step === 'complete' ? 'active completed' : ''}`}>
          <span className="step-number">3</span>
          <span className="step-label">Complete</span>
        </div>
      </div>

      {/* Step 1: Scan */}
      {step === 'scan' && (
        <div className="verification-content">
          <QRScanner
            onScan={handleScan}
            onError={(error) => showToast(error, 'error')}
            enableCamera={true}
            enableManualEntry={true}
            placeholder="Enter equipment ID or booking reference..."
          />

          {loading && (
            <div className="verification-loading">
              <LoadingSkeleton type="card" />
              <p>Looking up equipment...</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Verify */}
      {step === 'verify' && booking && equipment && (
        <div className="verification-content">
          {/* Overdue Warning */}
          {isOverdue && (
            <div className="overdue-warning">
              <span className="warning-icon">⚠</span>
              <span>This equipment is <strong>overdue</strong> - expected return was {formatDate(booking.end_date)}</span>
            </div>
          )}

          {/* Booking Summary */}
          <div className="verification-card">
            <h3>Booking Details</h3>
            <div className="booking-summary">
              <div className="summary-row">
                <span className="summary-label">Equipment:</span>
                <span className="summary-value">{equipment.product_name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Student:</span>
                <span className="summary-value">{booking.user_name || booking.student?.full_name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Booking Period:</span>
                <span className="summary-value">
                  {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                </span>
              </div>
              {checkoutVerification && (
                <>
                  <div className="summary-row">
                    <span className="summary-label">Checkout Date:</span>
                    <span className="summary-value">{formatDate(checkoutVerification.verified_at)}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Checkout Condition:</span>
                    <span className={`condition-badge condition-${checkoutVerification.condition_rating}`}>
                      {checkoutVerification.condition_rating?.replace('_', ' ')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Accessory Checklist */}
          <div className="verification-card">
            <h3>Returned Accessories</h3>
            <p className="checklist-hint">Check off each accessory as it is returned</p>
            {accessoryChecklist.length === 0 ? (
              <p className="empty-accessories">No accessories registered for this equipment</p>
            ) : (
              <div className="accessory-list">
                {accessoryChecklist.map(acc => (
                  <div key={acc.id} className={`accessory-item ${!acc.present ? 'missing' : ''}`}>
                    <label className="accessory-checkbox">
                      <input
                        type="checkbox"
                        checked={acc.present}
                        onChange={(e) => handleAccessoryChange(acc.id, 'present', e.target.checked)}
                      />
                      <span className="accessory-name">
                        {acc.name}
                        {acc.quantity > 1 && <span className="accessory-qty"> (x{acc.quantity})</span>}
                        {acc.is_required && <span className="required-badge">Required</span>}
                        {!acc.present_at_checkout && (
                          <span className="not-issued-badge">Not issued at checkout</span>
                        )}
                      </span>
                    </label>
                    {acc.description && (
                      <p className="accessory-description">{acc.description}</p>
                    )}
                    {!acc.present && (
                      <input
                        type="text"
                        className="accessory-note-input"
                        placeholder="Note about missing item (will be recorded)..."
                        value={acc.notes}
                        onChange={(e) => handleAccessoryChange(acc.id, 'notes', e.target.value)}
                        required={acc.is_required}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Condition Assessment */}
          <div className="verification-card">
            <h3>Return Condition Assessment</h3>
            {checkoutVerification?.condition_rating && (
              <p className="condition-comparison">
                Condition at checkout: <strong>{checkoutVerification.condition_rating.replace('_', ' ')}</strong>
              </p>
            )}
            <div className="condition-rating">
              <label className="condition-option">
                <input
                  type="radio"
                  name="condition"
                  value="normal"
                  checked={conditionRating === 'normal'}
                  onChange={(e) => setConditionRating(e.target.value)}
                />
                <span className="condition-label condition-normal">
                  <span className="condition-icon">✓</span>
                  Normal
                </span>
                <span className="condition-desc">Equipment returned in same condition</span>
              </label>
              <label className="condition-option">
                <input
                  type="radio"
                  name="condition"
                  value="minor_damage"
                  checked={conditionRating === 'minor_damage'}
                  onChange={(e) => setConditionRating(e.target.value)}
                />
                <span className="condition-label condition-minor">
                  <span className="condition-icon">!</span>
                  Minor Damage
                </span>
                <span className="condition-desc">New cosmetic damage noticed</span>
              </label>
              <label className="condition-option">
                <input
                  type="radio"
                  name="condition"
                  value="major_damage"
                  checked={conditionRating === 'major_damage'}
                  onChange={(e) => setConditionRating(e.target.value)}
                />
                <span className="condition-label condition-major">
                  <span className="condition-icon">⚠</span>
                  Major Damage
                </span>
                <span className="condition-desc">New damage affecting functionality</span>
              </label>
            </div>

            <div className="condition-notes">
              <label htmlFor="condition-notes">
                Return Notes
                {conditionRating !== 'normal' && <span className="required-indicator">*</span>}
              </label>
              <textarea
                id="condition-notes"
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="Document any damage, missing items, or issues discovered during return inspection..."
                rows={4}
                required={conditionRating !== 'normal'}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="verification-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Complete Return'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 'complete' && (
        <div className="verification-content">
          <div className={`verification-success ${damageReported ? 'with-warning' : ''}`}>
            <div className={`success-icon ${damageReported ? 'warning' : ''}`}>
              {damageReported ? '!' : '✓'}
            </div>
            <h3>{damageReported ? 'Return Recorded with Issues' : 'Return Complete!'}</h3>
            <p>
              Equipment <strong>{equipment?.product_name}</strong> has been returned by{' '}
              <strong>{booking?.user_name || booking?.student?.full_name}</strong>
            </p>

            {damageReported && (
              <div className="follow-up-notice">
                <p><strong>Follow-up Required:</strong></p>
                <ul>
                  {conditionRating !== 'normal' && <li>Damage reported - review notes</li>}
                  {accessoryChecklist.some(a => !a.present && a.is_required) && (
                    <li>Missing accessories - may require fine assessment</li>
                  )}
                  {isOverdue && <li>Late return - check fine policy</li>}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleReset}
            >
              Process Another Return
            </button>
          </div>
        </div>
      )}

      {/* Toast notifications */}
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
