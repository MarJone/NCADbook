import { useState, useEffect } from 'react';
import { getAllSystemSettings, updateSystemSetting } from '../../services/systemSettings.service';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import '../../styles/system-settings.css';

export default function SystemSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const { toasts, showToast, removeToast } = useToast();
  const [departmentAccess, setDepartmentAccess] = useState({});
  const [showAccessMatrix, setShowAccessMatrix] = useState(false);

  // NCAD departments
  const departments = [
    'Communication Design',
    'Moving Image Design',
    'Illustration',
    'Fashion Design',
    'Fine Art',
    'Visual Culture'
  ];

  useEffect(() => {
    loadSettings();
    loadDepartmentAccess();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const allSettings = await getAllSystemSettings();
      setSettings(allSettings);
    } catch (error) {
      console.error('Failed to load system settings:', error);
      showToast('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentAccess = () => {
    // Load from localStorage for demo mode
    const saved = localStorage.getItem('ncadbook_department_access');
    if (saved) {
      setDepartmentAccess(JSON.parse(saved));
    } else {
      // Initialize with no access by default
      const initialAccess = {};
      departments.forEach(dept => {
        initialAccess[dept] = [];
      });
      setDepartmentAccess(initialAccess);
    }
  };

  const saveDepartmentAccess = (newAccess) => {
    localStorage.setItem('ncadbook_department_access', JSON.stringify(newAccess));
    setDepartmentAccess(newAccess);
  };

  const toggleDepartmentAccess = (requestingDept, targetDept) => {
    const currentAccess = departmentAccess[requestingDept] || [];
    const hasAccess = currentAccess.includes(targetDept);

    const newAccess = {
      ...departmentAccess,
      [requestingDept]: hasAccess
        ? currentAccess.filter(d => d !== targetDept)
        : [...currentAccess, targetDept]
    };

    saveDepartmentAccess(newAccess);
    showToast(
      `${requestingDept} ${hasAccess ? 'removed from' : 'granted access to'} ${targetDept} equipment`,
      'success'
    );
  };

  const handleToggle = async (settingKey, currentValue) => {
    setSaving({ ...saving, [settingKey]: true });
    try {
      const newValue = !currentValue;
      await updateSystemSetting(settingKey, newValue, user.id);

      // Update local state
      setSettings(settings.map(s =>
        s.key === settingKey
          ? { ...s, value: newValue, modified_by: user.id, modified_at: new Date().toISOString() }
          : s
      ));

      showToast(`Setting updated successfully`, 'success');
    } catch (error) {
      console.error('Failed to update setting:', error);
      showToast('Failed to update setting', 'error');
    } finally {
      setSaving({ ...saving, [settingKey]: false });
    }
  };

  const getSettingDisplayName = (key) => {
    const names = {
      'cross_department_browsing_enabled': 'Cross-Department Equipment Browsing',
      'cross_department_booking_enabled': 'Cross-Department Equipment Booking',
      'cross_department_approval_required': 'Cross-Department Approval Required',
      'staff_cross_department_requests_enabled': 'Staff Cross-Department Requests',
      'equipment_kits_enabled': 'Equipment Kits',
      'room_bookings_visible_staff': 'Room Bookings - Staff Portal',
      'room_bookings_visible_dept_admin': 'Room Bookings - Department Admin Portal',
      'room_bookings_enabled': 'Room Bookings System'
    };
    return names[key] || key;
  };

  const getSettingDescription = (key, description) => {
    const descriptions = {
      'cross_department_browsing_enabled': 'When enabled, students can browse and view equipment from departments other than their own. A department filter will appear in the equipment browse page.',
      'cross_department_booking_enabled': 'Allow students to book equipment from other departments. This setting works in conjunction with browsing and requires department admin approval unless auto-approval is enabled.',
      'cross_department_approval_required': 'When enabled, all cross-department bookings require explicit approval from the equipment\'s department admin. When disabled, bookings are auto-approved if the equipment is available.',
      'staff_cross_department_requests_enabled': 'Allow staff members to request equipment from other departments for workshops, projects, or special events.',
      'equipment_kits_enabled': 'Allow department admins to create equipment kits (bundles) that students can book as a single unit.',
      'room_bookings_visible_staff': 'Show room booking functionality in the Staff portal. Staff can view, create, and manage room bookings for their department.',
      'room_bookings_visible_dept_admin': 'Show room booking functionality in the Department Admin portal. Admins can view, approve, and manage room bookings.',
      'room_bookings_enabled': 'Master toggle for the entire room bookings system. When disabled, room bookings are hidden from all portals.'
    };
    return descriptions[key] || description;
  };

  const getSettingImpact = (key) => {
    const impacts = {
      'cross_department_browsing_enabled': {
        enabled: 'Students will see a department dropdown to browse all equipment across NCAD. Department admins can control booking permissions.',
        disabled: 'Students can only view equipment from their own department.'
      },
      'cross_department_booking_enabled': {
        enabled: 'Students can request equipment from other departments. Booking availability is controlled by department admins.',
        disabled: 'Students can only book equipment from their own department, even if browsing is enabled.'
      },
      'cross_department_approval_required': {
        enabled: 'All cross-department bookings go to "pending" status and require explicit department admin approval.',
        disabled: 'Cross-department bookings are auto-approved if equipment is available (still subject to department admin access control).'
      },
      'staff_cross_department_requests_enabled': {
        enabled: 'Staff can create cross-department equipment requests with smart routing based on availability.',
        disabled: 'Staff cannot request equipment from other departments.'
      },
      'equipment_kits_enabled': {
        enabled: 'Department admins can create equipment kits, students can book entire kits with auto-booking of individual items.',
        disabled: 'Kit functionality is hidden from all users.'
      },
      'room_bookings_visible_staff': {
        enabled: 'Room Bookings tab appears in Staff portal. Staff can create and manage room bookings.',
        disabled: 'Room bookings are hidden from Staff portal, even if the system is enabled.'
      },
      'room_bookings_visible_dept_admin': {
        enabled: 'Room Bookings section appears in Department Admin portal with approval and management features.',
        disabled: 'Room bookings are hidden from Department Admin portal, even if the system is enabled.'
      },
      'room_bookings_enabled': {
        enabled: 'Room bookings system is active. Visibility in portals is controlled by individual portal settings.',
        disabled: 'Room bookings system is completely disabled across all portals.'
      }
    };
    return impacts[key] || {};
  };

  if (loading) {
    return (
      <div className="system-settings">
        <h2>System Settings</h2>
        <div className="loading-state">
          <p>Loading system settings...</p>
        </div>
      </div>
    );
  }

  const handleResetDemoData = () => {
    if (confirm('This will reset all demo data including the new system settings. Continue?')) {
      localStorage.removeItem('ncadbook_demo_data');
      window.location.reload();
    }
  };

  return (
    <div className="system-settings">
      <div className="settings-header">
        <div>
          <h2>System Settings</h2>
          <p className="settings-subtitle">
            Global configuration for the NCAD Equipment Booking System.
            Changes take effect immediately for all users.
          </p>
        </div>
        <button onClick={handleResetDemoData} className="btn-reset-demo" title="Reset demo data to load new settings">
          🔄 Reset Demo Data
        </button>
      </div>

      <div className="settings-list">
        {settings.map(setting => {
          const impact = getSettingImpact(setting.key);
          const isSaving = saving[setting.key];
          const isCrossDeptBrowsing = setting.key === 'cross_department_browsing_enabled';
          const isCrossDeptEnabled = setting.value === true || setting.value === 'true';

          return (
            <div key={setting.key} className="setting-card">
              <div className="setting-header">
                <div className="setting-info">
                  <h3>{getSettingDisplayName(setting.key)}</h3>
                  <p className="setting-description">
                    {getSettingDescription(setting.key, setting.description)}
                  </p>
                </div>
                <div className="setting-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={setting.value === true || setting.value === 'true'}
                      onChange={() => handleToggle(setting.key, setting.value)}
                      disabled={isSaving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`toggle-label ${setting.value ? 'enabled' : 'disabled'}`}>
                    {isSaving ? 'Saving...' : (setting.value ? 'Enabled' : 'Disabled')}
                  </span>
                </div>
              </div>

              {impact && (
                <div className="setting-impact">
                  <div className={`impact-message ${setting.value ? 'active' : 'inactive'}`}>
                    <strong>{setting.value ? '✓ Active:' : '○ Inactive:'}</strong>
                    <span>{setting.value ? impact.enabled : impact.disabled}</span>
                  </div>
                </div>
              )}

              {/* Department Access Matrix - only for cross-department browsing when enabled */}
              {isCrossDeptBrowsing && isCrossDeptEnabled && (
                <div className="department-access-matrix">
                  <div className="matrix-header">
                    <h4>Department Equipment Access Control</h4>
                    <p>Configure which departments can access equipment from other departments</p>
                  </div>

                  <div className="matrix-table-wrapper">
                    <table className="access-matrix-table">
                      <thead>
                        <tr>
                          <th className="department-column">Requesting Department</th>
                          <th colSpan={departments.length} className="access-column-header">
                            Can Access Equipment From
                          </th>
                        </tr>
                        <tr>
                          <th></th>
                          {departments.map(dept => (
                            <th key={dept} className="target-dept">
                              {dept.split(' ')[0]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map(requestingDept => (
                          <tr key={requestingDept}>
                            <td className="requesting-dept-name">{requestingDept}</td>
                            {departments.map(targetDept => {
                              const isOwnDept = requestingDept === targetDept;
                              const hasAccess = departmentAccess[requestingDept]?.includes(targetDept);

                              return (
                                <td key={targetDept} className="access-cell">
                                  {isOwnDept ? (
                                    <span className="own-dept-indicator" title="Own department - always has access">
                                      ✓
                                    </span>
                                  ) : (
                                    <label className="access-checkbox">
                                      <input
                                        type="checkbox"
                                        checked={hasAccess || false}
                                        onChange={() => toggleDepartmentAccess(requestingDept, targetDept)}
                                        title={`Allow ${requestingDept} to access ${targetDept} equipment`}
                                      />
                                      <span className="checkmark"></span>
                                    </label>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="matrix-legend">
                    <div className="legend-item">
                      <span className="legend-icon own">✓</span>
                      <span>Own department (always has access)</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-icon checked">☑</span>
                      <span>Has access to equipment</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-icon unchecked">☐</span>
                      <span>No access</span>
                    </div>
                  </div>
                </div>
              )}

              {setting.modified_at && (
                <div className="setting-metadata">
                  <small>
                    Last modified: {new Date(setting.modified_at).toLocaleString()}
                  </small>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="settings-warning">
        <h4>⚠️ Important Notes</h4>
        <div className="settings-info-sections">
          <div className="info-section">
            <h5>Cross-Department Equipment Access</h5>
            <ul>
              <li><strong>Browsing:</strong> Allows students to <em>view</em> equipment from all departments via a dropdown filter.</li>
              <li><strong>Booking:</strong> Allows students to <em>request bookings</em> for equipment from other departments.</li>
              <li><strong>Approval:</strong> Controls whether cross-department bookings are auto-approved or require manual approval.</li>
              <li><strong>Department Control:</strong> Department admins can grant/revoke individual student access via the Cross-Department Access management page.</li>
            </ul>
          </div>

          <div className="info-section">
            <h5>Room Bookings Visibility</h5>
            <ul>
              <li><strong>Master Toggle:</strong> The "Room Bookings System" setting controls the entire feature across all portals.</li>
              <li><strong>Staff Portal:</strong> When enabled, staff can view and create room bookings for their department.</li>
              <li><strong>Dept Admin Portal:</strong> When enabled, department admins can approve, manage, and view all room bookings.</li>
              <li><strong>Recommended:</strong> Enable master toggle first, then selectively enable for each portal as needed.</li>
            </ul>
          </div>

          <div className="info-section">
            <h5>Other Settings</h5>
            <ul>
              <li><strong>Staff Requests:</strong> All cross-department requests require department admin approval before equipment becomes accessible.</li>
              <li><strong>Equipment Kits:</strong> Kits are department-specific. Students can only see and book kits from their own department.</li>
            </ul>
          </div>
        </div>
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
