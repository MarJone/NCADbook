import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import StudentDashboard from './StudentDashboard';
import EquipmentBrowse from './EquipmentBrowse';
import MyBookings from './MyBookings';

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="header-content">
          <h1>NCADbook - Student Portal</h1>
          <div className="header-actions">
            <span className="user-info">
              {user?.full_name} ({user?.department})
            </span>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="portal-nav">
        <Link to="/student" className="nav-link">Dashboard</Link>
        <Link to="/student/equipment" className="nav-link">Browse Equipment</Link>
        <Link to="/student/bookings" className="nav-link">My Bookings</Link>
      </nav>

      <main className="portal-main">
        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path="equipment" element={<EquipmentBrowse />} />
          <Route path="bookings" element={<MyBookings />} />
        </Routes>
      </main>
    </div>
  );
}
