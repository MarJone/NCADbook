import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
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
      // Load user bookings from backend API
      const response = await bookingsAPI.getAll({ user_id: user.id });
      setBookings(response.bookings || []);

      // Load saved kits
      const kits = kitStorage.getAllKitsForUser(user.id, user.department);
      setSavedKits(kits);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setBookings([]); // Fallback to empty array on error
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
    <div className="student-dashboard">
      <div className="student-welcome">
        <h2>Welcome, {user?.first_name}! 👋</h2>
        <p>Your equipment booking dashboard</p>
      </div>

      <div className="student-dashboard-grid">
        {/* Stats Card */}
        <div className="student-card student-stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <h3><span className="student-card-icon">📊</span> Your Stats</h3>
            <button
              onClick={() => setShowDetailedStats(!showDetailedStats)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
            >
              {showDetailedStats ? 'Simple' : 'Detailed'}
            </button>
          </div>

          {showDetailedStats ? (
            <div className="student-stat-grid">
              <div className="student-stat-item">
                <strong>{totalBookings}</strong>
                <span>Total</span>
              </div>
              <div className="student-stat-item">
                <strong>{activeBookings}</strong>
                <span>Active</span>
              </div>
              <div className="student-stat-item">
                <strong>{pendingBookings}</strong>
                <span>Pending</span>
              </div>
              <div className="student-stat-item">
                <strong>{bookings.filter(b => b.status === 'completed').length}</strong>
                <span>Completed</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="student-stat-number">{activeBookings}</div>
              <div className="student-stat-label">Active Bookings</div>
              {pendingBookings > 0 && (
                <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-2)', background: 'var(--theme-warning-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--theme-warning-text)', fontWeight: 'var(--font-semibold)' }}>
                    ⏱ {pendingBookings} pending approval
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity Card */}
        <div className="student-card">
          <h3><span className="student-card-icon">📋</span> Recent Activity</h3>
          {bookings.length === 0 ? (
            <div className="student-empty-state">
              <div className="student-empty-state-icon">📦</div>
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="student-activity-list">
              {bookings.slice(0, 3).map(booking => (
                <div key={booking.id} className="student-activity-item">
                  <div className="student-activity-title">{booking.equipment_name}</div>
                  <div className="student-activity-meta">
                    <span>{new Date(booking.start_date).toLocaleDateString()}</span>
                    <span className={`student-status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Kits Card */}
        <div className="student-card">
          <h3><span className="student-card-icon">🎒</span> Saved Kits ({savedKits.length})</h3>
          {savedKits.length === 0 ? (
            <div className="student-empty-state">
              <div className="student-empty-state-icon">🎒</div>
              <p>No saved kits yet. Create custom kits when booking equipment!</p>
            </div>
          ) : (
            <div className="student-kit-list">
              {savedKits.map(kit => (
                <div
                  key={kit.id}
                  className={`student-kit-item ${kit.type === 'admin' ? 'admin-kit' : ''}`}
                  onClick={() => {
                    showToast(`Booking kit: ${kit.name}`, 'info');
                    setShowMultiModal(true);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      showToast(`Booking kit: ${kit.name}`, 'info');
                      setShowMultiModal(true);
                    }
                  }}
                >
                  <div className="student-kit-name">
                    {kit.type === 'admin' ? '⭐' : '📦'} {kit.name}
                  </div>
                  <div className="student-kit-meta">
                    {kit.equipment_ids?.length || 0} items
                    {kit.type === 'admin' && ' • Admin Kit'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="student-card">
          <h3><span className="student-card-icon">⚡</span> Quick Actions</h3>
          <div className="student-quick-actions">
            <button
              onClick={() => setShowMultiModal(true)}
              className="student-action-btn"
              data-testid="quick-book-multiple"
            >
              📦 Book Multiple Items
            </button>
            <button
              onClick={() => navigate('/student/equipment')}
              className="student-action-btn secondary"
            >
              🔍 Browse Equipment
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
