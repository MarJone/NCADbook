import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="header-content">
          <h1>NCADbook - Admin Portal</h1>
          <div className="header-actions">
            <span className="user-info">{user?.full_name}</span>
            <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
          </div>
        </div>
      </header>
      <main className="portal-main">
        <div className="dashboard">
          <h2>Admin Dashboard</h2>
          <p>Admin portal features coming soon...</p>
          <div className="dashboard-card">
            <h3>Admin Features</h3>
            <ul>
              <li>Approve/Deny Bookings</li>
              <li>Manage Equipment</li>
              <li>View Analytics</li>
              <li>Manage Users</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
