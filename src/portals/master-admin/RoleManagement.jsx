import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';
import '../../styles/role-management.css';

export default function RoleManagement() {
  const { user } = useAuth();
  const [featureFlags, setFeatureFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCounts, setUserCounts] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadFeatureFlags();
    loadUserCounts();
    loadActivityLog();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const { data, error } = await supabase
        .from('system_feature_flags')
        .select('*')
        .order('feature_key');

      if (error) throw error;
      setFeatureFlags(data || []);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      showToast('Failed to load feature flags', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role');

      if (error) throw error;

      const counts = (data || []).reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      setUserCounts(counts);
    } catch (error) {
      console.error('Error loading user counts:', error);
    }
  };

  const loadActivityLog = async () => {
    try {
      const { data, error} = await supabase
        .from('admin_actions')
        .select(`
          *,
          users:admin_id (full_name)
        `)
        .eq('action_type', 'feature_flag_update')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivityLog(data || []);
    } catch (error) {
      console.error('Error loading activity log:', error);
    }
  };

  const handleToggleFeature = async (featureKey, currentEnabled) => {
    const flag = featureFlags.find(f => f.feature_key === featureKey);
    const action = currentEnabled ? 'disable' : 'enable';

    if (currentEnabled) {
      const confirmMsg = `Disable "${flag.feature_name}"?\n\nThis will immediately block access for all users with this role/feature.`;
      if (!window.confirm(confirmMsg)) return;
    }

    try {
      // Update feature flag
      const { error: updateError } = await supabase
        .from('system_feature_flags')
        .update({
          is_enabled: !currentEnabled,
          enabled_by: !currentEnabled ? user.id : null,
          updated_at: new Date().toISOString()
        })
        .eq('feature_key', featureKey);

      if (updateError) throw updateError;

      // Log the action
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert({
          admin_id: user.id,
          action_type: 'feature_flag_update',
          target_type: 'system_configuration',
          target_id: flag.id,
          details: {
            feature_key: featureKey,
            feature_name: flag.feature_name,
            action: action,
            new_status: !currentEnabled ? 'enabled' : 'disabled',
            timestamp: new Date().toISOString()
          }
        });

      if (logError) console.error('Failed to log action:', logError);

      // Reload data
      await loadFeatureFlags();
      await loadActivityLog();

      showToast(`${flag.feature_name} ${action}d successfully`, 'success');
    } catch (error) {
      console.error('Error toggling feature:', error);
      showToast(`Failed to ${action} feature`, 'error');
    }
  };

  const handleDisableAllRoles = async () => {
    if (!window.confirm('Disable ALL advanced roles?\n\nThis will immediately disable View-Only Staff, Accounts Officer, Payroll Coordinator, IT Support, and Budget Manager roles.')) {
      return;
    }

    const roleKeys = featureFlags
      .filter(f => f.feature_key.startsWith('role_') && !['role_student', 'role_general_admin', 'role_master_admin'].includes(f.feature_key))
      .map(f => f.feature_key);

    try {
      for (const key of roleKeys) {
        await handleToggleFeature(key, true);
      }
      showToast('All advanced roles disabled', 'success');
    } catch (error) {
      showToast('Failed to disable all roles', 'error');
    }
  };

  const getRoleIcon = (key) => {
    const icons = {
      'role_view_only_staff': '👀',
      'role_accounts_officer': '💰',
      'role_payroll_coordinator': '⏱️',
      'role_it_support_technician': '🔧',
      'role_budget_manager': '📊',
      'feature_financial_management': '📈',
      'feature_payroll_tracking': '⏲️',
      'feature_it_asset_lifecycle': '🛠️',
      'feature_budget_analytics': '📉'
    };
    return icons[key] || '⚙️';
  };

  const getRequiredDependency = (key) => {
    const deps = {
      'role_accounts_officer': 'feature_financial_management',
      'role_payroll_coordinator': 'feature_payroll_tracking',
      'role_it_support_technician': 'feature_it_asset_lifecycle',
      'role_budget_manager': 'feature_budget_analytics'
    };
    return deps[key];
  };

  const isDependencyEnabled = (key) => {
    const dep = getRequiredDependency(key);
    if (!dep) return true;
    const depFlag = featureFlags.find(f => f.feature_key === dep);
    return depFlag?.is_enabled || false;
  };

  if (loading) {
    return <div className="loading">Loading role management...</div>;
  }

  const roleFlags = featureFlags.filter(f => f.feature_key.startsWith('role_'));
  const moduleFlags = featureFlags.filter(f => f.feature_key.startsWith('feature_'));
  const enabledCount = featureFlags.filter(f => f.is_enabled).length;

  return (
    <div className="role-management">
      {/* Header */}
      <div className="role-management-header">
        <div>
          <h2>🎭 Role Management</h2>
          <p className="subtitle">
            Activate/deactivate advanced user roles and feature modules. Test each role in demo portals.
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-value">{enabledCount}</div>
            <div className="stat-label">Features Enabled</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Object.keys(userCounts).length}</div>
            <div className="stat-label">Active Roles</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => loadFeatureFlags()} className="btn btn-secondary">
          🔄 Refresh Status
        </button>
        <button onClick={handleDisableAllRoles} className="btn btn-danger">
          ⚠️ Disable All Advanced Roles
        </button>
      </div>

      {/* User Roles Section */}
      <section className="role-section">
        <div className="section-header">
          <h3>👥 User Roles</h3>
          <p>Toggle availability of advanced user roles in the system</p>
        </div>

        <div className="role-grid">
          {roleFlags.map(flag => {
            const roleName = flag.feature_key.replace('role_', '');
            const userCount = userCounts[roleName] || 0;
            const dependency = getRequiredDependency(flag.feature_key);
            const depEnabled = isDependencyEnabled(flag.feature_key);
            const canEnable = !flag.is_enabled ? depEnabled : true;

            return (
              <div
                key={flag.feature_key}
                className={`role-card ${flag.is_enabled ? 'enabled' : 'disabled'}`}
              >
                <div className="role-card-header">
                  <div className="role-icon">{getRoleIcon(flag.feature_key)}</div>
                  <div className="role-info">
                    <h4>{flag.feature_name}</h4>
                    <span className={`status-badge ${flag.is_enabled ? 'status-enabled' : 'status-disabled'}`}>
                      {flag.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={flag.is_enabled}
                      onChange={() => handleToggleFeature(flag.feature_key, flag.is_enabled)}
                      disabled={!canEnable && !flag.is_enabled}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <p className="role-description">{flag.description}</p>

                <div className="role-meta">
                  <div className="meta-item">
                    <strong>Users:</strong> <span>{userCount}</span>
                  </div>
                  {dependency && (
                    <div className={`meta-item dependency ${depEnabled ? 'met' : 'unmet'}`}>
                      <strong>Requires:</strong>
                      <span>{featureFlags.find(f => f.feature_key === dependency)?.feature_name || dependency}</span>
                      {!depEnabled && <span className="warning-icon">⚠️</span>}
                    </div>
                  )}
                </div>

                {/* Demo Portal Link */}
                {flag.is_enabled && (
                  <Link
                    to={`/demo/${roleName}`}
                    className="btn btn-demo"
                  >
                    🚀 Test Demo Portal
                  </Link>
                )}

                {!canEnable && !flag.is_enabled && (
                  <div className="warning-message">
                    ⚠️ Enable {featureFlags.find(f => f.feature_key === dependency)?.feature_name} first
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Modules Section */}
      <section className="role-section">
        <div className="section-header">
          <h3>⚙️ Feature Modules</h3>
          <p>Core functionality modules that power advanced roles</p>
        </div>

        <div className="role-grid">
          {moduleFlags.map(flag => {
            const metadata = flag.metadata || {};
            const components = metadata.components || [];

            return (
              <div
                key={flag.feature_key}
                className={`role-card ${flag.is_enabled ? 'enabled' : 'disabled'}`}
              >
                <div className="role-card-header">
                  <div className="role-icon">{getRoleIcon(flag.feature_key)}</div>
                  <div className="role-info">
                    <h4>{flag.feature_name}</h4>
                    <span className={`status-badge ${flag.is_enabled ? 'status-enabled' : 'status-disabled'}`}>
                      {flag.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={flag.is_enabled}
                      onChange={() => handleToggleFeature(flag.feature_key, flag.is_enabled)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <p className="role-description">{flag.description}</p>

                {components.length > 0 && (
                  <div className="role-meta">
                    <div className="meta-item">
                      <strong>Components:</strong>
                      <span>{components.join(', ')}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity Log */}
      <section className="role-section">
        <div className="section-header">
          <h3>📜 Recent Configuration Changes</h3>
          <p>Last 20 role/feature modifications</p>
        </div>

        <div className="activity-log">
          {activityLog.length === 0 ? (
            <p className="empty-state">No configuration changes recorded yet</p>
          ) : (
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Admin</th>
                  <th>Feature/Role</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activityLog.map(log => {
                  const details = log.details || {};
                  return (
                    <tr key={log.id}>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                      <td>{log.users?.full_name || 'Unknown'}</td>
                      <td>{details.feature_name || details.feature_key || '—'}</td>
                      <td>{details.action || 'Update'}</td>
                      <td>
                        <span className={`status-badge ${details.new_status === 'enabled' ? 'status-enabled' : 'status-disabled'}`}>
                          {details.new_status || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Toast Notifications */}
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
