import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getRequestsForDepartment, approveRequest, denyRequest } from '../../services/crossDepartmentRequests.service';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function CrossDepartmentRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [denyReason, setDenyReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const statusFilter = filter === 'all' ? null : filter;
      const deptRequests = await getRequestsForDepartment(user.department, statusFilter);
      setRequests(deptRequests);
    } catch (error) {
      console.error('Failed to load requests:', error);
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || instructions.trim().length < 20) {
      showToast('Please provide detailed collection instructions (minimum 20 characters)', 'error');
      return;
    }

    setProcessing(true);
    try {
      await approveRequest(selectedRequest.id, user.id, instructions);
      showToast('Request approved successfully! Staff member will be notified.', 'success');
      setSelectedRequest(null);
      setInstructions('');
      loadRequests();
    } catch (error) {
      console.error('Failed to approve request:', error);
      showToast('Failed to approve request', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest || denyReason.trim().length < 20) {
      showToast('Please provide a detailed reason for denial (minimum 20 characters)', 'error');
      return;
    }

    setProcessing(true);
    try {
      await denyRequest(selectedRequest.id, user.id, denyReason);
      showToast('Request denied. Staff member will be notified.', 'success');
      setSelectedRequest(null);
      setDenyReason('');
      loadRequests();
    } catch (error) {
      console.error('Failed to deny request:', error);
      showToast('Failed to deny request', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalDialog = (request) => {
    setSelectedRequest(request);
    setInstructions('Equipment available for collection on [date] at [time] from [location]. Please return by [date/time]. Contact [email/phone] for any questions.');
    setDenyReason('');
  };

  const openDenyDialog = (request) => {
    setSelectedRequest(request);
    setDenyReason('');
    setInstructions('');
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setInstructions('');
    setDenyReason('');
  };

  if (loading) {
    return (
      <div className="cross-dept-requests">
        <h2>Cross-Department Requests</h2>
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="cross-dept-requests">
      <h2>Cross-Department Equipment Requests</h2>
      <p className="subtitle">Review and approve/deny requests from staff members for your department's equipment</p>

      <div className="filter-tabs">
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
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'tab-active' : 'tab'}
        >
          All ({requests.length})
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No {filter} requests found.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <div>
                  <h3>{request.equipment_type}</h3>
                  <span className={`status-badge status-${request.status}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                  {request.routing_type === 'broadcast' && (
                    <span className="broadcast-badge" title="This request was broadcast to multiple departments">
                      📢 Broadcast
                    </span>
                  )}
                </div>
              </div>

              <div className="request-info">
                <div className="info-row">
                  <span className="label">Requesting Staff:</span>
                  <span className="value">{request.requesting_user_name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{request.requesting_user_email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Quantity Needed:</span>
                  <span className="value"><strong>{request.quantity}</strong></span>
                </div>
                {request.available_at_department && (
                  <div className="info-row">
                    <span className="label">Available in Your Dept:</span>
                    <span className="value"><strong>{request.available_at_department}</strong></span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Dates:</span>
                  <span className="value">
                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="request-justification">
                <strong>Justification:</strong>
                <p>{request.justification}</p>
              </div>

              {request.status === 'pending' && (
                <div className="request-actions">
                  <button
                    onClick={() => openApprovalDialog(request)}
                    className="btn btn-success btn-sm"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => openDenyDialog(request)}
                    className="btn btn-danger btn-sm"
                  >
                    ✗ Deny
                  </button>
                </div>
              )}

              {request.status !== 'pending' && request.review_notes && (
                <div className={`review-notes ${request.status}`}>
                  <strong>{request.status === 'approved' ? 'Approval Instructions:' : 'Denial Reason:'}</strong>
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

      {/* Approval Dialog */}
      {selectedRequest && instructions !== '' && (
        <div className="modal-overlay" onClick={closeDialog}>
          <div className="modal-content approval-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Approve Request for {selectedRequest.equipment_type}</h3>
              <button onClick={closeDialog} className="modal-close">&times;</button>
            </div>

            <div className="dialog-body">
              <p>Provide collection and return instructions for <strong>{selectedRequest.requesting_user_name}</strong>:</p>

              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows="6"
                placeholder="Equipment available for collection on [date] at [time] from [location]..."
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontFamily: 'inherit' }}
              />
              <small className={instructions.length < 20 ? 'text-error' : 'text-success'}>
                {instructions.length} / 20 characters minimum
              </small>
            </div>

            <div className="dialog-actions">
              <button onClick={closeDialog} className="btn btn-secondary" disabled={processing}>
                Cancel
              </button>
              <button onClick={handleApprove} className="btn btn-success" disabled={processing || instructions.length < 20}>
                {processing ? 'Approving...' : 'Approve Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Dialog */}
      {selectedRequest && denyReason !== '' && (
        <div className="modal-overlay" onClick={closeDialog}>
          <div className="modal-content denial-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Deny Request for {selectedRequest.equipment_type}</h3>
              <button onClick={closeDialog} className="modal-close">&times;</button>
            </div>

            <div className="dialog-body">
              <p>Provide a detailed reason for denying this request to <strong>{selectedRequest.requesting_user_name}</strong>:</p>

              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows="4"
                placeholder="Unfortunately our equipment is fully booked during this period..."
                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', fontFamily: 'inherit' }}
              />
              <small className={denyReason.length < 20 ? 'text-error' : 'text-success'}>
                {denyReason.length} / 20 characters minimum
              </small>
            </div>

            <div className="dialog-actions">
              <button onClick={closeDialog} className="btn btn-secondary" disabled={processing}>
                Cancel
              </button>
              <button onClick={handleDeny} className="btn btn-danger" disabled={processing || denyReason.length < 20}>
                {processing ? 'Denying...' : 'Deny Request'}
              </button>
            </div>
          </div>
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
        .cross-dept-requests {
          padding: 2rem;
        }

        .subtitle {
          color: #666;
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

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
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
          margin-right: 0.5rem;
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

        .broadcast-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: #e3f2fd;
          border-radius: 4px;
          font-size: 0.75rem;
        }

        .request-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .info-row {
          display: flex;
          gap: 0.5rem;
        }

        .info-row .label {
          font-weight: 600;
          color: #666;
          min-width: 140px;
        }

        .info-row .value {
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

        .request-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .review-notes {
          margin-top: 1rem;
          padding: 1rem;
          border-radius: 4px;
          border-left: 4px solid;
        }

        .review-notes.approved {
          background-color: #e8f5e9;
          border-left-color: #4caf50;
        }

        .review-notes.denied {
          background-color: #ffebee;
          border-left-color: #f44336;
        }

        .review-notes strong {
          display: block;
          margin-bottom: 0.5rem;
        }

        .review-notes p {
          margin: 0 0 0.5rem 0;
          line-height: 1.5;
        }

        .review-notes small {
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

        .approval-dialog,
        .denial-dialog {
          max-width: 600px;
        }

        .dialog-body {
          padding: 1.5rem 0;
        }

        .dialog-body textarea {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          resize: vertical;
        }

        .dialog-body small.text-error {
          color: #d32f2f;
        }

        .dialog-body small.text-success {
          color: #4caf50;
        }

        .dialog-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid #eee;
        }

        @media (max-width: 768px) {
          .cross-dept-requests {
            padding: 1rem;
          }

          .requests-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
