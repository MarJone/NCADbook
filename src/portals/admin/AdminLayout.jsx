import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import NotificationCenter from '../../components/common/NotificationCenter';
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

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Check if user has specific permissions (for general admins)
  const hasPermission = (permission) => {
    if (user?.role === 'master_admin') return true;
    return user?.admin_permissions?.[permission] || false;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  return (
    <div className="portal-layout">
      <header className="portal-header">
        <div className="header-content">
          <h1>NCADbook - Admin Portal</h1>
          <div className="header-actions">
            <NotificationCenter />
            <span className="user-info">{user?.full_name} - {user?.role}</span>
            <button onClick={logout} className="btn btn-secondary btn-sm">Logout</button>
          </div>
        </div>
      </header>

      <nav className="portal-nav" ref={dropdownRef}>
        <Link to="/admin" className="nav-link">Dashboard</Link>
        <Link to="/admin/approvals" className="nav-link">Approvals</Link>

        {/* Department Admin: Quick Actions */}
        {user?.role === 'department_admin' && (
          <>
            <Link to="/admin/equipment" className="nav-link">Equipment</Link>
            <Link to="/admin/approvals" className="nav-link btn-quick-action">Approve Bookings</Link>
            <Link to="/admin/access-requests" className="nav-link btn-quick-action">Request Access</Link>
          </>
        )}

        {/* Equipment & Content Dropdown */}
        {(hasPermission('manage_equipment') || hasPermission('manage_kits')) && user?.role !== 'department_admin' && (
          <div className={`nav-dropdown ${openDropdown === 'content' ? 'open' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('content')}
            >
              Content
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              {hasPermission('manage_equipment') && (
                <Link to="/admin/equipment" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                  Equipment Management
                </Link>
              )}
              {hasPermission('manage_kits') && (
                <Link to="/admin/kits" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                  Equipment Kits
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Users & Access Dropdown */}
        {(hasPermission('manage_users') || hasPermission('view_analytics')) && (
          <div className={`nav-dropdown ${openDropdown === 'users' ? 'open' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('users')}
            >
              Users & Reports
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              {hasPermission('manage_users') && (
                <Link to="/admin/users" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                  User Management
                </Link>
              )}
              {hasPermission('view_analytics') && (
                <Link to="/admin/analytics" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                  Analytics & Reports
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Master Admin: Department Management Dropdown */}
        {user?.role === 'master_admin' && (
          <div className={`nav-dropdown ${openDropdown === 'departments' ? 'open' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('departments')}
            >
              Departments
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              <Link to="/admin/departments" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                Manage Departments
              </Link>
              <Link to="/admin/student-assignment" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                Student Assignment
              </Link>
              <Link to="/admin/interdisciplinary" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                Interdisciplinary Access
              </Link>
              <Link to="/admin/manage-access-requests" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                Access Requests
              </Link>
            </div>
          </div>
        )}

        {/* Master Admin: System Settings Dropdown */}
        {user?.role === 'master_admin' && (
          <div className={`nav-dropdown ${openDropdown === 'system' ? 'open' : ''}`}>
            <button
              className="nav-link dropdown-toggle"
              onClick={() => toggleDropdown('system')}
            >
              System
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className="dropdown-menu">
              <Link to="/admin/csv-import" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                CSV Import
              </Link>
              <Link to="/admin/permissions" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                Admin Permissions
              </Link>
              <Link to="/admin/features" className="dropdown-item" onClick={() => setOpenDropdown(null)}>
                Feature Flags
              </Link>
            </div>
          </div>
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
          <Route path="departments" element={<DepartmentManagement />} />
          <Route path="student-assignment" element={<StudentAssignment />} />
          <Route path="interdisciplinary" element={<InterdisciplinaryAccess />} />
          <Route path="access-requests" element={<AccessRequests />} />
          <Route path="manage-access-requests" element={<ManageAccessRequests />} />
          <Route path="csv-import" element={<CSVImport />} />
          <Route path="permissions" element={<AdminPermissions />} />
          <Route path="features" element={<FeatureFlagManager />} />
        </Routes>
      </main>
    </div>
  );
}
