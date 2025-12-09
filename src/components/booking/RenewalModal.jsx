import { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';

/**
 * RenewalModal Component
 * Allows users to request an extension for their booking
 *
 * @param {Object} props
 * @param {Object} props.booking - The booking to extend
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onSuccess - Success callback with updated booking
 */
export default function RenewalModal({ booking, onClose, onSuccess }) {
  const [newEndDate, setNewEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [maxDateInfo, setMaxDateInfo] = useState(null);
  const [loadingMaxDate, setLoadingMaxDate] = useState(true);

  // Get max extension date on mount
  useEffect(() => {
    fetchMaxDate();
  }, [booking?.id]);

  const fetchMaxDate = async () => {
    if (!booking?.id) return;

    setLoadingMaxDate(true);
    try {
      const info = await bookingService.getMaxExtensionDate(booking.id);
      setMaxDateInfo(info);

      // Pre-set the date to current end + 1 day
      if (info.maxDate) {
        const defaultExtension = new Date(booking.end_date);
        defaultExtension.setDate(defaultExtension.getDate() + 3); // Default to 3 days extension

        // Don't exceed max date
        const maxDate = new Date(info.maxDate);
        if (defaultExtension > maxDate) {
          setNewEndDate(info.maxDate);
        } else {
          setNewEndDate(defaultExtension.toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching max date:', err);
    } finally {
      setLoadingMaxDate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updatedBooking = await bookingService.requestExtension(
        booking.id,
        newEndDate,
        reason
      );

      onSuccess?.(updatedBooking);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to request extension');
    } finally {
      setLoading(false);
    }
  };

  // Calculate extension duration
  const getExtensionDays = () => {
    if (!newEndDate || !booking?.end_date) return 0;
    const currentEnd = new Date(booking.end_date);
    const newEnd = new Date(newEndDate);
    return Math.ceil((newEnd - currentEnd) / (1000 * 60 * 60 * 24));
  };

  const extensionDays = getExtensionDays();
  const minDate = new Date(booking?.end_date || new Date());
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
      >
        <div className="modal-header">
          <h2>Extend Booking</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Booking Summary */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--theme-bg-secondary, #f5f5f5)',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              {booking?.equipment?.product_name || 'Equipment'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--theme-text-secondary)' }}>
              Current return date:{' '}
              <strong>
                {new Date(booking?.end_date).toLocaleDateString('en-IE', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </strong>
            </div>
          </div>

          {loadingMaxDate ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div className="loading-spinner" style={{ width: '32px', height: '32px', margin: '0 auto' }}></div>
              <p style={{ marginTop: '8px', color: 'var(--theme-text-secondary)' }}>
                Checking availability...
              </p>
            </div>
          ) : maxDateInfo?.maxDate ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="new-end-date">New Return Date</label>
                <input
                  id="new-end-date"
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  min={minDateStr}
                  max={maxDateInfo.maxDate}
                  required
                  style={{ width: '100%' }}
                />
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--theme-text-secondary)',
                    marginTop: '4px',
                  }}
                >
                  {maxDateInfo.reason}
                </div>
              </div>

              {/* Extension summary */}
              {extensionDays > 0 && (
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--theme-info-bg, #e3f2fd)',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}
                >
                  <strong>Extension:</strong> +{extensionDays} day{extensionDays !== 1 ? 's' : ''}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="reason">Reason for Extension (Optional)</label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why do you need more time with this equipment?"
                  rows="3"
                  style={{ width: '100%' }}
                />
              </div>

              {error && (
                <div
                  className="error-message"
                  role="alert"
                  style={{ marginBottom: '16px' }}
                >
                  {error}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || extensionDays <= 0}
                >
                  {loading ? 'Requesting...' : 'Request Extension'}
                </button>
              </div>
            </form>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: 'var(--theme-text-secondary)',
              }}
            >
              <p style={{ marginBottom: '16px' }}>
                {maxDateInfo?.reason || 'Unable to extend this booking at this time.'}
              </p>
              <button onClick={onClose} className="btn btn-secondary">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
