import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Dashboard from './Dashboard';
import BookingApprovals from './BookingApprovals';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="header-content">
          <h1>NCADbook - Admin Portal</h1>
          <div className="header-actions">
            <span className="user-info">{user?.full_name} - {user?.role}</span>
            <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
          </div>
        </div>
      </header>

      <nav className="portal-nav">
        <Link to="/admin" className="nav-link">Dashboard</Link>
        <Link to="/admin/approvals" className="nav-link">Booking Approvals</Link>
        <Link to="/admin/equipment" className="nav-link">Equipment</Link>
        <Link to="/admin/users" className="nav-link">Users</Link>
      </nav>

      <main className="portal-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<BookingApprovals />} />
          <Route path="equipment" element={<div>Equipment Management (Coming Soon)</div>} />
          <Route path="users" element={<div>User Management (Coming Soon)</div>} />
        </Routes>
      </main>
    </div>
  );
}
