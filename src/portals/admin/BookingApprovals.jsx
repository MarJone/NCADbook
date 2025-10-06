import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import { emailService } from '../../services/email.service';
import Toast from '../../components/common/Toast';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import BulkActionBar from '../../components/common/BulkActionBar';
import SwipeActionCard from '../../components/booking/SwipeActionCard';
import PullToRefresh from '../../components/common/PullToRefresh';
import { useToast } from '../../hooks/useToast';

export default function BookingApprovals() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadBookings();
  }, [filter]);

  useEffect(() => {
    // Apply search filter to bookings
    let filtered = bookings;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.equipment?.product_name.toLowerCase().includes(query) ||
        booking.student?.full_name.toLowerCase().includes(query) ||
        booking.student?.email.toLowerCase().includes(query) ||
        booking.purpose?.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [bookings, searchQuery]);

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

      // Filter by department for department admins
      let departmentFiltered = bookingsWithDetails;
      if (user && user.role === 'department_admin') {
        // Department admins see only bookings for their department's equipment
        departmentFiltered = bookingsWithDetails.filter(booking =>
          booking.equipment && booking.equipment.department === user.department
        );
      }
      // Master admins see all bookings (no additional filtering)

      const filtered = filter === 'all'
        ? departmentFiltered
        : departmentFiltered.filter(b => b.status === filter);

      setBookings(filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      const booking = bookings.find(b => b.id === bookingId);

      await demoMode.update('bookings', { id: bookingId }, {
        status: 'approved',
        approved_by: user.id,
        approved_at: new Date().toISOString()
      });

      // Send approval notification email
      try {
        const equipmentItems = [booking.equipment];
        const emailResult = await emailService.sendBookingApproved(booking, booking.student, equipmentItems, user);
        if (!emailResult.success && emailService.isConfigured()) {
          console.warn('Email notification failed:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }

      await loadBookings();
      showToast('Booking approved successfully', 'success');
    } catch (error) {
      showToast('Failed to approve booking: ' + error.message, 'error');
    }
  };

  const handleSwipeDeny = (booking) => {
    setSelectedBooking(booking);
    setShowDenyModal(true);
  };

  const handleDeny = async () => {
    if (!denyReason.trim()) {
      showToast('Please provide a reason for denial', 'error');
      return;
    }

    try {
      await demoMode.update('bookings', { id: selectedBooking.id }, {
        status: 'denied',
        denied_by: user.id,
        denied_at: new Date().toISOString(),
        denial_reason: denyReason
      });

      // Send denial notification email
      try {
        const equipmentItems = [selectedBooking.equipment];
        const emailResult = await emailService.sendBookingDenied(
          selectedBooking,
          selectedBooking.student,
          equipmentItems,
          user,
          denyReason
        );
        if (!emailResult.success && emailService.isConfigured()) {
          console.warn('Email notification failed:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Failed to send denial email:', emailError);
      }

      setShowDenyModal(false);
      setDenyReason('');
      setSelectedBooking(null);
      await loadBookings();
      showToast('Booking denied', 'success');
    } catch (error) {
      showToast('Failed to deny booking: ' + error.message, 'error');
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

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = async () => {
    await loadBookings();
  };

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookings.length === paginatedBookings.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(paginatedBookings.map(b => b.id));
    }
  };

  const handleBulkApprove = async () => {
    setBulkProcessing(true);
    try {
      const promises = selectedBookings.map(async (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);

        await demoMode.update('bookings', { id: bookingId }, {
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        });

        // Send approval notification email
        try {
          const equipmentItems = [booking.equipment];
          await emailService.sendBookingApproved(booking, booking.student, equipmentItems, user);
        } catch (emailError) {
          console.error('Failed to send approval email:', emailError);
        }
      });

      await Promise.all(promises);
      await loadBookings();
      setSelectedBookings([]);
      showToast(`Successfully approved ${promises.length} booking(s)`, 'success');
    } catch (error) {
      showToast('Failed to approve bookings: ' + error.message, 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDeny = () => {
    if (selectedBookings.length === 0) return;
    setSelectedBooking(null); // Clear single booking when doing bulk operation
    setShowDenyModal(true);
  };

  const handleBulkDenyConfirm = async () => {
    if (!denyReason.trim()) {
      showToast('Please provide a reason for denial', 'error');
      return;
    }

    setBulkProcessing(true);
    try {
      const promises = selectedBookings.map(async (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId);

        await demoMode.update('bookings', { id: bookingId }, {
          status: 'denied',
          denied_by: user.id,
          denied_at: new Date().toISOString(),
          denial_reason: denyReason
        });

        // Send denial notification email
        try {
          const equipmentItems = [booking.equipment];
          await emailService.sendBookingDenied(
            booking,
            booking.student,
            equipmentItems,
            user,
            denyReason
          );
        } catch (emailError) {
          console.error('Failed to send denial email:', emailError);
        }
      });

      await Promise.all(promises);
      await loadBookings();
      setSelectedBookings([]);
      setShowDenyModal(false);
      setDenyReason('');
      showToast(`Successfully denied ${promises.length} booking(s)`, 'success');
    } catch (error) {
      showToast('Failed to deny bookings: ' + error.message, 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Paginate filtered bookings
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  return (
    <div className="booking-approvals" data-testid="booking-approvals">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="approvals-header">
          <h2>Booking Approvals</h2>
          <div className="filter-controls">
            {['pending', 'approved', 'denied', 'cancelled', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={filter === status ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                data-testid={`filter-${status}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by equipment, student name, or purpose..."
          ariaLabel="Search bookings"
        />

      {filter === 'pending' && paginatedBookings.length > 0 && (
        <BulkActionBar
          selectedCount={selectedBookings.length}
          onApproveAll={handleBulkApprove}
          onDenyAll={handleBulkDeny}
          onClearSelection={() => setSelectedBookings([])}
          loading={bulkProcessing}
        />
      )}

      {loading ? (
        <div className="approvals-list">
          <LoadingSkeleton type="list-item" count={8} />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          <p>No {filter !== 'all' ? filter : ''} bookings found{searchQuery ? ' matching your search' : ''}</p>
        </div>
      ) : (
        <>
          {filter === 'pending' && paginatedBookings.length > 0 && (
            <div className="select-all-container" style={{ marginBottom: '1rem' }}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedBookings.length === paginatedBookings.length && paginatedBookings.length > 0}
                  onChange={handleSelectAll}
                  data-testid="select-all-checkbox"
                />
                <span style={{ marginLeft: '0.5rem' }}>Select All on Page</span>
              </label>
            </div>
          )}
          <div className="approvals-list" data-testid="bookings-list">
            {paginatedBookings.map(booking => (
            <SwipeActionCard
              key={booking.id}
              booking={booking}
              onApprove={handleApprove}
              onDeny={handleSwipeDeny}
              onSelectToggle={handleSelectBooking}
              isSelected={selectedBookings.includes(booking.id)}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            >
              {booking.status === 'pending' && (
                <div className="approval-actions">
                  <button
                    onClick={() => handleApprove(booking.id)}
                    className="btn btn-primary btn-sm"
                    data-testid="approve-btn"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDenyModal(true);
                    }}
                    className="btn btn-secondary btn-sm"
                    data-testid="deny-btn"
                  >
                    Deny
                  </button>
                </div>
              )}
            </SwipeActionCard>
          ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalItems={filteredBookings.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </>
      )}
      </PullToRefresh>

      {showDenyModal && (
        <div className="modal-overlay" onClick={() => setShowDenyModal(false)} data-testid="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="deny-modal">
            <div className="modal-header">
              <h2>Deny Booking{selectedBookings.length > 0 ? 's' : ''}</h2>
              <button className="modal-close" onClick={() => setShowDenyModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {selectedBookings.length > 0 ? (
                <p>Deny <strong>{selectedBookings.length}</strong> selected booking(s)?</p>
              ) : selectedBooking ? (
                <p>Deny booking for <strong>{selectedBooking.equipment?.product_name}</strong>?</p>
              ) : null}
              <div className="form-group">
                <label htmlFor="deny-reason">Reason for Denial (required)</label>
                <textarea
                  id="deny-reason"
                  value={denyReason}
                  onChange={(e) => setDenyReason(e.target.value)}
                  placeholder="Explain why this booking is being denied..."
                  rows="4"
                  required
                  data-testid="deny-reason-input"
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowDenyModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={selectedBookings.length > 0 ? handleBulkDenyConfirm : handleDeny}
                  className="btn btn-primary"
                  data-testid="confirm-deny-btn"
                  disabled={bulkProcessing}
                >
                  {bulkProcessing ? 'Processing...' : 'Deny Booking'}
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
