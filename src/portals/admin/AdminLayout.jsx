import { useState, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme, usePortalTheme } from '../../contexts/ThemeContext';
import NotificationCenter from '../../components/common/NotificationCenter';
import MobileBottomNav from '../../components/common/MobileBottomNav';
import { PortalHeader } from '../../components/layout/PortalHeader';
import { SmartSearch } from '../../components/ai/SmartSearch';
import { CommandPalette, useCommandPalette } from '../../components/ai/CommandPalette';
import { AIAssistant, useAIAssistant } from '../../components/ai/AIAssistant';
import Dashboard from './Dashboard';
import BookingApprovals from './BookingApprovals';
import EquipmentManagement from './EquipmentManagement';
import Analytics from './Analytics';
import FeatureFlagManager from './FeatureFlagManager';
import UserManagement from './UserManagement';
import CSVImport from './CSVImport';
import AdminPermissions from './AdminPermissions';
import KitManagement from './KitManagement';
import DepartmentManagement from './SubAreaManagement';
import StudentAssignment from './StudentAssignment';
import InterdisciplinaryAccess from './InterdisciplinaryAccess';
import AccessRequests from './AccessRequests';
import ManageAccessRequests from './ManageAccessRequests';
import DepartmentStaffPermissions from './DepartmentStaffPermissions';
import SystemSettings from '../master-admin/SystemSettings';
import RoleManagement from '../master-admin/RoleManagement';
import CrossDepartmentRequests from './CrossDepartmentRequests';
import EquipmentKitsManagement from './EquipmentKitsManagement';
import './AdminPortal.css';
import '../../styles/role-colors.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Determine portal type based on user role
  const isMasterAdmin = user?.role === 'master_admin';
  const portalType = isMasterAdmin ? 'master-admin' : 'dept-admin';

  // Register portal theme
  usePortalTheme(portalType);

  // Command palette for Master Admin
  const { isOpen: isCommandPaletteOpen, open: openCommandPalette, close: closeCommandPalette } = useCommandPalette();

  // AI Assistant state
  const {
    messages,
    isThinking,
    unreadCount,
    sendMessage,
  } = useAIAssistant();

  // Handle command execution
  const handleCommand = useCallback((command) => {
    // Navigate based on command
    const navCommands = {
      'nav-dashboard': '/admin',
      'nav-equipment': '/admin/equipment',
      'nav-users': '/admin/users',
      'nav-bookings': '/admin/approvals',
      'nav-reports': '/admin/analytics',
      'action-add-equipment': '/admin/equipment?action=new',
      'action-add-user': '/admin/users?action=new',
      'action-import-csv': '/admin/csv-import',
      'admin-policies': '/admin/system-settings',
      'admin-settings': '/admin/system-settings',
    };

    if (navCommands[command.id]) {
      navigate(navCommands[command.id]);
    }
  }, [navigate]);

  return (
    <div
      className={`admin-portal ${isMasterAdmin ? 'master-admin-portal' : ''}`}
      data-theme={isMasterAdmin ? 'dark' : theme}
    >
      {/* Enhanced Header with scroll-awareness */}
      <PortalHeader
        portalType={portalType}
        user={user}
        logoSrc="/images/ncad-logo.svg"
        onSearchOpen={() => setIsSearchOpen(true)}
        onCommandPaletteOpen={isMasterAdmin ? openCommandPalette : undefined}
        onMobileMenuToggle={(open) => console.log('Mobile menu:', open)}
        notificationCount={5}
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
              placeholder="Search equipment, users, bookings..."
            />
          </div>
        </div>
      )}

      {/* Command Palette (Master Admin only) */}
      {isMasterAdmin && (
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={closeCommandPalette}
          onCommand={handleCommand}
        />
      )}

      <nav className={`admin-nav ${isMasterAdmin ? 'glass-nav' : ''}`}>
        <div className="admin-nav-container">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/approvals" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Approvals
          </NavLink>
          <NavLink to="/admin/equipment" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Equipment
          </NavLink>
          <NavLink to="/admin/equipment-kits" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            Equipment Kits
          </NavLink>
          {isMasterAdmin && (
            <>
              <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                Users
              </NavLink>
              <NavLink to="/admin/analytics" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                Analytics
              </NavLink>
              <NavLink to="/admin/departments" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                Departments
              </NavLink>
              <NavLink to="/admin/csv-import" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                CSV Import
              </NavLink>
              <NavLink to="/admin/system-settings" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                Settings
              </NavLink>
              <NavLink to="/admin/role-management" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                Role Management
              </NavLink>
            </>
          )}
          {user?.role === 'department_admin' && (
            <>
              <NavLink to="/admin/cross-department-requests" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                Cross-Dept Requests
              </NavLink>
              <NavLink to="/admin/department-staff-permissions" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                Staff Permissions
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <main className="admin-main scroll-reveal-container">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<BookingApprovals />} />
          <Route path="equipment" element={<EquipmentManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="kits" element={<KitManagement />} />
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="student-assignment" element={<StudentAssignment />} />
          <Route path="interdisciplinary" element={<InterdisciplinaryAccess />} />
          <Route path="access-requests" element={<AccessRequests />} />
          <Route path="manage-access-requests" element={<ManageAccessRequests />} />
          <Route path="csv-import" element={<CSVImport />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="features" element={<FeatureFlagManager />} />
          <Route path="department-staff-permissions" element={<DepartmentStaffPermissions />} />
          <Route path="system-settings" element={<SystemSettings />} />
          <Route path="role-management" element={<RoleManagement />} />
          <Route path="cross-department-requests" element={<CrossDepartmentRequests />} />
          <Route path="equipment-kits" element={<EquipmentKitsManagement />} />
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
