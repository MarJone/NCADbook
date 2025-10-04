import { Routes, Route, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ThemeToggle from '../../components/common/ThemeToggle';
import NotificationCenter from '../../components/common/NotificationCenter';
import MobileBottomNav from '../../components/common/MobileBottomNav';
import StudentDashboard from './StudentDashboard';
import EquipmentBrowse from './EquipmentBrowse';
import MyBookings from './MyBookings';
import './StudentPortal.css';

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="student-portal">
      <header className="student-header">
        <div className="student-header-content">
          <h1>📚 NCADbook</h1>
          <div className="student-header-actions">
            <ThemeToggle />
            <NotificationCenter />
            <span className="student-user-info">
              {user?.full_name}
            </span>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="student-nav">
        <NavLink to="/student" end className={({ isActive }) => `student-nav-link ${isActive ? 'active' : ''}`}>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/student/equipment" className={({ isActive }) => `student-nav-link ${isActive ? 'active' : ''}`}>
          📦 Browse Equipment
        </NavLink>
        <NavLink to="/student/bookings" className={({ isActive }) => `student-nav-link ${isActive ? 'active' : ''}`}>
          📅 My Bookings
        </NavLink>
      </nav>

      <main className="student-main">
        <Routes>
          <Route index element={<StudentDashboard />} />
          <Route path="equipment" element={<EquipmentBrowse />} />
          <Route path="bookings" element={<MyBookings />} />
        </Routes>
      </main>

      <MobileBottomNav />
    </div>
  );
}
