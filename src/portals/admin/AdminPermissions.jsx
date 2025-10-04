import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';
import {
  getAllStaff,
  getAllAdmins,
  updateAdminPermissions,
  updateStaffPermissions,
  grantAdminDepartmentAccess,
  getPermissionPresets,
  applyPermissionPreset,
  grantDepartmentAccessWithExpiry,
  revokeDepartmentAccess
} from '../../services/staffPermissions.service';
import { getAllDepartments } from '../../services/department.service';

export default function AdminPermissions() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('admins'); // 'admins' or 'staff'
  const [admins, setAdmins] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [departmentAccessExpiry, setDepartmentAccessExpiry] = useState({});
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
    { key: 'export_data', label: 'Export Data', description: 'Export data as CSV/PDF' },
    { key: 'add_equipment_notes', label: 'Add Notes', description: 'Add notes to equipment' },
    { key: 'csv_import', label: 'CSV Import', description: 'Import users/equipment via CSV' },
    { key: 'manage_kits', label: 'Manage Kits', description: 'Create and manage equipment kits' }
  ];

  const staffPermissions = [
    { key: 'can_create_bookings', label: 'Create Bookings', description: 'Can create equipment bookings' },
    { key: 'can_view_analytics', label: 'View Analytics', description: 'Can view department analytics' },
    { key: 'can_add_equipment_notes', label: 'Add Notes', description: 'Can add notes to equipment' },
    { key: 'can_request_access', label: 'Request Access', description: 'Can request cross-department access' }
  ];

  // Apply preset permissions
  const applyPreset = async (userId, presetName, isAdmin = true) => {
    try {
      const presets = getPermissionPresets();
      const preset = isAdmin ? presets.admin[presetName] : presets.staff[presetName];

      if (!preset) {
        showToast('Invalid preset', 'error');
        return;
      }

      if (isAdmin) {
        await updateAdminPermissions(userId, preset.permissions);
        setAdmins(prevAdmins =>
          prevAdmins.map(a =>
            a.id === userId ? { ...a, admin_permissions: preset.permissions } : a
          )
        );
      } else {
        await updateStaffPermissions(userId, preset.permissions);
        setStaff(prevStaff =>
          prevStaff.map(s =>
            s.id === userId ? { ...s, staff_permissions: preset.permissions } : s
          )
        );
      }

      showToast(`Applied "${preset.name}" preset successfully`, 'success');
      setShowPermissionModal(false);
    } catch (error) {
      console.error('Failed to apply preset:', error);
      showToast('Failed to apply preset', 'error');
    }
  };

  // Handle department access with expiry
  const handleDepartmentAccessToggle = async (userId, departmentId, isAdmin = true) => {
    const currentUser = isAdmin
      ? admins.find(a => a.id === userId)
      : staff.find(s => s.id === userId);

    if (!currentUser) return;

    const permissionKey = isAdmin ? 'admin_permissions' : 'staff_permissions';
    const currentPermissions = currentUser[permissionKey] || {};
    const accessibleDepartments = currentPermissions.accessible_departments || [];
    const hasAccess = accessibleDepartments.includes(departmentId);

    if (hasAccess) {
      // Revoke access
      setConfirmAction({
        message: `Revoke access to this department for ${currentUser.full_name}?`,
        onConfirm: async () => {
          try {
            await revokeDepartmentAccess(userId, departmentId, isAdmin);
            await loadData();
            showToast('Department access revoked', 'success');
            setShowConfirmDialog(false);
          } catch (error) {
            showToast('Failed to revoke access', 'error');
          }
        }
      });
      setShowConfirmDialog(true);
    } else {
      // Grant access - check if expiry date is set
      const expiryKey = `${userId}-${departmentId}`;
      const expiryDate = departmentAccessExpiry[expiryKey];

      try {
        await grantDepartmentAccessWithExpiry(userId, departmentId, expiryDate, isAdmin);
        await loadData();
        showToast(
          expiryDate
            ? `Department access granted until ${new Date(expiryDate).toLocaleDateString()}`
            : 'Department access granted (no expiry)',
          'success'
        );
        // Clear expiry date input
        setDepartmentAccessExpiry(prev => {
          const newState = { ...prev };
          delete newState[expiryKey];
          return newState;
        });
      } catch (error) {
        showToast('Failed to grant access', 'error');
      }
    }
  };

  // Bulk grant/revoke department access
  const bulkDepartmentAction = async (userIds, departmentId, action, isAdmin = true) => {
    try {
      for (const userId of userIds) {
        if (action === 'grant') {
          await grantDepartmentAccessWithExpiry(userId, departmentId, null, isAdmin);
        } else {
          await revokeDepartmentAccess(userId, departmentId, isAdmin);
        }
      }
      await loadData();
      showToast(`Bulk ${action} completed for ${userIds.length} users`, 'success');
    } catch (error) {
      showToast(`Bulk ${action} failed`, 'error');
    }
  };

  // Filter and search users
  const currentUsers = (viewMode === 'admins' ? admins : staff).filter(u => {
    const matchesSearch = searchTerm === '' ||
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === 'all' || u.department === filterDepartment;

    const matchesRole = filterRole === 'all' || u.role === filterRole;

    return matchesSearch && matchesDepartment && matchesRole;
  });

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

      {/* Search and Filters */}
      <div className="filters-section" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input"
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ flex: '0 1 200px' }}>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="input"
            style={{ width: '100%' }}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '0 1 200px' }}>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input"
            style={{ width: '100%' }}
          >
            <option value="all">All Roles</option>
            <option value="master_admin">Master Admin</option>
            <option value="department_admin">Department Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
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
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedUser(currentUser);
                            setShowPermissionModal(true);
                          }}
                          className="btn btn-sm btn-primary"
                          title="Manage detailed permissions"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => setExpandedUser(isExpanded ? null : currentUser.id)}
                          className="btn btn-sm btn-secondary"
                          title="Manage department access"
                        >
                          {isExpanded ? 'Hide' : 'Depts'}
                        </button>
                      </div>
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

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {departments.map(dept => {
                              const hasAccess = permissions.accessible_departments?.includes(dept.id) || false;
                              const isPrimaryDept = currentUser.department === dept.name ||
                                (currentUser.managed_department_id === dept.id && isAdmin);
                              const expiryKey = `${currentUser.id}-${dept.id}`;
                              const accessData = permissions.department_access_expiry?.[dept.id];

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
                                  <div style={{ marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <strong style={{ fontSize: '0.875rem' }}>{dept.name}</strong>
                                      {!isPrimaryDept && (
                                        <label className="switch" style={{ marginLeft: '0.5rem' }}>
                                          <input
                                            type="checkbox"
                                            checked={hasAccess}
                                            onChange={() => handleDepartmentAccessToggle(currentUser.id, dept.id, isAdmin)}
                                          />
                                          <span className="slider"></span>
                                        </label>
                                      )}
                                    </div>
                                    {isPrimaryDept && (
                                      <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                                        Home Department
                                      </div>
                                    )}
                                    {!isPrimaryDept && hasAccess && accessData?.expiry && (
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        Expires: {new Date(accessData.expiry).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                  {!isPrimaryDept && !hasAccess && (
                                    <input
                                      type="date"
                                      placeholder="Expiry date (optional)"
                                      value={departmentAccessExpiry[expiryKey] || ''}
                                      onChange={(e) => setDepartmentAccessExpiry(prev => ({
                                        ...prev,
                                        [expiryKey]: e.target.value
                                      }))}
                                      className="input"
                                      style={{ fontSize: '0.75rem', padding: '0.25rem', marginTop: '0.25rem', width: '100%' }}
                                      min={new Date().toISOString().split('T')[0]}
                                    />
                                  )}
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

      {/* Permission Details Modal */}
      {showPermissionModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowPermissionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Manage Permissions: {selectedUser.full_name}</h3>
              <button onClick={() => setShowPermissionModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <strong>Role:</strong> {selectedUser.role} | <strong>Department:</strong> {selectedUser.department}
                </p>
              </div>

              {/* Permission Presets */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.75rem' }}>Quick Apply Preset</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  {isAdmin ? (
                    <>
                      <button
                        onClick={() => applyPreset(selectedUser.id, 'full_access', true)}
                        className="btn btn-sm btn-primary"
                      >
                        Full Access
                      </button>
                      <button
                        onClick={() => applyPreset(selectedUser.id, 'booking_manager', true)}
                        className="btn btn-sm btn-secondary"
                      >
                        Booking Manager
                      </button>
                      <button
                        onClick={() => applyPreset(selectedUser.id, 'equipment_manager', true)}
                        className="btn btn-sm btn-secondary"
                      >
                        Equipment Manager
                      </button>
                      <button
                        onClick={() => applyPreset(selectedUser.id, 'view_only', true)}
                        className="btn btn-sm btn-secondary"
                      >
                        View Only
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => applyPreset(selectedUser.id, 'full_staff', false)}
                        className="btn btn-sm btn-primary"
                      >
                        Full Staff
                      </button>
                      <button
                        onClick={() => applyPreset(selectedUser.id, 'basic_staff', false)}
                        className="btn btn-sm btn-secondary"
                      >
                        Basic Staff
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Individual Permissions */}
              <div>
                <h4 style={{ marginBottom: '0.75rem' }}>Individual Permissions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {currentPermissions.map(perm => {
                    const permissionKey = isAdmin ? 'admin_permissions' : 'staff_permissions';
                    const permissions = selectedUser[permissionKey] || {};
                    const isMasterAdmin = selectedUser.role === 'master_admin';

                    return (
                      <div
                        key={perm.key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-md)'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.875rem' }}>{perm.label}</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {perm.description}
                          </p>
                        </div>
                        {isMasterAdmin ? (
                          <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓</span>
                        ) : (
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={permissions[perm.key] || false}
                              onChange={() => togglePermission(selectedUser.id, perm.key, isAdmin)}
                            />
                            <span className="slider"></span>
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Last Modified Info */}
              {selectedUser.permissions_updated_at && (
                <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Last modified: {new Date(selectedUser.permissions_updated_at).toLocaleString()}
                  {selectedUser.permissions_updated_by && ` by ${selectedUser.permissions_updated_by}`}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowPermissionModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmAction && (
        <div className="modal-overlay" onClick={() => setShowConfirmDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Confirm Action</h3>
              <button onClick={() => setShowConfirmDialog(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <p>{confirmAction.message}</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowConfirmDialog(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmAction.onConfirm} className="btn btn-danger">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

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
