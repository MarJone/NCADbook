import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getAllSubAreas,
  createAccessRequest,
  getSubAreaAdminRequests
} from '../../services/subArea.service';

/**
 * AccessRequests Component
 * For sub-area admins to:
 * - View all sub-areas and their equipment (read-only)
 * - Request access to another sub-area's equipment
 * - View status of their pending/approved/denied requests
 */
export default function AccessRequests() {
  const { user } = useAuth();
  const [subAreas, setSubAreas] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [selectedSubArea, setSelectedSubArea] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      setLoading(true);
      const [subAreasData, requestsData] = await Promise.all([
        getAllSubAreas(),
        getSubAreaAdminRequests(user.id)
      ]);

      setSubAreas(subAreasData);
      setMyRequests(requestsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitRequest(e) {
    e.preventDefault();

    if (!selectedSubArea) {
      setError('Please select a sub-area to request access to');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for your request');
      return;
    }

    if (selectedSubArea === user.managed_sub_area_id) {
      setError('You already have access to your own sub-area');
      return;
    }

    // Check if there's already a pending request for this sub-area
    const existingPendingRequest = myRequests.find(
      r => r.to_sub_area_id === selectedSubArea && r.status === 'pending'
    );

    if (existingPendingRequest) {
      setError('You already have a pending request for this sub-area');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await createAccessRequest(
        user.id,
        user.managed_sub_area_id,
        selectedSubArea,
        reason
      );

      setSuccess('Access request submitted successfully!');
      setSelectedSubArea(null);
      setReason('');

      // Reload requests
      await loadData();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to submit request:', err);
      setError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  const myManagedSubArea = subAreas.find(sa => sa.id === user.managed_sub_area_id);
  const otherSubAreas = subAreas.filter(sa => sa.id !== user.managed_sub_area_id);

  return (
    <div className="access-requests-page">
      <div className="page-header">
        <h1>Request Equipment Access</h1>
        <p className="page-description">
          You manage <strong>{myManagedSubArea?.name || 'your sub-area'}</strong>.
          Request access to equipment from other sub-areas for your students.
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

      {/* Request Form */}
      <div className="card">
        <h2>Submit New Access Request</h2>
        <form onSubmit={handleSubmitRequest} className="access-request-form">
          <div className="form-group">
            <label htmlFor="subArea">Select Sub-Area to Access:</label>
            <select
              id="subArea"
              value={selectedSubArea || ''}
              onChange={(e) => setSelectedSubArea(e.target.value)}
              required
              className="form-select"
            >
              <option value="">-- Select a sub-area --</option>
              {otherSubAreas.map(sa => (
                <option key={sa.id} value={sa.id}>
                  {sa.name} ({sa.parent_department})
                </option>
              ))}
            </select>
            <p className="form-help">
              Choose the sub-area whose equipment your students need access to.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for Request:</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              className="form-textarea"
              placeholder="Explain why your students need access to this sub-area's equipment..."
            />
            <p className="form-help">
              Provide a clear justification for your request. This will be reviewed by the master admin.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* My Requests */}
      <div className="card">
        <h2>My Access Requests ({myRequests.length})</h2>

        {myRequests.length === 0 ? (
          <p className="text-muted">You haven't submitted any access requests yet.</p>
        ) : (
          <div className="requests-list">
            {myRequests.map(request => {
              const targetSubArea = subAreas.find(sa => sa.id === request.to_sub_area_id);

              return (
                <div key={request.id} className="request-item">
                  <div className="request-header">
                    <h3>{targetSubArea?.name || 'Unknown Sub-Area'}</h3>
                    <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="request-details">
                    <p><strong>Reason:</strong> {request.reason}</p>
                    <p><strong>Requested:</strong> {formatDate(request.requested_at)}</p>

                    {request.status !== 'pending' && (
                      <>
                        <p><strong>Reviewed:</strong> {formatDate(request.reviewed_at)}</p>
                        {request.notes && (
                          <p><strong>Admin Notes:</strong> {request.notes}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Browse Other Sub-Areas (Read-Only) */}
      <div className="card">
        <h2>Browse Other Sub-Areas</h2>
        <p className="text-muted">
          View equipment from other sub-areas (read-only). Submit a request to gain booking access.
        </p>

        <div className="sub-areas-grid">
          {otherSubAreas.map(sa => (
            <div key={sa.id} className="sub-area-card">
              <h3>{sa.name}</h3>
              <p className="text-small text-muted">{sa.description}</p>
              <p className="text-small"><strong>Department:</strong> {sa.parent_department}</p>

              {/* Check if there's an existing request */}
              {(() => {
                const existingRequest = myRequests.find(r => r.to_sub_area_id === sa.id);
                if (existingRequest) {
                  return (
                    <p className="text-small">
                      <strong>Request Status:</strong>{' '}
                      <span className={`badge ${getStatusBadgeClass(existingRequest.status)}`}>
                        {existingRequest.status}
                      </span>
                    </p>
                  );
                }
                return null;
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
