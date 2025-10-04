import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../../components/common/NotificationCenter';
import MobileBottomNav from '../../components/common/MobileBottomNav';
import StaffDashboard from './StaffDashboard';
import RoomBooking from './RoomBooking';
import EquipmentBrowse from '../student/EquipmentBrowse';
import MyBookings from '../student/MyBookings';
import CrossDepartmentRequestForm from './CrossDepartmentRequestForm';
import MyCrossDepartmentRequests from './MyCrossDepartmentRequests';

export default function StaffLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="header-content">
          <h1>NCADbook - Staff Portal</h1>
          <div className="header-actions">
            <NotificationCenter />
            <span className="user-info">{user?.full_name} - {user?.department}</span>
            <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
          </div>
        </div>
      </header>

      <nav className="portal-nav">
        <Link to="/staff" className="nav-link">Dashboard</Link>
        <Link to="/staff/rooms" className="nav-link">Book Rooms</Link>
        <Link to="/staff/equipment" className="nav-link">Equipment</Link>
        <Link to="/staff/bookings" className="nav-link">My Bookings</Link>
        <Link to="/staff/cross-department-requests" className="nav-link">Request Equipment</Link>
        <Link to="/staff/my-cross-department-requests" className="nav-link">My Requests</Link>
      </nav>

      <main className="portal-main">
        <Routes>
          <Route index element={<StaffDashboard />} />
          <Route path="rooms" element={<RoomBooking />} />
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
