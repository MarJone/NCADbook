import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function InterdisciplinaryAccess() {
  const { user } = useAuth();
  const [subAreas, setSubAreas] = useState([]);
  const [accessGrants, setAccessGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    from_sub_area_id: '',
    to_sub_area_id: '',
    expires_at: '',
    notes: ''
  });
  const { toasts, showToast, removeToast } = useToast();

  // Check if user is admin or master admin
  const isAdmin = user?.role === 'master_admin' || user?.role === 'department_admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load departments
      const subAreasData = await demoMode.query('sub_areas') || [];
      setSubAreas(subAreasData);

      // Load interdisciplinary access grants
      const grantsData = await demoMode.query('interdisciplinary_access') || [];
      setAccessGrants(grantsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSubAreaName = (subAreaId) => {
    const subArea = subAreas.find(sa => sa.id === subAreaId);
    return subArea ? subArea.name : 'Unknown';
  };

  const handleOpenModal = () => {
    setFormData({
      from_sub_area_id: '',
      to_sub_area_id: '',
      expires_at: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      from_sub_area_id: '',
      to_sub_area_id: '',
      expires_at: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.from_sub_area_id || !formData.to_sub_area_id) {
      showToast('Please select both departments', 'error');
      return;
    }

    if (formData.from_sub_area_id === formData.to_sub_area_id) {
      showToast('Cannot grant access to the same department', 'error');
      return;
    }

    // Check if grant already exists
    const existingGrant = accessGrants.find(
      g => g.from_sub_area_id === formData.from_sub_area_id &&
           g.to_sub_area_id === formData.to_sub_area_id
    );

    if (existingGrant) {
      showToast('This access grant already exists', 'error');
      return;
    }

    try {
      const newGrant = {
        ...formData,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
        is_active: true,
        expires_at: formData.expires_at || null
      };

      await demoMode.insert('interdisciplinary_access', newGrant);
      showToast('Interdisciplinary access granted successfully', 'success');
      handleCloseModal();
      await loadData();
    } catch (error) {
      showToast('Failed to grant access: ' + error.message, 'error');
    }
  };

  const handleToggleActive = async (grantId, currentStatus) => {
    try {
      await demoMode.update('interdisciplinary_access', grantId, {
        is_active: !currentStatus
      });
      showToast(`Access ${!currentStatus ? 'activated' : 'deactivated'}`, 'success');
      await loadData();
    } catch (error) {
      showToast('Failed to update access status: ' + error.message, 'error');
    }
  };

  const handleRevoke = async (grantId) => {
    if (!confirm('Are you sure you want to revoke this access grant?')) {
      return;
    }

    try {
      await demoMode.delete('interdisciplinary_access', grantId);
      showToast('Access grant revoked successfully', 'success');
      await loadData();
    } catch (error) {
      showToast('Failed to revoke access: ' + error.message, 'error');
    }
  };

  const isGrantExpired = (grant) => {
    if (!grant.expires_at) return false;
    return new Date(grant.expires_at) < new Date();
  };

  if (!isAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only administrators can manage interdisciplinary access.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading access grants...</div>;
  }

  const activeGrants = accessGrants.filter(g => g.is_active && !isGrantExpired(g));
  const inactiveGrants = accessGrants.filter(g => !g.is_active || isGrantExpired(g));

  return (
    <div className="interdisciplinary-access">
      <div className="approvals-header">
        <div>
          <h2>Interdisciplinary Access Management</h2>
          <p className="subtitle">Grant cross-departmental equipment access between departments</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="btn btn-primary"
          data-testid="grant-access-btn"
        >
          Grant Access
        </button>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'var(--color-info-pale)',
        border: '1px solid var(--color-info)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-info)' }}>
          How Interdisciplinary Access Works
        </h4>
        <p style={{ margin: 0, color: 'var(--text-primary)' }}>
          When you grant access FROM Department A TO Department B, students in Department A will be able to
          view and book equipment from Department B. This is useful for collaborative projects between departments.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card stat-success">
          <div className="stat-content">
            <h3>{activeGrants.length}</h3>
            <p>Active Grants</p>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-content">
            <h3>{inactiveGrants.length}</h3>
            <p>Inactive/Expired</p>
          </div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-content">
            <h3>{accessGrants.length}</h3>
            <p>Total Grants</p>
          </div>
        </div>
      </div>

      {/* Active Grants */}
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h3>Active Access Grants</h3>
        {activeGrants.length === 0 ? (
          <div className="empty-state">
            <p>No active interdisciplinary access grants</p>
          </div>
        ) : (
          <div className="equipment-table">
            <table>
              <thead>
                <tr>
                  <th>From Department</th>
                  <th>To Department</th>
                  <th>Granted</th>
                  <th>Expires</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeGrants.map(grant => (
                  <tr key={grant.id} data-testid="access-grant-row">
                    <td style={{ fontWeight: '600' }}>{getSubAreaName(grant.from_sub_area_id)}</td>
                    <td style={{ fontWeight: '600' }}>{getSubAreaName(grant.to_sub_area_id)}</td>
                    <td>{new Date(grant.granted_at).toLocaleDateString()}</td>
                    <td>
                      {grant.expires_at ? (
                        <span style={{
                          color: isGrantExpired(grant) ? 'var(--color-error)' : 'var(--text-primary)'
                        }}>
                          {new Date(grant.expires_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Never</span>
                      )}
                    </td>
                    <td>{grant.notes || '-'}</td>
                    <td>
                      <span className="status status-success">Active</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleToggleActive(grant.id, grant.is_active)}
                          className="btn btn-sm btn-secondary"
                          data-testid="deactivate-grant-btn"
                        >
                          Deactivate
                        </button>
                        <button
                          onClick={() => handleRevoke(grant.id)}
                          className="btn btn-sm btn-danger"
                          data-testid="revoke-grant-btn"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inactive Grants */}
      {inactiveGrants.length > 0 && (
        <div>
          <h3>Inactive/Expired Access Grants</h3>
          <div className="equipment-table">
            <table>
              <thead>
                <tr>
                  <th>From Department</th>
                  <th>To Department</th>
                  <th>Granted</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inactiveGrants.map(grant => (
                  <tr key={grant.id} style={{ opacity: 0.7 }} data-testid="inactive-grant-row">
                    <td>{getSubAreaName(grant.from_sub_area_id)}</td>
                    <td>{getSubAreaName(grant.to_sub_area_id)}</td>
                    <td>{new Date(grant.granted_at).toLocaleDateString()}</td>
                    <td>
                      {grant.expires_at ? new Date(grant.expires_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td>
                      <span className="status status-secondary">
                        {isGrantExpired(grant) ? 'Expired' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!isGrantExpired(grant) && (
                          <button
                            onClick={() => handleToggleActive(grant.id, grant.is_active)}
                            className="btn btn-sm btn-secondary"
                            data-testid="activate-grant-btn"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => handleRevoke(grant.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grant Access Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="grant-access-modal">
            <div className="modal-header">
              <h2>Grant Interdisciplinary Access</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="from-sub-area">From Department *</label>
                  <select
                    id="from-sub-area"
                    className="form-select"
                    value={formData.from_sub_area_id}
                    onChange={(e) => setFormData({ ...formData, from_sub_area_id: e.target.value })}
                    required
                    data-testid="from-sub-area-select"
                  >
                    <option value="">-- Select Department --</option>
                    {subAreas.map(subArea => (
                      <option key={subArea.id} value={subArea.id}>
                        {subArea.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    Students in this department will gain access
                  </small>
                </div>

                <div style={{ textAlign: 'center', margin: 'var(--spacing-md) 0', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', fontWeight: '500' }}>
                  will have access to
                </div>

                <div className="form-group">
                  <label htmlFor="to-sub-area">To Department (Equipment Source) *</label>
                  <select
                    id="to-sub-area"
                    className="form-select"
                    value={formData.to_sub_area_id}
                    onChange={(e) => setFormData({ ...formData, to_sub_area_id: e.target.value })}
                    required
                    data-testid="to-sub-area-select"
                  >
                    <option value="">-- Select Department --</option>
                    {subAreas.map(subArea => (
                      <option
                        key={subArea.id}
                        value={subArea.id}
                        disabled={subArea.id === formData.from_sub_area_id}
                      >
                        {subArea.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: 'var(--text-secondary)' }}>
                    Equipment from this department will be accessible
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="expires-at">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    id="expires-at"
                    className="form-input"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="expires-at-input"
                  />
                  <small style={{ color: 'var(--text-secondary)' }}>
                    Leave blank for permanent access
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g., For collaborative project between departments"
                    rows="3"
                    data-testid="notes-input"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" data-testid="confirm-grant-btn">
                    Grant Access
                  </button>
                </div>
              </div>
            </form>
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
    </div>
  );
}
