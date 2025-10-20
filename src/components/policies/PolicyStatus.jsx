import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './PolicyStatus.css';

/**
 * PolicyStatus Component
 * Displays user's current policy status (weekly limit, concurrent limit, etc.)
 * Shows in booking flow to help users understand their booking eligibility
 */
export default function PolicyStatus({ equipmentId = null, category = null }) {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPolicyStatus();
    }
  }, [user, equipmentId, category]);

  const loadPolicyStatus = async () => {
    try {
      // Check weekly limit
      const weeklyParams = new URLSearchParams();
      if (equipmentId) weeklyParams.append('equipmentId', equipmentId);
      if (category) weeklyParams.append('category', category);

      const weeklyResponse = await fetch(
        `/api/policies/check-weekly-limit/${user.id}?${weeklyParams}`
      );
      const weeklyData = await weeklyResponse.json();

      // Check concurrent limit
      const concurrentParams = new URLSearchParams();
      if (equipmentId) concurrentParams.append('equipmentId', equipmentId);
      if (category) concurrentParams.append('category', category);

      const concurrentResponse = await fetch(
        `/api/policies/check-concurrent-limit/${user.id}?${concurrentParams}`
      );
      const concurrentData = await concurrentResponse.json();

      // Check training requirement
      const trainingParams = new URLSearchParams();
      if (equipmentId) trainingParams.append('equipmentId', equipmentId);
      if (category) trainingParams.append('category', category);

      const trainingResponse = await fetch(
        `/api/policies/check-training/${user.id}?${trainingParams}`
      );
      const trainingData = await trainingResponse.json();

      setStatus({
        weekly: weeklyData,
        concurrent: concurrentData,
        training: trainingData
      });
    } catch (error) {
      console.error('Failed to load policy status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="policy-status loading">
        <div className="loading-spinner-small"></div>
        <span>Checking eligibility...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const hasIssues =
    !status.weekly.allowed ||
    !status.concurrent.allowed ||
    !status.training.allowed;

  return (
    <div className={`policy-status ${hasIssues ? 'has-issues' : 'all-clear'}`}>
      {/* Header */}
      <div className="policy-status-header">
        <span className="status-icon">
          {hasIssues ? '⚠️' : '✓'}
        </span>
        <h4 className="status-title">
          {hasIssues ? 'Booking Restrictions' : 'You\'re Good to Book!'}
        </h4>
      </div>

      {/* Status Items */}
      <div className="status-items">
        {/* Weekly Limit */}
        <div className={`status-item ${!status.weekly.allowed ? 'blocked' : 'allowed'}`}>
          <div className="status-item-header">
            <span className="status-indicator">
              {status.weekly.allowed ? '✓' : '✗'}
            </span>
            <span className="status-label">Weekly Limit</span>
          </div>
          <div className="status-details">
            {status.weekly.allowed ? (
              <span className="status-value success">
                {status.weekly.remaining} of {status.weekly.limitCount} bookings remaining
              </span>
            ) : (
              <span className="status-value error">
                Limit reached: {status.weekly.currentCount}/{status.weekly.limitCount} bookings used
              </span>
            )}
            {status.weekly.ruleName && status.weekly.ruleName !== 'No limit applied' && (
              <span className="status-rule-name">{status.weekly.ruleName}</span>
            )}
          </div>
          {!status.weekly.allowed && (
            <div className="status-help">
              💡 Wait for existing bookings to complete, or contact staff for assistance
            </div>
          )}
        </div>

        {/* Concurrent Limit */}
        <div className={`status-item ${!status.concurrent.allowed ? 'blocked' : 'allowed'}`}>
          <div className="status-item-header">
            <span className="status-indicator">
              {status.concurrent.allowed ? '✓' : '✗'}
            </span>
            <span className="status-label">Active Bookings</span>
          </div>
          <div className="status-details">
            {status.concurrent.allowed ? (
              <span className="status-value success">
                {status.concurrent.remaining} of {status.concurrent.limitCount} slots available
              </span>
            ) : (
              <span className="status-value error">
                Max active bookings reached: {status.concurrent.currentCount}/{status.concurrent.limitCount}
              </span>
            )}
            {status.concurrent.ruleName && status.concurrent.ruleName !== 'No limit applied' && (
              <span className="status-rule-name">{status.concurrent.ruleName}</span>
            )}
          </div>
          {!status.concurrent.allowed && (
            <div className="status-help">
              💡 Return equipment from active bookings to free up slots
            </div>
          )}
        </div>

        {/* Training Requirement */}
        {status.training.requiredTrainingId && (
          <div className={`status-item ${!status.training.allowed ? 'blocked' : 'allowed'}`}>
            <div className="status-item-header">
              <span className="status-indicator">
                {status.training.allowed ? '✓' : '✗'}
              </span>
              <span className="status-label">Training Required</span>
            </div>
            <div className="status-details">
              {status.training.allowed ? (
                <span className="status-value success">
                  Training completed: {status.training.requiredTrainingName}
                </span>
              ) : status.training.trainingExpired ? (
                <span className="status-value error">
                  Training expired: {status.training.requiredTrainingName}
                </span>
              ) : (
                <span className="status-value error">
                  Training required: {status.training.requiredTrainingName}
                </span>
              )}
            </div>
            {!status.training.allowed && (
              <div className="status-help">
                {status.training.trainingExpired
                  ? '📅 Please renew your certification before booking'
                  : '🎓 Complete the required training before booking this equipment'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Message */}
      {hasIssues ? (
        <div className="policy-action-message blocked">
          <strong>Unable to create booking</strong>
          <p>Please resolve the issues above before proceeding</p>
        </div>
      ) : (
        <div className="policy-action-message allowed">
          <strong>All requirements met</strong>
          <p>You can proceed with booking this equipment</p>
        </div>
      )}
    </div>
  );
}

/**
 * PolicyViolationError Component
 * Displays user-friendly error message when booking is blocked by policy
 */
export function PolicyViolationError({ violation }) {
  if (!violation) return null;

  const getErrorIcon = (type) => {
    const icons = {
      weekly_limit_exceeded: '📅',
      concurrent_limit_exceeded: '🔢',
      training_required: '🎓',
      training_expired: '📅',
      account_hold: '🔒'
    };
    return icons[type] || '⚠️';
  };

  const getErrorTitle = (type) => {
    const titles = {
      weekly_limit_exceeded: 'Weekly Booking Limit Reached',
      concurrent_limit_exceeded: 'Too Many Active Bookings',
      training_required: 'Training Required',
      training_expired: 'Training Certification Expired',
      account_hold: 'Account Hold'
    };
    return titles[type] || 'Booking Not Allowed';
  };

  return (
    <div className="policy-violation-error">
      <div className="error-icon">{getErrorIcon(violation.type)}</div>
      <div className="error-content">
        <h3 className="error-title">{getErrorTitle(violation.type)}</h3>
        <p className="error-message">{violation.message}</p>

        {violation.details && (
          <div className="error-details">
            {violation.details.current_count !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Current:</span>
                <span className="detail-value">
                  {violation.details.current_count}
                </span>
              </div>
            )}
            {violation.details.limit_count !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Limit:</span>
                <span className="detail-value">
                  {violation.details.limit_count}
                </span>
              </div>
            )}
            {violation.details.rule_name && (
              <div className="detail-item rule-name">
                Policy: {violation.details.rule_name}
              </div>
            )}
          </div>
        )}

        {violation.type === 'training_required' && (
          <div className="error-action">
            <button className="btn-action">
              🎓 View Training Requirements
            </button>
          </div>
        )}

        {violation.type === 'account_hold' && violation.finesOwed && (
          <div className="error-action">
            <p className="fines-owed">
              Outstanding fines: €{violation.finesOwed.toFixed(2)}
            </p>
            <button className="btn-action">
              💳 View Fines & Payment Options
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
