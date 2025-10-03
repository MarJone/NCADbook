import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../services/booking.service';
import { exportService } from '../../services/export.service';
import Toast from '../../components/common/Toast';
import BookingModal from '../../components/booking/BookingModal';
import { useToast } from '../../hooks/useToast';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const { toasts, showToast, removeToast } = useToast();

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
    try {
      await bookingService.cancelBooking(bookingId);
      await loadBookings();
      showToast('Booking cancelled successfully', 'success');
    } catch (error) {
      showToast('Failed to cancel booking: ' + error.message, 'error');
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

  const handleRebook = (booking) => {
    setSelectedEquipment(booking.equipment);
    setShowRebookModal(true);
  };

  const handleRebookSuccess = () => {
    showToast('Booking created successfully! Awaiting admin approval.', 'success');
    setShowRebookModal(false);
    setSelectedEquipment(null);
    loadBookings();
  };

  const handleExportCSV = () => {
    exportService.exportBookingsToCSV(bookings, `my_bookings_${new Date().toISOString().split('T')[0]}`);
    showToast('Bookings exported to CSV', 'success');
  };

  const handleExportPDF = () => {
    exportService.exportBookingsToPDF(bookings, 'My Bookings Report');
    showToast('Opening PDF export...', 'success');
  };

  if (loading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  if (bookings.length === 0) {
    return (
      <div className="empty-state" data-testid="no-bookings">
        <h2>No Bookings Yet</h2>
        <p>You haven't made any equipment bookings.</p>
        <Link to={`/${user.role}/equipment`} className="btn btn-primary">Browse Equipment</Link>
      </div>
    );
  }

  return (
    <div className="my-bookings">
      <div className="bookings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>My Bookings</h2>
          <p className="subtitle">{bookings.length} total booking(s)</p>
        </div>
        <div className="export-actions">
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" data-testid="export-csv-btn">
            Export CSV
          </button>
          <button onClick={handleExportPDF} className="btn btn-secondary btn-sm" data-testid="export-pdf-btn">
            Export PDF
          </button>
        </div>
      </div>

      <div className="bookings-list" data-testid="bookings-list">
        {bookings.map(booking => (
          <div key={booking.id} className="booking-item booking-card" data-testid="booking-card">
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

            <div className="booking-actions">
              {booking.status === 'pending' && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="btn btn-secondary btn-sm"
                  data-testid="cancel-booking-btn"
                >
                  Cancel Booking
                </button>
              )}
              {(booking.status === 'completed' || booking.status === 'denied') && booking.equipment && (
                <button
                  onClick={() => handleRebook(booking)}
                  className="btn btn-primary btn-sm"
                  data-testid="rebook-btn"
                >
                  Book Again
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showRebookModal && selectedEquipment && (
        <BookingModal
          equipment={selectedEquipment}
          onClose={() => {
            setShowRebookModal(false);
            setSelectedEquipment(null);
          }}
          onSuccess={handleRebookSuccess}
        />
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
