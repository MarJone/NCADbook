import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getDepartmentStaff,
  updateStaffViewPermissions,
  getDefaultStaffPermissions,
  bulkUpdateDepartmentStaff
} from '../../services/staffPermissions.service';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function DepartmentStaffPermissions() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStaffId, setExpandedStaffId] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadStaff();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = staff.filter(s =>
        s.full_name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query)
      );
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff(staff);
    }
  }, [searchQuery, staff]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      // Only load staff from the department admin's department
      const departmentId = user.managed_department_id;
      if (!departmentId) {
        showToast('You are not assigned to manage a department', 'error');
        return;
      }

      const staffData = await getDepartmentStaff(departmentId);
      setStaff(staffData);
      setFilteredStaff(staffData);
    } catch (error) {
      console.error('Failed to load staff:', error);
      showToast('Failed to load staff members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (staffId) => {
    if (expandedStaffId === staffId) {
      setExpandedStaffId(null);
      setEditingPermissions(null);
    } else {
      setExpandedStaffId(staffId);
      const staffMember = staff.find(s => s.id === staffId);
      setEditingPermissions(staffMember?.view_permissions || getDefaultStaffPermissions());
    }
  };

  const handlePermissionToggle = (permissionKey) => {
    setEditingPermissions(prev => ({
      ...prev,
      [permissionKey]: !prev[permissionKey]
    }));
  };

  const handleSavePermissions = async (staffId) => {
    try {
      await updateStaffViewPermissions(staffId, editingPermissions, user.email);
      showToast('Permissions updated successfully', 'success');
      await loadStaff();
      setExpandedStaffId(null);
      setEditingPermissions(null);
    } catch (error) {
      console.error('Failed to update permissions:', error);
      showToast('Failed to update permissions', 'error');
    }
  };

  const handleEnableAll = async () => {
    if (!window.confirm('Enable all permissions for all staff in your department? This cannot be undone.')) {
      return;
    }

    try {
      const allEnabledPermissions = {
        can_view_catalog: true,
        can_create_bookings: true,
        can_cancel_bookings: true,
        can_view_history: true,
        can_view_analytics: true,
        can_export_data: true,
        can_request_access: true,
        email_notifications: true,
        modified_by: user.email,
        modified_at: new Date().toISOString()
      };

      await bulkUpdateDepartmentStaff(user.managed_department_id, allEnabledPermissions);
      showToast('All staff permissions enabled', 'success');
      await loadStaff();
    } catch (error) {
      console.error('Failed to bulk update:', error);
      showToast('Failed to update all staff permissions', 'error');
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Reset all staff permissions to defaults? This cannot be undone.')) {
      return;
    }

    try {
      const defaultPermissions = getDefaultStaffPermissions();
      await bulkUpdateDepartmentStaff(user.managed_department_id, {
        ...defaultPermissions,
        modified_by: user.email,
        modified_at: new Date().toISOString()
      });
      showToast('All staff permissions reset to defaults', 'success');
      await loadStaff();
    } catch (error) {
      console.error('Failed to reset permissions:', error);
      showToast('Failed to reset permissions', 'error');
    }
  };

  const countActivePermissions = (permissions) => {
    if (!permissions) return 0;
    return Object.entries(permissions).filter(([key, value]) =>
      key.startsWith('can_') && value === true
    ).length;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading staff members...</div>;
  }

  return (
    <div className="department-staff-permissions">
      <div className="page-header">
        <h1>Manage Staff Permissions</h1>
        <p className="subtitle">Control what your department staff can see and do</p>
      </div>

      <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
        <strong>Department Restriction:</strong> You can only manage staff in YOUR department ({user.department})
      </div>

      <div className="actions-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{ flex: '1', minWidth: '250px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleEnableAll} className="btn btn-primary btn-sm">
            Enable All
          </button>
          <button onClick={handleResetToDefault} className="btn btn-secondary btn-sm">
            Reset to Default
          </button>
        </div>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="empty-state">
          <p>No staff members found in your department.</p>
        </div>
      ) : (
        <div className="staff-table-container">
          <table className="staff-permissions-table">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Email</th>
                <th>Active Permissions</th>
                <th>Last Modified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staffMember) => (
                <>
                  <tr key={staffMember.id} className={expandedStaffId === staffMember.id ? 'expanded' : ''}>
                    <td>
                      <strong>{staffMember.full_name}</strong>
                      <div style={{ fontSize: '0.85rem', color: '#666' }}>
                        {staffMember.role === 'staff' ? 'Staff Member' : staffMember.role}
                      </div>
                    </td>
                    <td>{staffMember.email}</td>
                    <td>
                      <span className="badge badge-info">
                        {countActivePermissions(staffMember.view_permissions)} / 8 enabled
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem' }}>
                        {formatDate(staffMember.view_permissions?.modified_at)}
                      </div>
                      {staffMember.view_permissions?.modified_by && (
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>
                          by {staffMember.view_permissions.modified_by}
                        </div>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleExpand(staffMember.id)}
                        className="btn btn-sm btn-secondary"
                      >
                        {expandedStaffId === staffMember.id ? 'Close' : 'Edit Permissions'}
                      </button>
                    </td>
                  </tr>

                  {expandedStaffId === staffMember.id && editingPermissions && (
                    <tr className="permissions-editor-row">
                      <td colSpan="5">
                        <div className="permissions-editor">
                          <h3>Edit Permissions for {staffMember.full_name}</h3>
                          <div className="permissions-grid">
                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={editingPermissions.can_view_catalog || false}
                                onChange={() => handlePermissionToggle('can_view_catalog')}
                              />
                              <span>
                                <strong>View Equipment Catalog</strong>
                                <small>Browse available equipment</small>
                              </span>
                            </label>

                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={editingPermissions.can_create_bookings || false}
                                onChange={() => handlePermissionToggle('can_create_bookings')}
                              />
                              <span>
                                <strong>Create Bookings</strong>
                                <small>Book equipment for projects</small>
                              </span>
                            </label>

                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={editingPermissions.can_cancel_bookings || false}
                                onChange={() => handlePermissionToggle('can_cancel_bookings')}
                              />
                              <span>
                                <strong>Cancel Own Bookings</strong>
                                <small>Cancel their own bookings</small>
                              </span>
                            </label>

                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={editingPermissions.can_view_history || false}
                                onChange={() => handlePermissionToggle('can_view_history')}
                              />
                              <span>
                                <strong>View Booking History</strong>
                                <small>Access past bookings</small>
                              </span>
                            </label>

                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={editingPermissions.can_view_analytics || false}
                                onChange={() => handlePermissionToggle('can_view_analytics')}
                              />
                              <span>
                                <strong>View Analytics Dashboard</strong>
                                <small>Read-only statistics access</small>
                              </span>
                            </label>

                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={editingPermissions.can_export_data || false}
                                onChange={() => handlePermissionToggle('can_export_data')}
                              />
                              <span>
                                <strong>Export Own Booking Data</strong>
                                <small>Download CSV reports</small>
                              </span>
                            </label>

                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={editingPermissions.can_request_access || false}
                                onChange={() => handlePermissionToggle('can_request_access')}
                              />
                              <span>
                                <strong>Request Interdepartmental Access</strong>
                                <small>Request access to other departments</small>
                              </span>
                            </label>

                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={editingPermissions.email_notifications || false}
                                onChange={() => handlePermissionToggle('email_notifications')}
                              />
                              <span>
                                <strong>Receive Email Notifications</strong>
                                <small>Get booking status updates</small>
                              </span>
                            </label>
                          </div>

                          <div className="permissions-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setExpandedStaffId(null);
                                setEditingPermissions(null);
                              }}
                              className="btn btn-secondary"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSavePermissions(staffMember.id)}
                              className="btn btn-primary"
                            >
                              Save Permissions
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
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

      <style jsx>{`
        .department-staff-permissions {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #666;
          font-size: 1rem;
        }

        .staff-table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .staff-permissions-table {
          width: 100%;
          border-collapse: collapse;
        }

        .staff-permissions-table th {
          background: #f5f5f5;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          border-bottom: 2px solid #ddd;
        }

        .staff-permissions-table td {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .staff-permissions-table tbody tr:hover {
          background: #f9f9f9;
        }

        .staff-permissions-table tbody tr.expanded {
          background: #f0f7ff;
        }

        .permissions-editor-row {
          background: white !important;
        }

        .permissions-editor {
          padding: 2rem;
          background: #f9f9f9;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
        }

        .permissions-editor h3 {
          margin-bottom: 1.5rem;
          color: #333;
        }

        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .permission-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .permission-item:hover {
          border-color: #007bff;
          box-shadow: 0 2px 8px rgba(0,123,255,0.1);
        }

        .permission-item input[type="checkbox"] {
          margin-top: 0.25rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .permission-item span {
          flex: 1;
        }

        .permission-item strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #333;
        }

        .permission-item small {
          display: block;
          color: #666;
          font-size: 0.875rem;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge-info {
          background: #e3f2fd;
          color: #1976d2;
        }

        .alert {
          padding: 1rem;
          border-radius: 6px;
          border-left: 4px solid;
        }

        .alert-warning {
          background: #fff3cd;
          border-color: #ffc107;
          color: #856404;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .department-staff-permissions {
            padding: 1rem;
          }

          .permissions-grid {
            grid-template-columns: 1fr;
          }

          .actions-bar {
            flex-direction: column;
            align-items: stretch !important;
          }

          .search-input {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
