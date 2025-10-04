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

  useEffect(() => {
    loadSettings();
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
      'staff_cross_department_requests_enabled': 'Staff Cross-Department Requests',
      'equipment_kits_enabled': 'Equipment Kits'
    };
    return names[key] || key;
  };

  const getSettingDescription = (key, description) => {
    const descriptions = {
      'cross_department_browsing_enabled': 'When enabled, students can browse and view equipment from departments other than their own. A department filter will appear in the equipment browse page.',
      'staff_cross_department_requests_enabled': 'Allow staff members to request equipment from other departments for workshops, projects, or special events.',
      'equipment_kits_enabled': 'Allow department admins to create equipment kits (bundles) that students can book as a single unit.'
    };
    return descriptions[key] || description;
  };

  const getSettingImpact = (key) => {
    const impacts = {
      'cross_department_browsing_enabled': {
        enabled: 'Students will see a school-grouped department dropdown to browse all equipment across NCAD.',
        disabled: 'Students can only view equipment from their own department (current behavior).'
      },
      'staff_cross_department_requests_enabled': {
        enabled: 'Staff can create cross-department equipment requests with smart routing based on availability.',
        disabled: 'Staff cannot request equipment from other departments.'
      },
      'equipment_kits_enabled': {
        enabled: 'Department admins can create equipment kits, students can book entire kits with auto-booking of individual items.',
        disabled: 'Kit functionality is hidden from all users.'
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

  return (
    <div className="system-settings">
      <div className="settings-header">
        <h2>System Settings</h2>
        <p className="settings-subtitle">
          Global configuration for the NCAD Equipment Booking System.
          Changes take effect immediately for all users.
        </p>
      </div>

      <div className="settings-list">
        {settings.map(setting => {
          const impact = getSettingImpact(setting.key);
          const isSaving = saving[setting.key];

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
        <ul>
          <li><strong>Cross-Department Browsing:</strong> Students will still only be able to <em>book</em> equipment from their own department unless cross-department access is explicitly granted by a department admin.</li>
          <li><strong>Staff Requests:</strong> All cross-department requests require department admin approval before equipment becomes accessible.</li>
          <li><strong>Equipment Kits:</strong> Kits are department-specific. Students can only see and book kits from their own department.</li>
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
