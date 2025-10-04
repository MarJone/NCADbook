import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRequestsByUser, cancelRequest } from '../../services/crossDepartmentRequests.service';
import CrossDepartmentRequestForm from './CrossDepartmentRequestForm';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function MyCrossDepartmentRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, denied
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const userRequests = await getRequestsByUser(user.id);
      setRequests(userRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      await cancelRequest(requestId);
      showToast('Request cancelled successfully', 'success');
      loadRequests();
    } catch (error) {
      console.error('Failed to cancel request:', error);
      showToast(error.message || 'Failed to cancel request', 'error');
    }
  };

  const handleRequestSuccess = () => {
    loadRequests();
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(req => req.status === filter);

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'status-pending',
      approved: 'status-approved',
      denied: 'status-denied',
      cancelled: 'status-cancelled'
    };
    return classes[status] || '';
  };

  if (loading) {
    return (
      <div className="my-cross-dept-requests">
        <h2>My Cross-Department Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="my-cross-dept-requests">
      <div className="page-header">
        <h2>My Cross-Department Equipment Requests</h2>
        <button
          onClick={() => setShowRequestForm(true)}
          className="btn btn-primary"
        >
          + New Request
        </button>
      </div>

      <div className="filter-tabs">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'tab-active' : 'tab'}
        >
          All ({requests.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={filter === 'pending' ? 'tab-active' : 'tab'}
        >
          Pending ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={filter === 'approved' ? 'tab-active' : 'tab'}
        >
          Approved ({requests.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('denied')}
          className={filter === 'denied' ? 'tab-active' : 'tab'}
        >
          Denied ({requests.filter(r => r.status === 'denied').length})
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} requests found.</p>
          {filter === 'all' && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Create Your First Request
            </button>
          )}
        </div>
      ) : (
        <div className="requests-list">
          {filteredRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div>
                  <h3>{request.equipment_type}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                {request.status === 'pending' && (
                  <button
                    onClick={() => handleCancelRequest(request.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel Request
                  </button>
                )}
              </div>

              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">Target Department:</span>
                  <span className="detail-value">{request.target_department_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{request.quantity}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dates:</span>
                  <span className="detail-value">
                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                  </span>
                </div>
                {request.routing_type && (
                  <div className="detail-row">
                    <span className="detail-label">Request Type:</span>
                    <span className="detail-value">
                      {request.routing_type === 'broadcast' ? '📢 Broadcast to Multiple Departments' : '📍 Single Department'}
                    </span>
                  </div>
                )}
              </div>

              <div className="request-justification">
                <strong>Justification:</strong>
                <p>{request.justification}</p>
              </div>

              {request.status === 'approved' && request.review_notes && (
                <div className="request-instructions approved">
                  <strong>✓ Approved - Collection Instructions:</strong>
                  <p>{request.review_notes}</p>
                  <small>Reviewed: {new Date(request.reviewed_at).toLocaleString()}</small>
                </div>
              )}

              {request.status === 'denied' && request.review_notes && (
                <div className="request-instructions denied">
                  <strong>✗ Denied - Reason:</strong>
                  <p>{request.review_notes}</p>
                  <small>Reviewed: {new Date(request.reviewed_at).toLocaleString()}</small>
                </div>
              )}

              <div className="request-metadata">
                <small>Created: {new Date(request.created_at).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRequestForm && (
        <CrossDepartmentRequestForm
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleRequestSuccess}
        />
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
        .my-cross-dept-requests {
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #eee;
        }

        .tab,
        .tab-active {
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 600;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #333;
          background-color: #f5f5f5;
        }

        .tab-active {
          color: #1976d2;
          border-bottom-color: #1976d2;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .request-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .request-header h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }

        .status-approved {
          background-color: #d4edda;
          color: #155724;
        }

        .status-denied {
          background-color: #f8d7da;
          color: #721c24;
        }

        .status-cancelled {
          background-color: #e2e3e5;
          color: #383d41;
        }

        .request-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .detail-row {
          display: flex;
          gap: 0.5rem;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
          min-width: 150px;
        }

        .detail-value {
          color: #333;
        }

        .request-justification {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #f5f5f5;
          border-radius: 4px;
        }

        .request-justification strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .request-justification p {
          margin: 0;
          color: #555;
          line-height: 1.5;
        }

        .request-instructions {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
          border-left: 4px solid;
        }

        .request-instructions.approved {
          background-color: #e8f5e9;
          border-left-color: #4caf50;
        }

        .request-instructions.denied {
          background-color: #ffebee;
          border-left-color: #f44336;
        }

        .request-instructions strong {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .request-instructions p {
          margin: 0 0 0.5rem 0;
          color: #555;
          line-height: 1.5;
        }

        .request-instructions small {
          color: #999;
          font-size: 0.85rem;
        }

        .request-metadata {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .request-metadata small {
          color: #999;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .my-cross-dept-requests {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .filter-tabs {
            flex-wrap: wrap;
          }

          .request-header {
            flex-direction: column;
            gap: 1rem;
          }

          .detail-label {
            min-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}
