import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { bookingsAPI, equipmentAPI } from '../../utils/api';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myBookings: 0,
    pendingApprovals: 0,
    departmentEquipment: 0,
    availableEquipment: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get user's own bookings
      const myBookingsRes = await bookingsAPI.getAll({ user_id: user.id });
      const myBookings = myBookingsRes.bookings || [];

      // Get pending bookings for approval (department_admin/master_admin)
      let pendingCount = 0;
      if (user.role === 'staff' || user.role === 'department_admin' || user.role === 'master_admin') {
        const pendingRes = await bookingsAPI.getAll({ status: 'pending' });
        pendingCount = (pendingRes.bookings || []).length;
      }

      // Get equipment stats
      const equipmentRes = await equipmentAPI.getAll({ department: user.department });
      const equipment = equipmentRes.equipment || [];
      const available = equipment.filter(e => e.status === 'available');

      setStats({
        myBookings: myBookings.filter(b => b.status !== 'cancelled' && b.status !== 'denied').length,
        pendingApprovals: pendingCount,
        departmentEquipment: equipment.length,
        availableEquipment: available.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats({
        myBookings: 0,
        pendingApprovals: 0,
        departmentEquipment: 0,
        availableEquipment: 0
      });
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
          <div className="staff-stat-label">My Bookings</div>
        </div>

        {(user.role === 'staff' || user.role === 'department_admin' || user.role === 'master_admin') && (
          <Link to="/admin/booking-approvals" className="staff-stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="staff-stat-icon">⏳</div>
            <div className="staff-stat-number" style={{ color: stats.pendingApprovals > 0 ? '#ff9800' : 'inherit' }}>
              {stats.pendingApprovals}
            </div>
            <div className="staff-stat-label">Pending Approvals</div>
          </Link>
        )}

        <div className="staff-stat-card">
          <div className="staff-stat-icon">🏢</div>
          <div className="staff-stat-number">{stats.departmentEquipment}</div>
          <div className="staff-stat-label">Department Equipment</div>
        </div>

        <div className="staff-stat-card">
          <div className="staff-stat-icon">✨</div>
          <div className="staff-stat-number">{stats.availableEquipment}</div>
          <div className="staff-stat-label">Available Now</div>
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
