import { useState, useEffect } from 'react';
import { bookingsAPI, equipmentAPI, usersAPI } from '../../utils/api';
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
      const [bookingsRes, equipmentRes, usersRes] = await Promise.all([
        bookingsAPI.getAll(),
        equipmentAPI.getAll(),
        usersAPI.getAll()
      ]);

      const bookings = bookingsRes.bookings || [];
      const equipment = equipmentRes.equipment || [];
      const users = usersRes.users || [];

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
    return (
      <div className="admin-dashboard">
        <div className="admin-stats-grid">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="admin-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-welcome">
        <h2>Welcome, {user?.first_name}! 👋</h2>
        <p>{user?.role === 'master_admin' ? 'Master Admin' : 'Department Admin'} Dashboard Overview</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📊</div>
          <div className="admin-stat-number">{stats.totalBookings}</div>
          <div className="admin-stat-label">Total Bookings</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">⏳</div>
          <div className="admin-stat-number">{stats.pendingBookings}</div>
          <div className="admin-stat-label">Pending Approval</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">✅</div>
          <div className="admin-stat-number">{stats.approvedBookings}</div>
          <div className="admin-stat-label">Approved</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📦</div>
          <div className="admin-stat-number">{stats.availableEquipment}/{stats.totalEquipment}</div>
          <div className="admin-stat-label">Equipment Available</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-number">{stats.totalUsers}</div>
          <div className="admin-stat-label">Students</div>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-card">
          <h3><span className="admin-card-icon">⚡</span> Quick Actions</h3>
          <div className="admin-quick-actions">
            <a href="/admin/approvals" className="admin-action-btn">
              ✅ Review Pending Bookings ({stats.pendingBookings})
            </a>
            <a href="/admin/equipment" className="admin-action-btn secondary">
              📦 Manage Equipment
            </a>
            {user?.role === 'master_admin' && (
              <a href="/admin/users" className="admin-action-btn secondary">
                👥 Manage Users
              </a>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h3><span className="admin-card-icon">📋</span> Admin Info</h3>
          <div className="admin-info-content">
            <p><strong>Role:</strong> {user?.role === 'master_admin' ? 'Master Admin' : 'Department Admin'}</p>
            <p><strong>Department:</strong> {user?.department || 'System'}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
