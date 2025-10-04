import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { demoMode } from '../../mocks/demo-mode';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myBookings: 0,
    mySpaceBookings: 0,
    availableSpaces: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const bookings = await demoMode.query('bookings', { user_id: user.id });
      const spaceBookings = await demoMode.query('spaceBookings', { user_id: user.id });
      const spaces = await demoMode.query('spaces');

      setStats({
        myBookings: bookings.filter(b => b.status !== 'cancelled').length,
        mySpaceBookings: spaceBookings.filter(b => b.status !== 'cancelled').length,
        availableSpaces: spaces.filter(s => s.status === 'available').length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="staff-dashboard">
        <div className="staff-skeleton"></div>
        <div className="staff-skeleton"></div>
        <div className="staff-skeleton"></div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard" data-testid="staff-dashboard">
      <div className="staff-welcome">
        <h2>Welcome, {user?.first_name}! 👋</h2>
        <p>Staff Dashboard - Equipment & Space Management</p>
      </div>

      {/* Stats Grid */}
      <div className="staff-stats-grid">
        <div className="staff-stat-card">
          <div className="staff-stat-icon">📦</div>
          <div className="staff-stat-number">{stats.myBookings}</div>
          <div className="staff-stat-label">Equipment Bookings</div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon">🚪</div>
          <div className="staff-stat-number">{stats.mySpaceBookings}</div>
          <div className="staff-stat-label">Room Bookings</div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon">✨</div>
          <div className="staff-stat-number">{stats.availableSpaces}</div>
          <div className="staff-stat-label">Spaces Available</div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="staff-dashboard-grid">
        {/* Quick Actions */}
        <div className="staff-card">
          <h3><span className="staff-card-icon">⚡</span> Quick Actions</h3>
          <div className="staff-quick-actions">
            <Link to="/staff/rooms" className="staff-action-btn" data-testid="book-room-link">
              🚪 Book a Room
            </Link>
            <Link to="/staff/equipment" className="staff-action-btn secondary" data-testid="browse-equipment-link">
              📦 Browse Equipment
            </Link>
            <Link to="/staff/bookings" className="staff-action-btn secondary" data-testid="view-bookings-link">
              📅 My Bookings
            </Link>
            <Link to="/staff/cross-department-requests" className="staff-action-btn secondary">
              🔄 Request Equipment
            </Link>
          </div>
        </div>

        {/* Staff Features */}
        <div className="staff-card">
          <h3><span className="staff-card-icon">⭐</span> Staff Features</h3>
          <ul className="staff-features-list">
            <li>Book rooms and spaces by the hour</li>
            <li>Book equipment for projects</li>
            <li>Manage all bookings in one place</li>
            <li>Auto-approved room bookings</li>
            <li>Request cross-department equipment</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
