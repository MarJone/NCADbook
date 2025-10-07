import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAccessRequests,
  approveAccessRequest,
  denyAccessRequest,
  getAllDepartments
} from '../../services/department.service';
import { demoMode } from '../../mocks/demo-mode';

/**
 * ManageAccessRequests Component
 * For master admin to:
 * - See all pending access requests
 * - Approve requests (creates interdisciplinary grant automatically)
 * - Deny requests with notes
 * - View history of all requests
 */
export default function ManageAccessRequests() {
  const { user } = useAuth();
  const [allRequests, setAllRequests] = useState([]);
  const [subAreas, setSubAreas] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'approved', 'denied'
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [showDenyModal, setShowDenyModal] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [requestsData, departmentsData, adminsData] = await Promise.all([
        getAccessRequests(),
        getAllDepartments(),
        demoMode.query('users', { role: 'department_admin' })
      ]);

      setAllRequests(requestsData);
      setSubAreas(departmentsData);
      setAdmins(adminsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId) {
    if (!confirm('Are you sure you want to approve this request? This will create an interdisciplinary access grant.')) {
      return;
    }

    try {
      setProcessing(requestId);
      setError(null);

      await approveAccessRequest(requestId, user.id);

      setSuccess('Request approved successfully! Interdisciplinary access grant has been created.');

      // Reload data
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to approve request:', err);
      setError(err.message || 'Failed to approve request. Please try again.');
    } finally {
      setProcessing(null);
    }
  }

  async function handleDeny(requestId) {
    if (!denyReason.trim()) {
      setError('Please provide a reason for denying this request');
      return;
    }

    try {
      setProcessing(requestId);
      setError(null);

      await denyAccessRequest(requestId, user.id, denyReason);

      setSuccess('Request denied successfully.');
      setShowDenyModal(null);
      setDenyReason('');

      // Reload data
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to deny request:', err);
      setError(err.message || 'Failed to deny request. Please try again.');
    } finally {
      setProcessing(null);
    }
  }

  function openDenyModal(requestId) {
    setShowDenyModal(requestId);
    setDenyReason('');
    setError(null);
  }

  function getStatusBadgeClass(status) {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'approved':
        return 'badge-success';
      case 'denied':
        return 'badge-error';
      default:
        return 'badge-default';
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (loading) {
    return <div className="loading">Loading access requests...</div>;
  }

  // Filter requests
  const filteredRequests = filter === 'all'
    ? allRequests
    : allRequests.filter(r => r.status === filter);

  const pendingCount = allRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="manage-access-requests-page">
      <div className="page-header">
        <h1>Manage Access Requests</h1>
        <p className="page-description">
          Review and approve access requests from department admins.
          {pendingCount > 0 && (
            <span className="badge badge-warning ml-2">
              {pendingCount} pending
            </span>
          )}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({allRequests.filter(r => r.status === 'pending').length})
        </button>
        <button
          className={`tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({allRequests.filter(r => r.status === 'approved').length})
        </button>
        <button
          className={`tab ${filter === 'denied' ? 'active' : ''}`}
          onClick={() => setFilter('denied')}
        >
          Denied ({allRequests.filter(r => r.status === 'denied').length})
        </button>
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({allRequests.length})
        </button>
      </div>

      {/* Requests List */}
      <div className="requests-list">
        {filteredRequests.length === 0 ? (
          <div className="card">
            <p className="text-muted text-center">No {filter !== 'all' && filter} requests found.</p>
          </div>
        ) : (
          filteredRequests.map(request => {
            const fromSubArea = subAreas.find(sa => sa.id === request.from_sub_area_id);
            const toSubArea = subAreas.find(sa => sa.id === request.to_sub_area_id);
            const requestingAdmin = admins.find(a => a.id === request.requesting_admin_id);
            const isPending = request.status === 'pending';

            return (
              <div key={request.id} className="card request-card">
                <div className="request-header">
                  <div className="request-title">
                    <h3>
                      <span className="text-primary">{fromSubArea?.name}</span>
                      {' → '}
                      <span className="text-secondary">{toSubArea?.name}</span>
                    </h3>
                    <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="request-meta">
                    <p className="text-small text-muted">
                      Requested by: <strong>{requestingAdmin?.full_name}</strong> ({requestingAdmin?.email})
                    </p>
                    <p className="text-small text-muted">
                      Date: {formatDate(request.requested_at)}
                    </p>
                  </div>
                </div>

                <div className="request-body">
                  <p><strong>Reason:</strong></p>
                  <p className="reason-text">{request.reason}</p>

                  {request.status !== 'pending' && (
                    <>
                      <hr />
                      <p className="text-small text-muted">
                        Reviewed: {formatDate(request.reviewed_at)}
                      </p>
                      {request.notes && (
                        <>
                          <p><strong>Admin Notes:</strong></p>
                          <p className="notes-text">{request.notes}</p>
                        </>
                      )}
                    </>
                  )}
                </div>

                {isPending && (
                  <div className="request-actions">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processing === request.id}
                      className="btn btn-success"
                    >
                      {processing === request.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => openDenyModal(request.id)}
                      disabled={processing === request.id}
                      className="btn btn-error"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Deny Modal */}
      {showDenyModal && (
        <div className="modal-overlay" onClick={() => setShowDenyModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Deny Access Request</h2>
            <p>Please provide a reason for denying this request:</p>

            <textarea
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
              rows={4}
              className="form-textarea"
              placeholder="Explain why this request is being denied..."
              autoFocus
            />

            <div className="modal-actions">
              <button
                onClick={() => handleDeny(showDenyModal)}
                disabled={!denyReason.trim() || processing === showDenyModal}
                className="btn btn-error"
              >
                {processing === showDenyModal ? 'Denying...' : 'Deny Request'}
              </button>
              <button
                onClick={() => setShowDenyModal(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
