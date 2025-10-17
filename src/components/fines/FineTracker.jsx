import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './FineTracker.css';

export default function FineTracker() {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);

  useEffect(() => {
    if (user) {
      loadFines();
      loadSummary();
    }
  }, [user]);

  const loadFines = async () => {
    try {
      const response = await fetch(`/api/fines/user/${user.id}`);
      const data = await response.json();
      setFines(data.fines || []);
    } catch (error) {
      console.error('Failed to load fines:', error);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await fetch(`/api/fines/user/${user.id}/total`);
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load fine summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyClass = (status, dueDate) => {
    if (status === 'overdue') return 'urgent';
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue <= 3) return 'warning';
    if (daysUntilDue <= 7) return 'caution';
    return 'ok';
  };

  if (loading) {
    return (
      <div className="fine-tracker loading">
        <div className="loading-spinner"></div>
        <p>Loading fine information...</p>
      </div>
    );
  }

  const pendingFines = fines.filter(f => f.status === 'pending' || f.status === 'overdue');
  const totalOwed = summary?.total_owed || 0;

  if (pendingFines.length === 0 && totalOwed === 0) {
    return (
      <div className="fine-tracker no-fines">
        <div className="success-icon">✓</div>
        <h3>No Outstanding Fines</h3>
        <p>You're all clear! Keep up the good work with on-time returns.</p>
      </div>
    );
  }

  return (
    <div className="fine-tracker">
      {/* Summary Card - Fintech Style */}
      <div className={`fine-summary-card ${summary?.account_hold ? 'account-hold' : ''}`}>
        <div className="fine-summary-header">
          <div className="fine-icon">⚠️</div>
          <div className="fine-summary-amount">
            <span className="label">Total Owed</span>
            <span className="amount">{formatCurrency(totalOwed)}</span>
          </div>
        </div>

        {summary?.account_hold && (
          <div className="account-hold-warning">
            <span className="warning-icon">🔒</span>
            <div>
              <strong>Account Hold</strong>
              <p>{summary.hold_reason}</p>
            </div>
          </div>
        )}

        <div className="fine-summary-stats">
          <div className="stat">
            <span className="stat-value">{pendingFines.length}</span>
            <span className="stat-label">Pending Fines</span>
          </div>
          <div className="stat">
            <span className="stat-value">{summary?.overdue_count || 0}</span>
            <span className="stat-label">Overdue</span>
          </div>
          <div className="stat">
            <span className="stat-value">{formatCurrency(summary?.total_paid || 0)}</span>
            <span className="stat-label">Paid to Date</span>
          </div>
        </div>
      </div>

      {/* Fine List */}
      <div className="fine-list">
        <h4>Outstanding Fines</h4>
        {pendingFines.map(fine => {
          const urgencyClass = getUrgencyClass(fine.status, fine.due_date);
          const daysUntilDue = getDaysUntilDue(fine.due_date);

          return (
            <div key={fine.id} className={`fine-item ${urgencyClass}`}>
              <div className="fine-item-header">
                <div className="fine-equipment">
                  <span className="equipment-name">{fine.product_name || 'Equipment'}</span>
                  <span className="fine-type-badge">{fine.fine_type.replace('_', ' ')}</span>
                </div>
                <div className="fine-amount-large">
                  {formatCurrency(fine.amount)}
                </div>
              </div>

              <div className="fine-item-details">
                <p className="fine-description">{fine.description}</p>

                <div className="fine-timeline">
                  <div className="timeline-item">
                    <span className="timeline-label">Created:</span>
                    <span className="timeline-value">{formatDate(fine.created_at)}</span>
                  </div>
                  <div className="timeline-item">
                    <span className="timeline-label">Due:</span>
                    <span className={`timeline-value ${urgencyClass}`}>
                      {formatDate(fine.due_date)}
                      {fine.status !== 'overdue' && (
                        <span className="days-until-due">
                          ({daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''} remaining)
                        </span>
                      )}
                      {fine.status === 'overdue' && (
                        <span className="overdue-badge">OVERDUE</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="fine-urgency-bar">
                <div
                  className={`urgency-fill ${urgencyClass}`}
                  style={{
                    width: fine.status === 'overdue'
                      ? '100%'
                      : `${Math.max(0, Math.min(100, 100 - (daysUntilDue / 14) * 100))}%`
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Positive Framing CTA */}
      <div className="fine-cta">
        <p className="fine-cta-message">
          💡 Avoid future fines by returning equipment on time. Set reminders 24 hours before due date!
        </p>
      </div>
    </div>
  );
}
