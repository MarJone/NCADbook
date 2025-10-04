import { Routes, Route, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../../components/common/NotificationCenter';
import MobileBottomNav from '../../components/common/MobileBottomNav';
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
import CrossDepartmentRequests from './CrossDepartmentRequests';
import EquipmentKitsManagement from './EquipmentKitsManagement';
import './AdminPortal.css';
import '../../styles/role-colors.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className={`admin-portal ${user?.role === 'master_admin' ? 'master-admin-portal' : ''}`}>
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>🎯 NCADbook {user?.role === 'master_admin' ? 'Master Admin' : 'Department Admin'}</h1>
          <div className="admin-header-actions">
            <NotificationCenter />
            <span className="admin-user-info">
              {user?.full_name} • {user?.department || 'System'}
            </span>
            <button onClick={logout} className="btn btn-secondary btn-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="admin-nav">
        <div className="admin-nav-container">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            🏠 Dashboard
          </NavLink>
          <NavLink to="/admin/approvals" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            ✅ Approvals
          </NavLink>
          <NavLink to="/admin/equipment" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            📦 Equipment
          </NavLink>
          <NavLink to="/admin/equipment-kits" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            🎒 Equipment Kits
          </NavLink>
          {user?.role === 'master_admin' && (
            <>
              <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                👥 Users
              </NavLink>
              <NavLink to="/admin/analytics" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                📊 Analytics
              </NavLink>
              <NavLink to="/admin/departments" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                🏢 Departments
              </NavLink>
              <NavLink to="/admin/csv-import" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                📁 CSV Import
              </NavLink>
              <NavLink to="/admin/system-settings" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                ⚙️ Settings
              </NavLink>
            </>
          )}
          {user?.role === 'department_admin' && (
            <>
              <NavLink to="/admin/cross-department-requests" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                🔄 Cross-Dept Requests
              </NavLink>
              <NavLink to="/admin/department-staff-permissions" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                🔐 Staff Permissions
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <main className="admin-main">
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
          <Route path="cross-department-requests" element={<CrossDepartmentRequests />} />
          <Route path="equipment-kits" element={<EquipmentKitsManagement />} />
        </Routes>
      </main>

      <MobileBottomNav />
    </div>
  );
}
