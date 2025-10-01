import { useAuth } from '../../hooks/useAuth';

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.first_name}!</h2>
      <p>Your equipment booking dashboard</p>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Quick Stats</h3>
          <p>Active Bookings: 0</p>
          <p>Pending Approvals: 0</p>
        </div>

        <div className="dashboard-card">
          <h3>Recent Activity</h3>
          <p>No recent activity</p>
        </div>

        <div className="dashboard-card">
          <h3>Quick Actions</h3>
          <a href="/student/equipment" className="btn btn-primary">Browse Equipment</a>
        </div>
      </div>
    </div>
  );
}
