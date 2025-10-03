import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    approvalRate: 0,
    popularEquipment: [],
    bookingsByDepartment: {},
    bookingsByStatus: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const bookings = await demoMode.query('bookings');
      const equipment = await demoMode.query('equipment');
      const users = await demoMode.query('users');

      // Calculate approval rate
      const totalNonPending = bookings.filter(b => b.status !== 'pending').length;
      const approved = bookings.filter(b => b.status === 'approved').length;
      const approvalRate = totalNonPending > 0 ? Math.round((approved / totalNonPending) * 100) : 0;

      // Count bookings by equipment
      const equipmentCounts = {};
      bookings.forEach(b => {
        equipmentCounts[b.equipment_id] = (equipmentCounts[b.equipment_id] || 0) + 1;
      });

      // Get top 5 popular equipment
      const popularEquipment = Object.entries(equipmentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([equipId, count]) => {
          const equip = equipment.find(e => e.id === equipId);
          return {
            name: equip?.product_name || 'Unknown',
            count
          };
        });

      // Bookings by department
      const bookingsByDepartment = {};
      for (const booking of bookings) {
        const user = users.find(u => u.id === booking.user_id);
        const dept = user?.department || 'Unknown';
        bookingsByDepartment[dept] = (bookingsByDepartment[dept] || 0) + 1;
      }

      // Bookings by status
      const bookingsByStatus = {};
      bookings.forEach(b => {
        bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1;
      });

      setAnalytics({
        totalBookings: bookings.length,
        approvalRate,
        popularEquipment,
        bookingsByDepartment,
        bookingsByStatus
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    alert('CSV Export functionality - Export analytics data as CSV');
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div>
          <h2>Analytics & Reports</h2>
          <p className="subtitle">System-wide booking statistics</p>
        </div>
        <button onClick={exportToCSV} className="btn btn-primary">
          Export CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon" style={{ background: 'var(--color-primary-pale)', color: 'var(--color-primary)' }}>📊</div>
          <div className="stat-content">
            <h3>{analytics.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon" style={{ background: 'var(--color-success-pale)', color: 'var(--color-success)' }}>✓</div>
          <div className="stat-content">
            <h3>{analytics.approvalRate}%</h3>
            <p>Approval Rate</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Popular Equipment</h3>
          <div className="chart-list">
            {analytics.popularEquipment.map((item, index) => (
              <div key={index} className="chart-item">
                <span className="item-name">{item.name}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(item.count / analytics.totalBookings) * 100}%` }}
                  ></div>
                </div>
                <span className="item-count">{item.count} bookings</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Bookings by Department</h3>
          <div className="chart-list">
            {Object.entries(analytics.bookingsByDepartment).map(([dept, count]) => (
              <div key={dept} className="chart-item">
                <span className="item-name">{dept}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(count / analytics.totalBookings) * 100}%` }}
                  ></div>
                </div>
                <span className="item-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Bookings by Status</h3>
          <div className="chart-list">
            {Object.entries(analytics.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="chart-item">
                <span className="item-name">{status}</span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(count / analytics.totalBookings) * 100}%` }}
                  ></div>
                </div>
                <span className="item-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
