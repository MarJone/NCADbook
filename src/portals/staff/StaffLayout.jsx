import { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, usePortalTheme } from '../../contexts/ThemeContext';
import NotificationCenter from '../../components/common/NotificationCenter';
import MobileBottomNav from '../../components/common/MobileBottomNav';
import { PortalHeader } from '../../components/layout/PortalHeader';
import { SmartSearch } from '../../components/ai/SmartSearch';
import { AIAssistant, useAIAssistant } from '../../components/ai/AIAssistant';
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
  const { theme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Register portal theme
  usePortalTheme('staff');

  // AI Assistant state
  const {
    messages,
    isThinking,
    unreadCount,
    sendMessage,
  } = useAIAssistant();

  return (
    <div className="staff-portal" data-theme={theme}>
      {/* Enhanced Header with scroll-awareness */}
      <PortalHeader
        portalType="staff"
        user={user}
        logoSrc="/images/ncad-logo.svg"
        onSearchOpen={() => setIsSearchOpen(true)}
        onMobileMenuToggle={(open) => console.log('Mobile menu:', open)}
        notificationCount={2}
      />

      {/* Smart Search Modal */}
      {isSearchOpen && (
        <div className="search-modal-backdrop glass-modal-backdrop" onClick={() => setIsSearchOpen(false)}>
          <div className="search-modal glass-modal" onClick={(e) => e.stopPropagation()}>
            <SmartSearch
              onSearch={(query) => {
                console.log('Search:', query);
                setIsSearchOpen(false);
              }}
              onSelectItem={(item) => {
                console.log('Selected:', item);
                setIsSearchOpen(false);
              }}
              placeholder="Search equipment, rooms, bookings..."
            />
          </div>
        </div>
      )}

      <nav className="staff-nav glass-nav">
        <NavLink to="/staff" end className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/staff/rooms" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          Book Rooms
        </NavLink>
        <NavLink to="/staff/equipment" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          Equipment
        </NavLink>
        <NavLink to="/staff/bookings" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          My Bookings
        </NavLink>
        <NavLink to="/staff/cross-department-requests" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          Request Equipment
        </NavLink>
        <NavLink to="/staff/my-cross-department-requests" className={({ isActive }) => `staff-nav-link ${isActive ? 'active' : ''}`}>
          My Requests
        </NavLink>
      </nav>

      <main className="staff-main scroll-reveal-container">
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

      {/* AI Assistant FAB */}
      <AIAssistant
        messages={messages}
        isThinking={isThinking}
        unreadCount={unreadCount}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
