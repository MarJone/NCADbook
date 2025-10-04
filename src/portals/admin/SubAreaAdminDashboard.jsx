import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function SubAreaAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingBookings: 0,
    activeBookings: 0,
    totalEquipment: 0,
    availableEquipment: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [subArea, setSubArea] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get user's department assignment
      const userSubArea = await demoMode.findOne('user_sub_areas', { user_id: user.id });

      if (userSubArea) {
        const subAreaData = await demoMode.findOne('sub_areas', { id: userSubArea.sub_area_id });
        setSubArea(subAreaData);

        // Get equipment for this sub-area
        const equipment = await demoMode.query('equipment', { sub_area_id: userSubArea.sub_area_id });
        const availableEquip = equipment.filter(e => e.status === 'available');

      // Get bookings for equipment in this sub-area
        const allBookings = await demoMode.query('bookings');
        const relevantBookings = allBookings.filter(booking =>
          equipment.some(e => e.id === booking.equipment_id)
        );

        const pending = relevantBookings.filter(b => b.status === 'pending');
        const active = relevantBookings.filter(b => b.status === 'approved');

        // Get recent activity (last 5 bookings)
        const recentBookings = relevantBookings
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        const activityWithDetails = await Promise.all(
          recentBookings.map(async (booking) => {
            const equip = await demoMode.findOne('equipment', { id: booking.equipment_id });
            const student = await demoMode.findOne('users', { id: booking.user_id });
            return { ...booking, equipment: equip, student };
          })
        );

        setStats({
          pendingBookings: pending.length,
          activeBookings: active.length,
          totalEquipment: equipment.length,
          availableEquipment: availableEquip.length,
          recentActivity: activityWithDetails
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      denied: 'error',
      active: 'primary'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="sub-area-dashboard">
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  if (!subArea) {
    return (
      <div className="empty-state">
        <h2>No Department Assigned</h2>
        <p>You are not assigned to manage any department.</p>
      </div>
    );
  }

  return (
    <div className="sub-area-dashboard" data-testid="sub-area-dashboard">
      <div className="dashboard-header">
        <h2>{subArea.name} Dashboard</h2>
        <p className="subtitle">Quick overview of your department</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card" data-testid="stat-pending">
          <div className="stat-value">{stats.pendingBookings}</div>
          <div className="stat-label">Pending Approvals</div>
          {stats.pendingBookings > 0 && (
            <Link to="/admin/booking-approvals" className="stat-link">
              Review Now
            </Link>
          )}
        </div>

        <div className="stat-card" data-testid="stat-active">
          <div className="stat-value">{stats.activeBookings}</div>
          <div className="stat-label">Active Bookings</div>
        </div>

        <div className="stat-card" data-testid="stat-equipment">
          <div className="stat-value">
            {stats.availableEquipment}/{stats.totalEquipment}
          </div>
          <div className="stat-label">Available Equipment</div>
          <Link to="/admin/equipment" className="stat-link">
            Manage Equipment
          </Link>
        </div>

        <div className="stat-card" data-testid="stat-utilization">
          <div className="stat-value">
            {stats.totalEquipment > 0
              ? Math.round(((stats.totalEquipment - stats.availableEquipment) / stats.totalEquipment) * 100)
              : 0}%
          </div>
          <div className="stat-label">Utilization Rate</div>
        </div>
      </div>

      <div className="dashboard-recent-activity">
        <h3>Recent Activity</h3>
        {stats.recentActivity.length === 0 ? (
          <p className="no-activity">No recent booking activity</p>
        ) : (
          <div className="activity-list">
            {stats.recentActivity.map(activity => (
              <div key={activity.id} className="activity-item" data-testid="activity-item">
                <div className="activity-header">
                  <span className="activity-equipment">
                    {activity.equipment?.product_name || 'Unknown Equipment'}
                  </span>
                  <span className={`status-badge status-${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <div className="activity-details">
                  <span className="activity-student">
                    {activity.student?.full_name || 'Unknown Student'}
                  </span>
                  <span className="activity-date">{formatDate(activity.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link to="/admin/booking-approvals" className="view-all-link">
          View All Bookings
        </Link>
      </div>
    </div>
  );
}
