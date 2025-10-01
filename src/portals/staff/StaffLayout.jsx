import { useAuth } from '../../hooks/useAuth';

export default function StaffLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="header-content">
          <h1>NCADbook - Staff Portal</h1>
          <div className="header-actions">
            <span className="user-info">{user?.full_name}</span>
            <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
          </div>
        </div>
      </header>
      <main className="portal-main">
        <div className="dashboard">
          <h2>Welcome, {user?.first_name}!</h2>
          <p>Staff portal features coming soon...</p>
          <div className="dashboard-card">
            <h3>Staff Features</h3>
            <ul>
              <li>Equipment Booking</li>
              <li>Room/Space Booking</li>
              <li>View Student Bookings</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
