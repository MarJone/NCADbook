import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';

export default function FeatureFlagManager() {
  const { user } = useAuth();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const data = await demoMode.query('featureFlags');
      setFlags(data);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (flagId) => {
    if (user.role !== 'master_admin') {
      alert('Only master admins can toggle feature flags');
      return;
    }

    try {
      const flag = flags.find(f => f.id === flagId);
      await demoMode.update('featureFlags', { id: flagId }, {
        enabled: !flag.enabled,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      });

      await loadFlags();
      alert(`Feature flag ${!flag.enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      alert('Failed to toggle feature flag: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading feature flags...</div>;
  }

  return (
    <div className="feature-flags">
      <h2>Feature Flag Management</h2>
      <p className="subtitle">Control system-wide features and access</p>

      {user.role !== 'master_admin' && (
        <div className="warning-banner">
          ⚠️ You are viewing feature flags in read-only mode. Only Master Admins can toggle flags.
        </div>
      )}

      <div className="flags-list">
        {flags.map(flag => (
          <div key={flag.id} className="flag-item">
            <div className="flag-info">
              <h3>{flag.name.replace(/_/g, ' ').toUpperCase()}</h3>
              <p className="flag-description">{flag.description}</p>
              <p className="flag-meta">
                <span className="role-badge">{flag.required_role}</span>
              </p>
            </div>

            <div className="flag-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={flag.enabled}
                  onChange={() => handleToggle(flag.id)}
                  disabled={user.role !== 'master_admin'}
                />
                <span className="slider"></span>
              </label>
              <span className={flag.enabled ? 'status-enabled' : 'status-disabled'}>
                {flag.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flags-info">
        <h3>About Feature Flags</h3>
        <ul>
          <li><strong>Room Booking:</strong> Allows staff to book rooms and spaces by the hour</li>
          <li><strong>Analytics Export:</strong> Enables CSV/PDF export of analytics data</li>
          <li><strong>CSV Import:</strong> Allows bulk import of users and equipment</li>
          <li><strong>Interdisciplinary Access:</strong> Permits cross-department equipment borrowing</li>
          <li><strong>Advanced Reporting:</strong> Unlocks detailed reporting features</li>
        </ul>
      </div>
    </div>
  );
}
