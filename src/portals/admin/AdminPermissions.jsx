import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';
import { getAllStaff, getAllAdmins, updateAdminPermissions, updateStaffPermissions, grantAdminDepartmentAccess } from '../../services/staffPermissions.service';
import { getAllDepartments } from '../../services/department.service';

export default function AdminPermissions() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('admins'); // 'admins' or 'staff'
  const [admins, setAdmins] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (user?.role !== 'master_admin') {
      return;
    }
    loadData();
  }, [user, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allAdmins, allStaff, allDepartments] = await Promise.all([
        getAllAdmins(),
        getAllStaff(),
        getAllDepartments()
      ]);

      setAdmins(allAdmins);
      setStaff(allStaff.filter(s => s.role === 'staff')); // Only true staff (not admins)
      setDepartments(allDepartments);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load users and permissions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (userId, permission, isAdmin = true) => {
    try {
      const currentUser = isAdmin
        ? admins.find(a => a.id === userId)
        : staff.find(s => s.id === userId);

      if (!currentUser) return;

      const permissionKey = isAdmin ? 'admin_permissions' : 'staff_permissions';
      const currentPermissions = currentUser[permissionKey] || {};
      const updatedPermissions = {
        ...currentPermissions,
        [permission]: !currentPermissions[permission]
      };

      if (isAdmin) {
        await updateAdminPermissions(userId, updatedPermissions);
        setAdmins(prevAdmins =>
          prevAdmins.map(a =>
            a.id === userId
              ? { ...a, admin_permissions: updatedPermissions }
              : a
          )
        );
      } else {
        await updateStaffPermissions(userId, updatedPermissions);
        setStaff(prevStaff =>
          prevStaff.map(s =>
            s.id === userId
              ? { ...s, staff_permissions: updatedPermissions }
              : s
          )
        );
      }

      showToast(`Permission ${permission} ${updatedPermissions[permission] ? 'granted' : 'revoked'}`, 'success');
    } catch (error) {
      console.error('Failed to update permissions:', error);
      showToast('Failed to update permissions', 'error');
    }
  };

  const toggleDepartmentAccess = async (userId, departmentId, isAdmin = true) => {
    try {
      const currentUser = isAdmin
        ? admins.find(a => a.id === userId)
        : staff.find(s => s.id === userId);

      if (!currentUser) return;

      const permissionKey = isAdmin ? 'admin_permissions' : 'staff_permissions';
      const currentPermissions = currentUser[permissionKey] || {};
      const accessibleDepartments = currentPermissions.accessible_departments || [];

      const updatedDepartments = accessibleDepartments.includes(departmentId)
        ? accessibleDepartments.filter(id => id !== departmentId)
        : [...accessibleDepartments, departmentId];

      const updatedPermissions = {
        ...currentPermissions,
        accessible_departments: updatedDepartments
      };

      if (isAdmin) {
        await updateAdminPermissions(userId, updatedPermissions);
        setAdmins(prevAdmins =>
          prevAdmins.map(a =>
            a.id === userId
              ? { ...a, admin_permissions: updatedPermissions }
              : a
          )
        );
      } else {
        await updateStaffPermissions(userId, updatedPermissions);
        setStaff(prevStaff =>
          prevStaff.map(s =>
            s.id === userId
              ? { ...s, staff_permissions: updatedPermissions }
              : s
          )
        );
      }

      showToast(
        updatedDepartments.includes(departmentId)
          ? 'Department access granted'
          : 'Department access revoked',
        'success'
      );
    } catch (error) {
      console.error('Failed to update department access:', error);
      showToast('Failed to update department access', 'error');
    }
  };

  if (user?.role !== 'master_admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only master administrators can manage permissions.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading users and permissions...</div>;
  }

  const adminPermissions = [
    { key: 'manage_equipment', label: 'Manage Equipment', description: 'Add, edit, and remove equipment' },
    { key: 'manage_users', label: 'Manage Users', description: 'View and manage user accounts' },
    { key: 'manage_bookings', label: 'Approve Bookings', description: 'Approve/deny booking requests' },
    { key: 'view_analytics', label: 'View Analytics', description: 'Access analytics and reports' },
    { key: 'manage_kits', label: 'Manage Kits', description: 'Create and manage equipment kits' }
  ];

  const staffPermissions = [
    { key: 'can_create_bookings', label: 'Create Bookings', description: 'Can create equipment bookings' },
    { key: 'can_view_analytics', label: 'View Analytics', description: 'Can view department analytics' },
    { key: 'can_add_equipment_notes', label: 'Add Notes', description: 'Can add notes to equipment' },
    { key: 'can_request_access', label: 'Request Access', description: 'Can request cross-department access' }
  ];

  const currentUsers = viewMode === 'admins' ? admins : staff;
  const currentPermissions = viewMode === 'admins' ? adminPermissions : staffPermissions;
  const isAdmin = viewMode === 'admins';

  return (
    <div className="admin-permissions">
      <div className="page-header">
        <h2>Staff & Admin Permissions</h2>
        <p className="subtitle">
          Manage access control for all staff members and admins across departments
        </p>
      </div>

      <div className="warning-banner">
        ⚠️ <strong>Warning:</strong> Permission changes take effect immediately. Only grant permissions to trusted users.
      </div>

      {/* View Mode Toggle */}
      <div className="view-toggle" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${viewMode === 'admins' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('admins')}
        >
          Admin Permissions ({admins.length})
        </button>
        <button
          className={`btn ${viewMode === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setViewMode('staff')}
          style={{ marginLeft: '1rem' }}
        >
          Staff Permissions ({staff.length})
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card stat-primary">
          <div className="stat-content">
            <h3>{admins.length}</h3>
            <p>Total Admins</p>
          </div>
        </div>
        <div className="stat-card stat-secondary">
          <div className="stat-content">
            <h3>{staff.length}</h3>
            <p>Total Staff</p>
          </div>
        </div>
        <div className="stat-card stat-tertiary">
          <div className="stat-content">
            <h3>{departments.length}</h3>
            <p>Departments</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="users-table">
          <thead>
            <tr>
              <th style={{ width: '30px' }}></th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Primary Department</th>
              {currentPermissions.map(perm => (
                <th key={perm.key} style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '0.75rem' }}>{perm.label}</div>
                </th>
              ))}
              <th style={{ textAlign: 'center', minWidth: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map(currentUser => {
              const permissionKey = isAdmin ? 'admin_permissions' : 'staff_permissions';
              const permissions = currentUser[permissionKey] || {};
              const isMasterAdmin = currentUser.role === 'master_admin';
              const isExpanded = expandedUser === currentUser.id;

              return (
                <>
                  <tr key={currentUser.id}>
                    <td>
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : currentUser.id)}
                        className="btn btn-sm"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>
                    <td>
                      <strong>{currentUser.full_name}</strong>
                      {currentUser.id === user.id && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                          (You)
                        </span>
                      )}
                    </td>
                    <td>{currentUser.email}</td>
                    <td>
                      <span className={`role-badge role-${currentUser.role}`}>
                        {currentUser.role === 'master_admin' && 'Master Admin'}
                        {currentUser.role === 'department_admin' && 'Department Admin'}
                        {currentUser.role === 'staff' && 'Staff'}
                      </span>
                    </td>
                    <td>{currentUser.department}</td>

                    {/* Feature Permissions */}
                    {currentPermissions.map(perm => (
                      <td key={perm.key} style={{ textAlign: 'center' }}>
                        {isMasterAdmin ? (
                          <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
                        ) : (
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={permissions[perm.key] || false}
                              onChange={() => togglePermission(currentUser.id, perm.key, isAdmin)}
                              data-testid={`permission-${currentUser.id}-${perm.key}`}
                            />
                            <span className="slider"></span>
                          </label>
                        )}
                      </td>
                    ))}

                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setExpandedUser(isExpanded ? null : currentUser.id)}
                        className="btn btn-sm btn-secondary"
                      >
                        {isExpanded ? 'Hide' : 'Manage'} Departments
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row - Department Access */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={currentPermissions.length + 6} style={{ background: 'var(--bg-secondary)', padding: '1.5rem' }}>
                        <div>
                          <h4 style={{ marginBottom: '1rem' }}>
                            Department Access for {currentUser.full_name}
                          </h4>
                          <p style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
                            Grant access to additional departments beyond their primary department ({currentUser.department})
                          </p>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            {departments.map(dept => {
                              const hasAccess = permissions.accessible_departments?.includes(dept.id) || false;
                              const isPrimaryDept = currentUser.department === dept.name ||
                                (currentUser.managed_department_id === dept.id && isAdmin);

                              return (
                                <div
                                  key={dept.id}
                                  style={{
                                    padding: '0.75rem',
                                    border: `2px solid ${isPrimaryDept ? 'var(--color-primary)' : hasAccess ? 'var(--color-success)' : 'var(--border-color)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    background: isPrimaryDept ? 'var(--color-primary-pale)' : hasAccess ? 'var(--color-success-pale)' : 'var(--bg-card)'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                      <strong style={{ fontSize: '0.875rem' }}>{dept.name}</strong>
                                      {isPrimaryDept && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                                          Primary Department
                                        </div>
                                      )}
                                    </div>
                                    {!isPrimaryDept && (
                                      <label className="switch" style={{ marginLeft: '0.5rem' }}>
                                        <input
                                          type="checkbox"
                                          checked={hasAccess}
                                          onChange={() => toggleDepartmentAccess(currentUser.id, dept.id, isAdmin)}
                                        />
                                        <span className="slider"></span>
                                      </label>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Permission Descriptions */}
      <div className="flags-info" style={{ marginTop: '2rem' }}>
        <h3>{viewMode === 'admins' ? 'Admin' : 'Staff'} Permission Descriptions</h3>
        <ul>
          {currentPermissions.map(perm => (
            <li key={perm.key}>
              <strong>{perm.label}:</strong> {perm.description}
            </li>
          ))}
        </ul>
      </div>

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
