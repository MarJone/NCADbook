import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const bookings = await demoMode.query('bookings');
      const equipment = await demoMode.query('equipment');
      const users = await demoMode.query('users');

      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        approvedBookings: bookings.filter(b => b.status === 'approved').length,
        totalEquipment: equipment.length,
        availableEquipment: equipment.filter(e => e.status === 'available').length,
        totalUsers: users.filter(u => u.role === 'student').length
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
    <div className="admin-dashboard">
      <h2>Welcome, {user?.first_name}!</h2>
      <p className="subtitle">Admin Dashboard Overview</p>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-content">
            <h3>{stats.pendingBookings}</h3>
            <p>Pending Approval</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-content">
            <h3>{stats.approvedBookings}</h3>
            <p>Approved</p>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-content">
            <h3>{stats.availableEquipment}/{stats.totalEquipment}</h3>
            <p>Equipment Available</p>
          </div>
        </div>

        <div className="stat-card stat-secondary">
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Students</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <a href="/admin/approvals" className="btn btn-primary">
            Review Pending Bookings ({stats.pendingBookings})
          </a>
          <a href="/admin/equipment" className="btn btn-secondary">
            Manage Equipment
          </a>
          <a href="/admin/users" className="btn btn-secondary">
            Manage Users
          </a>
        </div>
      </div>
    </div>
  );
}
