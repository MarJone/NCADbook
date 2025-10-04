import { Routes, Route, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../../components/common/NotificationCenter';
import MobileBottomNav from '../../components/common/MobileBottomNav';
import StaffDashboard from './StaffDashboard';
import RoomBookingWithCalendar from './RoomBookingWithCalendar';
import EquipmentBrowse from '../student/EquipmentBrowse';
import MyBookings from '../student/MyBookings';
import CrossDepartmentRequestForm from './CrossDepartmentRequestForm';
import MyCrossDepartmentRequests from './MyCrossDepartmentRequests';
import './StaffPortal.css';
import '../../styles/role-colors.css';

export default function StaffLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="staff-portal">
      <header className="staff-header">
        <div className="staff-header-content">
          <h1>🏢 NCADbook Staff</h1>
          <div className="staff-header-actions">
            <NotificationCenter />
            <span className="staff-user-info">
              {user?.full_name}
            </span>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="staff-nav">
        <NavLink to="/staff" end className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          🏠 Dashboard
        </NavLink>
        <NavLink to="/staff/rooms" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          🚪 Book Rooms
        </NavLink>
        <NavLink to="/staff/equipment" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          📦 Equipment
        </NavLink>
        <NavLink to="/staff/bookings" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          📅 My Bookings
        </NavLink>
        <NavLink to="/staff/cross-department-requests" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          🔄 Request Equipment
        </NavLink>
        <NavLink to="/staff/my-cross-department-requests" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          📋 My Requests
        </NavLink>
      </nav>

      <main className="staff-main">
        <Routes>
          <Route index element={<StaffDashboard />} />
          <Route path="rooms" element={<RoomBookingWithCalendar />} />
          <Route path="equipment" element={<EquipmentBrowse />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="cross-department-requests" element={<CrossDepartmentRequestForm />} />
          <Route path="my-cross-department-requests" element={<MyCrossDepartmentRequests />} />
        </Routes>
      </main>

      <MobileBottomNav />
    </div>
  );
}
