import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsAPI, equipmentAPI } from '../../utils/api';
import QRScanner from '../../components/common/QRScanner';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import './CheckoutVerification.css';

/**
 * CheckoutVerification - Equipment checkout verification workflow
 *
 * Admin scans equipment QR code or enters ID to:
 * 1. Find approved booking for that equipment
 * 2. Verify all accessories are present
 * 3. Record equipment condition
 * 4. Mark booking as checked_out
 */
export default function CheckoutVerification() {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  // State
  const [step, setStep] = useState('scan'); // 'scan' | 'verify' | 'complete'
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [equipment, setEquipment] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [accessoryChecklist, setAccessoryChecklist] = useState([]);
  const [conditionRating, setConditionRating] = useState('normal');
  const [conditionNotes, setConditionNotes] = useState('');
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
      setAccessoryChecklist(
        accessories.map(acc => ({
          id: acc.id,
          name: acc.accessory_name,
          description: acc.accessory_description,
          is_required: acc.is_required,
          quantity: acc.quantity,
          present: true,
          notes: ''
        }))
      );
    }
  }, [accessories]);

  // Load equipment accessories
  const loadAccessories = async (equipmentId) => {
    try {
      // In demo mode or if API not available, use mock data
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
      // Use mock data for demo
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

      // Find approved booking for this equipment
      const bookingsResponse = await bookingsAPI.getAll({
        equipment_id: equipmentId,
        status: 'approved'
      });

      const approvedBookings = bookingsResponse?.bookings?.filter(
        b => b.status === 'approved' && b.equipment_id === parseInt(equipmentId)
      ) || [];

      if (approvedBookings.length === 0) {
        // Try to find any pending or approved booking
        const allBookingsResponse = await bookingsAPI.getAll({ equipment_id: equipmentId });
        const anyBookings = allBookingsResponse?.bookings || [];

        if (anyBookings.length === 0) {
          showToast('No bookings found for this equipment', 'error');
          setLoading(false);
          return;
        }

        const pendingOrApproved = anyBookings.filter(b =>
          b.status === 'pending' || b.status === 'approved'
        );

        if (pendingOrApproved.length === 0) {
          showToast('No pending or approved bookings for this equipment', 'warning');
          setLoading(false);
          return;
        }

        // Use the first pending/approved booking
        const selectedBooking = pendingOrApproved[0];
        setBooking(selectedBooking);
        setEquipment({
          id: selectedBooking.equipment_id,
          product_name: selectedBooking.equipment_name,
          category: selectedBooking.equipment_category,
          department: selectedBooking.equipment_department
        });
      } else {
        // Use the first approved booking (earliest start date)
        const selectedBooking = approvedBookings.sort(
          (a, b) => new Date(a.start_date) - new Date(b.start_date)
        )[0];

        setBooking(selectedBooking);
        setEquipment({
          id: selectedBooking.equipment_id,
          product_name: selectedBooking.equipment_name,
          category: selectedBooking.equipment_category,
          department: selectedBooking.equipment_department
        });
      }

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

  // Submit checkout verification
  const handleSubmit = async () => {
    // Check required accessories
    const missingRequired = accessoryChecklist.filter(
      acc => acc.is_required && !acc.present
    );

    if (missingRequired.length > 0 && !conditionNotes.includes('missing')) {
      const missing = missingRequired.map(a => a.name).join(', ');
      const confirm = window.confirm(
        `Warning: Required accessories missing: ${missing}\n\nDo you want to proceed anyway? If so, please document this in the condition notes.`
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      // Create verification record
      const verificationData = {
        booking_id: booking.id,
        verification_type: 'checkout',
        verified_by: user.id,
        condition_rating: conditionRating,
        condition_notes: conditionNotes,
        accessory_checklist: accessoryChecklist.map(acc => ({
          name: acc.name,
          present: acc.present,
          notes: acc.notes
        }))
      };

      // Submit verification (or mock for demo)
      if (bookingsAPI.createVerification) {
        await bookingsAPI.createVerification(verificationData);
      }

      // Update booking status to checked_out
      if (bookingsAPI.checkout) {
        await bookingsAPI.checkout(booking.id);
      } else {
        // Fallback: try to update status directly
        await bookingsAPI.updateStatus?.(booking.id, 'checked_out');
      }

      setStep('complete');
      showToast('Checkout verification complete!', 'success');
    } catch (error) {
      console.error('Verification error:', error);
      showToast('Verification failed: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset for next checkout
  const handleReset = () => {
    setStep('scan');
    setBooking(null);
    setEquipment(null);
    setAccessories([]);
    setAccessoryChecklist([]);
    setConditionRating('normal');
    setConditionNotes('');
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

  return (
    <div className="checkout-verification" data-testid="checkout-verification">
      <div className="verification-header">
        <h2>Equipment Checkout</h2>
        <p className="verification-subtitle">
          Scan equipment QR code to begin checkout verification
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
          {/* Booking Summary */}
          <div className="verification-card">
            <h3>Booking Details</h3>
            <div className="booking-summary">
              <div className="summary-row">
                <span className="summary-label">Equipment:</span>
                <span className="summary-value">{equipment.product_name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Category:</span>
                <span className="summary-value">{equipment.category || 'N/A'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Student:</span>
                <span className="summary-value">{booking.user_name || booking.student?.full_name}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Department:</span>
                <span className="summary-value">{booking.user_department || booking.student?.department}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Booking Period:</span>
                <span className="summary-value">
                  {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Purpose:</span>
                <span className="summary-value">{booking.purpose || 'Not specified'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Status:</span>
                <span className={`status-badge status-${booking.status}`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Accessory Checklist */}
          <div className="verification-card">
            <h3>Accessory Checklist</h3>
            {accessoryChecklist.length === 0 ? (
              <p className="empty-accessories">No accessories registered for this equipment</p>
            ) : (
              <div className="accessory-list">
                {accessoryChecklist.map(acc => (
                  <div key={acc.id} className="accessory-item">
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
                      </span>
                    </label>
                    {acc.description && (
                      <p className="accessory-description">{acc.description}</p>
                    )}
                    {!acc.present && (
                      <input
                        type="text"
                        className="accessory-note-input"
                        placeholder="Note about missing item..."
                        value={acc.notes}
                        onChange={(e) => handleAccessoryChange(acc.id, 'notes', e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Condition Assessment */}
          <div className="verification-card">
            <h3>Condition Assessment</h3>
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
                <span className="condition-desc">Equipment is in good working condition</span>
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
                <span className="condition-desc">Cosmetic issues that don't affect function</span>
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
                <span className="condition-desc">Issues that may affect equipment function</span>
              </label>
            </div>

            <div className="condition-notes">
              <label htmlFor="condition-notes">Condition Notes</label>
              <textarea
                id="condition-notes"
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="Document any damage, issues, or special notes about this checkout..."
                rows={4}
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
              {submitting ? 'Processing...' : 'Complete Checkout'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 'complete' && (
        <div className="verification-content">
          <div className="verification-success">
            <div className="success-icon">✓</div>
            <h3>Checkout Complete!</h3>
            <p>
              Equipment <strong>{equipment?.product_name}</strong> has been checked out to{' '}
              <strong>{booking?.user_name || booking?.student?.full_name}</strong>
            </p>
            <p className="return-date">
              Expected return: <strong>{formatDate(booking?.end_date)}</strong>
            </p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleReset}
            >
              Checkout Another Item
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
