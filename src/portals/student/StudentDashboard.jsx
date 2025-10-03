import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { demoMode } from '../../mocks/demo-mode';
import { kitStorage } from '../../utils/kitStorage';
import MultiItemBookingModal from '../../components/booking/MultiItemBookingModal';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [savedKits, setSavedKits] = useState([]);
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [showMultiModal, setShowMultiModal] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Load user bookings
      const userBookings = await demoMode.query('bookings', { user_id: user.id });
      setBookings(userBookings);

      // Load saved kits
      const kits = kitStorage.getAllKitsForUser(user.id, user.department);
      setSavedKits(kits);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const activeBookings = bookings.filter(b => b.status === 'approved').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalBookings = bookings.length;

  const handleMultiBookingSuccess = () => {
    showToast('Booking created successfully!', 'success');
    setShowMultiModal(false);
    loadDashboardData();
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.first_name}!</h2>
      <p>Your equipment booking dashboard</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Stats</h3>
            <button
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              {showDetailedStats ? 'Quick' : 'Detailed'}
            </button>
          </div>

          {showDetailedStats ? (
            <>
              <p><strong>Total Bookings:</strong> {totalBookings}</p>
              <p><strong>Active Bookings:</strong> {activeBookings}</p>
              <p><strong>Pending Approvals:</strong> {pendingBookings}</p>
              <p><strong>Denied:</strong> {bookings.filter(b => b.status === 'denied').length}</p>
              <p><strong>Completed:</strong> {bookings.filter(b => b.status === 'completed').length}</p>
            </>
          ) : (
            <>
              <p>Active Bookings: {activeBookings}</p>
              <p>Pending Approvals: {pendingBookings}</p>
            </>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          {bookings.length === 0 ? (
            <p>No recent activity</p>
          ) : (
            <div style={{ fontSize: '0.875rem' }}>
              {bookings.slice(0, 3).map(booking => (
                <div key={booking.id} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '600' }}>{booking.equipment_name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {new Date(booking.start_date).toLocaleDateString()} -
                    <span className={`status-badge status-${booking.status === 'approved' ? 'success' : booking.status === 'pending' ? 'warning' : 'error'}`} style={{ marginLeft: '0.5rem' }}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Saved Equipment Kits ({savedKits.length})</h3>
          {savedKits.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              No saved kits yet. Create custom kits when booking equipment!
            </p>
          ) : (
            <div style={{ fontSize: '0.875rem', maxHeight: '200px', overflowY: 'auto' }}>
              {savedKits.map(kit => (
                <div
                  key={kit.id}
                  style={{
                    marginBottom: '0.75rem',
                    padding: '0.75rem',
                    background: kit.type === 'admin' ? 'var(--color-tertiary-light)' : 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    border: `1px solid ${kit.type === 'admin' ? 'var(--color-tertiary)' : 'var(--border-color)'}`
                  }}
                  onClick={() => {
                    showToast(`Booking kit: ${kit.name}`, 'info');
                    setShowMultiModal(true);
                  }}
                >
                  <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {kit.name}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {kit.equipment_ids?.length || 0} items
                    {kit.type === 'admin' && ' • Admin Kit'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setShowMultiModal(true)}
              className="btn btn-primary btn-block"
              data-testid="quick-book-multiple"
            >
              Book Multiple Items
            </button>
            <button
              onClick={() => navigate('/student/equipment')}
              className="btn btn-secondary btn-block"
            >
              Browse Equipment
            </button>
          </div>
        </div>
      </div>

      {showMultiModal && (
        <MultiItemBookingModal
          onClose={() => setShowMultiModal(false)}
          onSuccess={handleMultiBookingSuccess}
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
