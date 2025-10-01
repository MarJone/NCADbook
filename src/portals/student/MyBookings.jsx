import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../services/booking.service';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookingsWithEquipment(user.id);
      setBookings(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      alert('Failed to cancel booking: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      denied: 'error',
      cancelled: 'secondary',
      active: 'primary',
      completed: 'success'
    };
    return colors[status] || 'secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Bookings Yet</h2>
        <p>You haven't made any equipment bookings.</p>
        <a href="/student/equipment" className="btn btn-primary">Browse Equipment</a>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <h2>My Bookings</h2>
      <p className="subtitle">{bookings.length} total booking(s)</p>

      <div className="bookings-list">
        {bookings.map(booking => (
          <div key={booking.id} className="booking-item">
            <div className="booking-header">
              <div>
                <h3>{booking.equipment?.product_name || 'Unknown Equipment'}</h3>
                <p className="category">{booking.equipment?.category}</p>
              </div>
              <span className={`status-badge status-${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>

            <div className="booking-details">
              <div className="detail-row">
                <span className="label">Dates:</span>
                <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
              </div>
              
              {booking.purpose && (
                <div className="detail-row">
                  <span className="label">Purpose:</span>
                  <span>{booking.purpose}</span>
                </div>
              )}

              {booking.denial_reason && (
                <div className="detail-row error">
                  <span className="label">Denial Reason:</span>
                  <span>{booking.denial_reason}</span>
                </div>
              )}

              <div className="detail-row">
                <span className="label">Created:</span>
                <span>{formatDate(booking.created_at)}</span>
              </div>
            </div>

            {booking.status === 'pending' && (
              <div className="booking-actions">
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel Booking
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
