import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './PolicyManager.css';

export default function PolicyManager() {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRules();
  }, [filter]);

  const loadRules = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filter !== 'all') {
        queryParams.append('rule_type', filter);
      }

      const response = await fetch(`/api/policies/rules?${queryParams}`);
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error('Failed to load policy rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (ruleId, currentStatus) => {
    try {
      await fetch(`/api/policies/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      loadRules();
    } catch (error) {
      console.error('Failed to toggle rule status:', error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this policy rule?')) return;

    try {
      await fetch(`/api/policies/rules/${ruleId}`, {
        method: 'DELETE'
      });
      loadRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const getRuleTypeIcon = (type) => {
    const icons = {
      weekly_limit: '📅',
      concurrent_limit: '🔢',
      training_required: '🎓',
      blackout_period: '🚫'
    };
    return icons[type] || '📋';
  };

  const getRuleTypeLabel = (type) => {
    const labels = {
      weekly_limit: 'Weekly Limit',
      concurrent_limit: 'Concurrent Limit',
      training_required: 'Training Required',
      blackout_period: 'Blackout Period'
    };
    return labels[type] || type;
  };

  const formatRuleConfig = (type, config) => {
    switch (type) {
      case 'weekly_limit':
        return `Max ${config.max_bookings} bookings per ${config.per_days || 7} days`;
      case 'concurrent_limit':
        return `Max ${config.max_concurrent} concurrent bookings`;
      case 'training_required':
        return `Training: ${config.training_name || config.training_id}`;
      case 'blackout_period':
        return `${config.start_date} to ${config.end_date}`;
      default:
        return JSON.stringify(config);
    }
  };

  if (loading) {
    return (
      <div className="policy-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading policy rules...</p>
      </div>
    );
  }

  return (
    <div className="policy-manager">
      {/* Header */}
      <div className="policy-header">
        <div className="policy-header-content">
          <h2>Policy Enforcement Rules</h2>
          <p className="policy-description">
            Configure booking limits, training requirements, and access restrictions
          </p>
        </div>
        <button
          className="btn-create-rule"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Rule
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="policy-filters">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Rules ({rules.length})
        </button>
        <button
          className={`filter-tab ${filter === 'weekly_limit' ? 'active' : ''}`}
          onClick={() => setFilter('weekly_limit')}
        >
          📅 Weekly Limits
        </button>
        <button
          className={`filter-tab ${filter === 'concurrent_limit' ? 'active' : ''}`}
          onClick={() => setFilter('concurrent_limit')}
        >
          🔢 Concurrent Limits
        </button>
        <button
          className={`filter-tab ${filter === 'training_required' ? 'active' : ''}`}
          onClick={() => setFilter('training_required')}
        >
          🎓 Training Required
        </button>
        <button
          className={`filter-tab ${filter === 'blackout_period' ? 'active' : ''}`}
          onClick={() => setFilter('blackout_period')}
        >
          🚫 Blackout Periods
        </button>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Policy Rules Found</h3>
          <p>Create your first policy rule to start enforcing booking limits</p>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Policy Rule
          </button>
        </div>
      ) : (
        <div className="rules-grid">
          {rules.map(rule => (
            <div
              key={rule.id}
              className={`rule-card ${rule.is_active ? 'active' : 'inactive'}`}
            >
              <div className="rule-card-header">
                <div className="rule-title-section">
                  <span className="rule-icon">{getRuleTypeIcon(rule.rule_type)}</span>
                  <div>
                    <h3 className="rule-name">{rule.rule_name}</h3>
                    <span className="rule-type-badge">
                      {getRuleTypeLabel(rule.rule_type)}
                    </span>
                  </div>
                </div>
                <div className="rule-actions">
                  <button
                    className={`btn-toggle ${rule.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(rule.id, rule.is_active)}
                    title={rule.is_active ? 'Deactivate rule' : 'Activate rule'}
                  >
                    {rule.is_active ? '✓ Active' : '○ Inactive'}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setEditingRule(rule)}
                    title="Edit rule"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDeleteRule(rule.id)}
                    title="Delete rule"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {rule.description && (
                <p className="rule-description">{rule.description}</p>
              )}

              <div className="rule-config">
                <strong>Configuration:</strong> {formatRuleConfig(rule.rule_type, rule.rule_config)}
              </div>

              <div className="rule-scope">
                <div className="scope-item">
                  <span className="scope-label">Role:</span>
                  <span className="scope-value">
                    {rule.applies_to_role || 'All roles'}
                  </span>
                </div>
                {rule.applies_to_department && (
                  <div className="scope-item">
                    <span className="scope-label">Department:</span>
                    <span className="scope-value">{rule.applies_to_department}</span>
                  </div>
                )}
                {rule.applies_to_equipment_category && (
                  <div className="scope-item">
                    <span className="scope-label">Category:</span>
                    <span className="scope-value">{rule.applies_to_equipment_category}</span>
                  </div>
                )}
                <div className="scope-item">
                  <span className="scope-label">Priority:</span>
                  <span className="scope-value priority-badge">{rule.priority}</span>
                </div>
              </div>

              {rule.exempted_users && rule.exempted_users.length > 0 && (
                <div className="rule-exemptions">
                  <span className="exemptions-label">
                    🔓 {rule.exempted_users.length} exempted user(s)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal (placeholder - full implementation in separate component) */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Policy Rule</h3>
              <button
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="coming-soon">
                Policy rule creation form coming soon...
              </p>
              <p className="help-text">
                For now, use the API directly to create rules:
                <code>POST /api/policies/rules</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRule && (
        <div className="modal-overlay" onClick={() => setEditingRule(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Policy Rule</h3>
              <button
                className="btn-close"
                onClick={() => setEditingRule(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="coming-soon">
                Policy rule editing form coming soon...
              </p>
              <pre className="rule-json">
                {JSON.stringify(editingRule, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
