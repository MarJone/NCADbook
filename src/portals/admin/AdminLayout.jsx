import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Dashboard from './Dashboard';
import BookingApprovals from './BookingApprovals';
import EquipmentManagement from './EquipmentManagement';
import Analytics from './Analytics';
import FeatureFlagManager from './FeatureFlagManager';
import UserManagement from './UserManagement';
import CSVImport from './CSVImport';
import AdminPermissions from './AdminPermissions';
import KitManagement from './KitManagement';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  // Check if user has specific permissions (for general admins)
  const hasPermission = (permission) => {
    if (user?.role === 'master_admin') return true;
    return user?.admin_permissions?.[permission] || false;
  };

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
        <Link to="/admin/approvals" className="nav-link">Approvals</Link>
        {hasPermission('manage_equipment') && (
          <Link to="/admin/equipment" className="nav-link">Equipment</Link>
        )}
        {hasPermission('view_analytics') && (
          <Link to="/admin/analytics" className="nav-link">Analytics</Link>
        )}
        {hasPermission('manage_users') && (
          <Link to="/admin/users" className="nav-link">Users</Link>
        )}
        {hasPermission('manage_kits') && (
          <Link to="/admin/kits" className="nav-link">Equipment Kits</Link>
        )}
        {user?.role === 'master_admin' && (
          <>
            <Link to="/admin/csv-import" className="nav-link">CSV Import</Link>
            <Link to="/admin/permissions" className="nav-link">Admin Permissions</Link>
            <Link to="/admin/features" className="nav-link">Features</Link>
          </>
        )}
      </nav>

      <main className="portal-main">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<BookingApprovals />} />
          <Route path="equipment" element={<EquipmentManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="kits" element={<KitManagement />} />
          <Route path="csv-import" element={<CSVImport />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="features" element={<FeatureFlagManager />} />
        </Routes>
      </main>
    </div>
  );
}
