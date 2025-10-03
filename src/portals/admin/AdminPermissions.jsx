import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';

export default function AdminPermissions() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (user?.role !== 'master_admin') {
      return;
    }
    loadAdmins();
  }, [user]);

  const loadAdmins = async () => {
    try {
      const users = await demoMode.query('users');
      const adminUsers = users.filter(u =>
        u.role === 'general_admin' || u.role === 'master_admin'
      );
      setAdmins(adminUsers);
    } catch (error) {
      console.error('Failed to load admins:', error);
      showToast('Failed to load admin users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (adminId, permission) => {
    try {
      const admin = admins.find(a => a.id === adminId);
      if (!admin) return;

      const currentPermissions = admin.admin_permissions || {};
      const updatedPermissions = {
        ...currentPermissions,
        [permission]: !currentPermissions[permission]
      };

      await demoMode.update('users', adminId, {
        admin_permissions: updatedPermissions
      });

      setAdmins(prevAdmins =>
        prevAdmins.map(a =>
          a.id === adminId
            ? { ...a, admin_permissions: updatedPermissions }
            : a
        )
      );

      showToast(`Permission ${permission} ${updatedPermissions[permission] ? 'granted' : 'revoked'}`, 'success');
    } catch (error) {
      console.error('Failed to update permissions:', error);
      showToast('Failed to update permissions', 'error');
    }
  };

  if (user?.role !== 'master_admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only master administrators can manage admin permissions.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading admin users...</div>;
  }

  const availablePermissions = [
    { key: 'manage_equipment', label: 'Manage Equipment', description: 'Add, edit, and remove equipment from the system' },
    { key: 'manage_users', label: 'Manage Users', description: 'View and manage user accounts' },
    { key: 'manage_bookings', label: 'Manage Bookings', description: 'Approve/deny bookings and view all bookings' },
    { key: 'view_analytics', label: 'View Analytics', description: 'Access analytics and reports' },
    { key: 'manage_kits', label: 'Manage Equipment Kits', description: 'Create and manage preset equipment kits' }
  ];

  return (
    <div className="admin-permissions">
      <div className="page-header">
        <h2>Admin Permissions Management</h2>
        <p className="subtitle">
          Control which features each admin can access. Master admins always have full access.
        </p>
      </div>

      <div className="warning-banner">
        ⚠️ <strong>Warning:</strong> Changes to admin permissions take effect immediately.
        Only grant permissions to trusted administrators.
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="users-table">
          <thead>
            <tr>
              <th>Admin Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              {availablePermissions.map(perm => (
                <th key={perm.key} style={{ textAlign: 'center', minWidth: '120px' }}>
                  {perm.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => {
              const permissions = admin.admin_permissions || {};
              const isMasterAdmin = admin.role === 'master_admin';

              return (
                <tr key={admin.id}>
                  <td>
                    <strong>{admin.full_name}</strong>
                    {admin.id === user.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: 'var(--primary-color)' }}>(You)</span>}
                  </td>
                  <td>{admin.email}</td>
                  <td>
                    <span className={`role-badge role-${admin.role}`}>
                      {admin.role === 'master_admin' ? 'Master Admin' : 'General Admin'}
                    </span>
                  </td>
                  <td>{admin.department}</td>

                  {availablePermissions.map(perm => (
                    <td key={perm.key} style={{ textAlign: 'center' }}>
                      {isMasterAdmin ? (
                        <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓</span>
                      ) : (
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={permissions[perm.key] || false}
                            onChange={() => togglePermission(admin.id, perm.key)}
                            data-testid={`permission-${admin.id}-${perm.key}`}
                          />
                          <span className="slider"></span>
                        </label>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flags-info" style={{ marginTop: '2rem' }}>
        <h3>Permission Descriptions</h3>
        <ul>
          {availablePermissions.map(perm => (
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
