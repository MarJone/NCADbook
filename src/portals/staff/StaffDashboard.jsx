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
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="staff-dashboard" data-testid="staff-dashboard">
      <h2>Welcome, {user?.first_name}!</h2>
      <p className="subtitle">Staff Dashboard - Equipment & Space Management</p>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-content">
            <h3>{stats.myBookings}</h3>
            <p>Equipment Bookings</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-content">
            <h3>{stats.mySpaceBookings}</h3>
            <p>Room Bookings</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-content">
            <h3>{stats.availableSpaces}</h3>
            <p>Spaces Available</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/staff/rooms" className="btn btn-primary" data-testid="book-room-link">
            Book a Room/Space
          </Link>
          <Link to="/staff/equipment" className="btn btn-secondary" data-testid="browse-equipment-link">
            Browse Equipment
          </Link>
          <Link to="/staff/bookings" className="btn btn-secondary" data-testid="view-bookings-link">
            View My Bookings
          </Link>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Staff Features</h3>
        <ul>
          <li>Book rooms and spaces by the hour</li>
          <li>Book equipment for projects</li>
          <li>Manage all your bookings in one place</li>
          <li>Auto-approved room bookings</li>
        </ul>
      </div>
    </div>
  );
}
