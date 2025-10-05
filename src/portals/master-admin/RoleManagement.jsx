import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';
import '../../styles/role-management.css';

// Demo mode feature flags
const demoFeatureFlags = [
  {
    id: 1,
    feature_key: 'role_view_only_staff',
    feature_name: 'View-Only Staff',
    description: 'Read-only access to equipment catalog for teaching faculty',
    is_enabled: true,
    created_at: '2024-03-01'
  },
  {
    id: 2,
    feature_key: 'role_accounts_officer',
    feature_name: 'Accounts Officer',
    description: 'Financial reporting, cost analysis, and budget tracking',
    is_enabled: true,
    created_at: '2024-03-01'
  },
  {
    id: 3,
    feature_key: 'role_payroll_coordinator',
    feature_name: 'Payroll Coordinator',
    description: 'Staff cost center allocations and payroll data exports',
    is_enabled: true,
    created_at: '2024-03-01'
  },
  {
    id: 4,
    feature_key: 'role_it_support_technician',
    feature_name: 'IT Support Technician',
    description: 'Equipment management, system logs, and technical functions',
    is_enabled: true,
    created_at: '2024-03-01'
  },
  {
    id: 5,
    feature_key: 'role_budget_manager',
    feature_name: 'Budget Manager',
    description: 'Budget tracking, cost forecasting, and financial planning',
    is_enabled: true,
    created_at: '2024-03-01'
  },
  {
    id: 6,
    feature_key: 'feature_financial_management',
    feature_name: 'Financial Management Module',
    description: 'Equipment costs, depreciation tracking, and financial reports',
    is_enabled: true,
    created_at: '2024-03-01',
    metadata: { components: ['Cost tracking', 'Depreciation', 'TCO calculations'] }
  },
  {
    id: 7,
    feature_key: 'feature_payroll_tracking',
    feature_name: 'Payroll Tracking Module',
    description: 'Staff allocations, cost centers, and payroll exports',
    is_enabled: true,
    created_at: '2024-03-01',
    metadata: { components: ['Cost centers', 'Staff allocations', 'Payroll exports'] }
  },
  {
    id: 8,
    feature_key: 'feature_it_asset_lifecycle',
    feature_name: 'IT Asset Lifecycle Module',
    description: 'Equipment lifecycle management and system logging',
    is_enabled: true,
    created_at: '2024-03-01',
    metadata: { components: ['Asset tracking', 'Maintenance logs', 'System diagnostics'] }
  },
  {
    id: 9,
    feature_key: 'feature_budget_analytics',
    feature_name: 'Budget Analytics Module',
    description: 'Budget forecasting, variance tracking, and spending analysis',
    is_enabled: true,
    created_at: '2024-03-01',
    metadata: { components: ['Budget forecasting', 'Variance tracking', 'Trend analysis'] }
  }
];

export default function RoleManagement() {
  const { user } = useAuth();
  const [featureFlags, setFeatureFlags] = useState(demoFeatureFlags);
  const [loading, setLoading] = useState(false);
  const [userCounts, setUserCounts] = useState({
    view_only_staff: 1,
    accounts_officer: 1,
    payroll_coordinator: 1,
    it_support_technician: 1,
    budget_manager: 1
  });
  const [activityLog, setActivityLog] = useState([]);
  const { toasts, showToast, removeToast } = useToast();

  const loadFeatureFlags = () => {
    // Using demo data - no async needed
    setFeatureFlags(demoFeatureFlags);
  };

  const loadUserCounts = () => {
    // Demo user counts
    setUserCounts({
      view_only_staff: 1,
      accounts_officer: 1,
      payroll_coordinator: 1,
      it_support_technician: 1,
      budget_manager: 1
    });
  };

  const loadActivityLog = () => {
    // Demo activity log
    setActivityLog([]);
  };

  const handleToggleFeature = (featureKey, currentEnabled) => {
    const flag = featureFlags.find(f => f.feature_key === featureKey);
    const action = currentEnabled ? 'disable' : 'enable';

    if (currentEnabled) {
      const confirmMsg = `Disable "${flag.feature_name}"?\n\nThis will immediately block access for all users with this role/feature.`;
      if (!window.confirm(confirmMsg)) return;
    }

    // Demo mode: Update state locally
    const updatedFlags = featureFlags.map(f =>
      f.feature_key === featureKey
        ? { ...f, is_enabled: !currentEnabled, updated_at: new Date().toISOString() }
        : f
    );

    setFeatureFlags(updatedFlags);
    showToast(`${flag.feature_name} ${action}d successfully (Demo Mode)`, 'success');
  };

  const handleDisableAllRoles = () => {
    if (!window.confirm('Disable ALL advanced roles?\n\nThis will immediately disable View-Only Staff, Accounts Officer, Payroll Coordinator, IT Support, and Budget Manager roles.')) {
      return;
    }

    const roleKeys = featureFlags
      .filter(f => f.feature_key.startsWith('role_') && !['role_student', 'role_general_admin', 'role_master_admin'].includes(f.feature_key))
      .map(f => f.feature_key);

    // Demo mode: Update all at once
    const updatedFlags = featureFlags.map(f =>
      roleKeys.includes(f.feature_key)
        ? { ...f, is_enabled: false, updated_at: new Date().toISOString() }
        : f
    );

    setFeatureFlags(updatedFlags);
    showToast('All advanced roles disabled (Demo Mode)', 'success');
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

  // Show error state if no feature flags loaded
  if (featureFlags.length === 0) {
    return (
      <div className="role-management-error">
        <h2>⚠️ Database Connection Error</h2>
        <p>Unable to load feature flags from Supabase.</p>
        <div className="error-instructions">
          <h3>To fix this:</h3>
          <ol>
            <li>Open your Supabase project dashboard</li>
            <li>Go to Project Settings → API</li>
            <li>Copy your Project URL and anon key</li>
            <li>Update <code>.env.local</code> with your credentials</li>
            <li>Restart the dev server (<code>npm run dev</code>)</li>
          </ol>
          <p className="check-console">Check the browser console for detailed errors.</p>
        </div>
      </div>
    );
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
