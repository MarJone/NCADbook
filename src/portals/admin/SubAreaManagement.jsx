import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function SubAreaManagement() {
  const { user } = useAuth();
  const [subAreas, setSubAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubArea, setEditingSubArea] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_department: ''
  });
  const { toasts, showToast, removeToast } = useToast();

  // Check if user is master admin
  const isMasterAdmin = user?.role === 'master_admin';

  useEffect(() => {
    loadSubAreas();
  }, []);

  const loadSubAreas = async () => {
    setLoading(true);
    try {
      // In production, this would query the sub_areas table
      const data = await demoMode.query('sub_areas') || [];
      setSubAreas(data);
    } catch (error) {
      console.error('Failed to load sub-areas:', error);
      showToast('Failed to load sub-areas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (subArea = null) => {
    if (subArea) {
      setEditingSubArea(subArea);
      setFormData({
        name: subArea.name,
        description: subArea.description || '',
        parent_department: subArea.parent_department || ''
      });
    } else {
      setEditingSubArea(null);
      setFormData({
        name: '',
        description: '',
        parent_department: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubArea(null);
    setFormData({
      name: '',
      description: '',
      parent_department: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Sub-area name is required', 'error');
      return;
    }

    try {
      if (editingSubArea) {
        // Update existing sub-area
        await demoMode.update('sub_areas', editingSubArea.id, formData);
        showToast('Sub-area updated successfully', 'success');
      } else {
        // Create new sub-area
        await demoMode.insert('sub_areas', formData);
        showToast('Sub-area created successfully', 'success');
      }

      handleCloseModal();
      await loadSubAreas();
    } catch (error) {
      showToast(`Failed to ${editingSubArea ? 'update' : 'create'} sub-area: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (subAreaId) => {
    if (!confirm('Are you sure you want to delete this sub-area? This will affect all associated equipment and users.')) {
      return;
    }

    try {
      await demoMode.delete('sub_areas', subAreaId);
      showToast('Sub-area deleted successfully', 'success');
      await loadSubAreas();
    } catch (error) {
      showToast('Failed to delete sub-area: ' + error.message, 'error');
    }
  };

  if (!isMasterAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only master administrators can manage sub-areas.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading sub-areas...</div>;
  }

  return (
    <div className="sub-area-management">
      <div className="approvals-header">
        <div>
          <h2>Sub-Area Management</h2>
          <p className="subtitle">Manage sub-areas and departments within NCAD</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          data-testid="add-sub-area-btn"
        >
          Add Sub-Area
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card stat-primary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{subAreas.length}</h3>
            <p>Total Sub-Areas</p>
          </div>
        </div>
        <div className="stat-card stat-secondary">
          <div className="stat-icon">🏫</div>
          <div className="stat-content">
            <h3>{new Set(subAreas.map(sa => sa.parent_department).filter(Boolean)).size}</h3>
            <p>Parent Departments</p>
          </div>
        </div>
      </div>

      {subAreas.length === 0 ? (
        <div className="empty-state">
          <h2>No Sub-Areas Yet</h2>
          <p>Create your first sub-area to organize equipment and students.</p>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            Create Sub-Area
          </button>
        </div>
      ) : (
        <div className="equipment-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Parent Department</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subAreas.map(subArea => (
                <tr key={subArea.id} data-testid="sub-area-row">
                  <td style={{ fontWeight: '600' }}>{subArea.name}</td>
                  <td>{subArea.description || '-'}</td>
                  <td>{subArea.parent_department || '-'}</td>
                  <td>{new Date(subArea.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleOpenModal(subArea)}
                        className="btn btn-sm btn-secondary"
                        data-testid="edit-sub-area-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subArea.id)}
                        className="btn btn-sm btn-danger"
                        data-testid="delete-sub-area-btn"
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
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="sub-area-modal">
            <div className="modal-header">
              <h2>{editingSubArea ? 'Edit Sub-Area' : 'Create Sub-Area'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Communication Design"
                    required
                    data-testid="sub-area-name-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this sub-area"
                    rows="3"
                    data-testid="sub-area-description-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="parent_department">Parent Department</label>
                  <select
                    id="parent_department"
                    className="form-select"
                    value={formData.parent_department}
                    onChange={(e) => setFormData({ ...formData, parent_department: e.target.value })}
                    data-testid="sub-area-parent-select"
                  >
                    <option value="">-- Select Department --</option>
                    <option value="School of Design">School of Design</option>
                    <option value="School of Fine Art">School of Fine Art</option>
                    <option value="School of Education">School of Education</option>
                    <option value="School of Visual Culture">School of Visual Culture</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" data-testid="save-sub-area-btn">
                    {editingSubArea ? 'Update' : 'Create'} Sub-Area
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
