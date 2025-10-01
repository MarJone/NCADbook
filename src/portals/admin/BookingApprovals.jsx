import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';

export default function BookingApprovals() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyReason, setDenyReason] = useState('');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const allBookings = await demoMode.query('bookings');
      const bookingsWithDetails = await Promise.all(
        allBookings.map(async (booking) => {
          const equipment = await demoMode.findOne('equipment', { id: booking.equipment_id });
          const student = await demoMode.findOne('users', { id: booking.user_id });
          return { ...booking, equipment, student };
        })
      );

      const filtered = filter === 'all'
        ? bookingsWithDetails
        : bookingsWithDetails.filter(b => b.status === filter);

      setBookings(filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    if (!confirm('Approve this booking?')) return;

    try {
      await demoMode.update('bookings', { id: bookingId }, {
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      });

      await loadBookings();
      alert('Booking approved successfully');
    } catch (error) {
      alert('Failed to approve booking: ' + error.message);
    }
  };

  const handleDeny = async () => {
    if (!denyReason.trim()) {
      alert('Please provide a reason for denial');
      return;
    }

    try {
      await demoMode.update('bookings', { id: selectedBooking.id }, {
        status: 'denied',
        denied_by: user.id,
        denied_at: new Date().toISOString(),
        denial_reason: denyReason
      });

      setShowDenyModal(false);
      setDenyReason('');
      setSelectedBooking(null);
      await loadBookings();
      alert('Booking denied');
    } catch (error) {
      alert('Failed to deny booking: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      denied: 'error',
      cancelled: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="booking-approvals">
      <div className="approvals-header">
        <h2>Booking Approvals</h2>
        <div className="filter-controls">
          {['pending', 'approved', 'denied', 'cancelled', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={filter === status ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} bookings found</p>
        </div>
      ) : (
        <div className="approvals-list">
          {bookings.map(booking => (
            <div key={booking.id} className="approval-item">
              <div className="approval-header">
                <div>
                  <h3>{booking.equipment?.product_name || 'Unknown Equipment'}</h3>
                  <p className="student-name">
                    Requested by: {booking.student?.full_name || 'Unknown'}
                    ({booking.student?.department})
                  </p>
                </div>
                <span className={'status-badge status-' + getStatusColor(booking.status)}>
                  {booking.status}
                </span>
              </div>

              <div className="approval-details">
                <div className="detail-row">
                  <span className="label">Equipment:</span>
                  <span>{booking.equipment?.category} - {booking.equipment?.tracking_number}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Dates:</span>
                  <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Purpose:</span>
                  <span>{booking.purpose || 'Not provided'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Requested:</span>
                  <span>{formatDate(booking.created_at)}</span>
                </div>
                {booking.denial_reason && (
                  <div className="detail-row error">
                    <span className="label">Denial Reason:</span>
                    <span>{booking.denial_reason}</span>
                  </div>
                )}
              </div>

              {booking.status === 'pending' && (
                <div className="approval-actions">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDenyModal(true);
                    }}
                    className="btn btn-secondary btn-sm"
                  >
                    Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDenyModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDenyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Deny Booking</h2>
              <button className="modal-close" onClick={() => setShowDenyModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Deny booking for <strong>{selectedBooking.equipment?.product_name}</strong>?</p>
              <div className="form-group">
                <label htmlFor="deny-reason">Reason for Denial (required)</label>
                <textarea
                  id="deny-reason"
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  placeholder="Explain why this booking is being denied..."
                  rows="4"
                  required
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowDenyModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleDeny} className="btn btn-primary">
                  Deny Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
