import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function DepartmentManagement() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    school: ''
  });
  const { toasts, showToast, removeToast } = useToast();

  // Check if user is master admin
  const isMasterAdmin = user?.role === 'master_admin';

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      // In production, this would query the sub_areas table
      const data = await demoMode.query('sub_areas') || [];
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
      showToast('Failed to load departments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (department = null) => {
    if (department) {
      setEditingDepartment(department);
      setFormData({
        name: department.name,
        description: department.description || '',
        school: department.school || ''
      });
    } else {
      setEditingDepartment(null);
      setFormData({
        name: '',
        description: '',
        school: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      school: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Department name is required', 'error');
      return;
    }

    try {
      if (editingDepartment) {
        // Update existing department
        await demoMode.update('sub_areas', editingDepartment.id, formData);
        showToast('Department updated successfully', 'success');
      } else {
        // Create new department
        await demoMode.insert('sub_areas', formData);
        showToast('Department created successfully', 'success');
      }

      handleCloseModal();
      await loadDepartments();
    } catch (error) {
      showToast(`Failed to ${editingDepartment ? 'update' : 'create'} department: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (departmentId) => {
    if (!confirm('Are you sure you want to delete this department? This will affect all associated equipment and users.')) {
      return;
    }

    try {
      await demoMode.delete('sub_areas', departmentId);
      showToast('Department deleted successfully', 'success');
      await loadDepartments();
    } catch (error) {
      showToast('Failed to delete department: ' + error.message, 'error');
    }
  };

  if (!isMasterAdmin) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only master administrators can manage departments.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div className="department-management">
      <div className="approvals-header">
        <div>
          <h2>Department Management</h2>
          <p className="subtitle">Manage departments and areas within NCAD</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
          data-testid="add-department-btn"
        >
          Add Department
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="stat-card stat-primary">
          <div className="stat-content">
            <h3>{departments.length}</h3>
            <p>Total Departments</p>
          </div>
        </div>
        <div className="stat-card stat-secondary">
          <div className="stat-content">
            <h3>{new Set(departments.map(sa => sa.school).filter(Boolean)).size}</h3>
            <p>Parent Schools</p>
          </div>
        </div>
      </div>

      {departments.length === 0 ? (
        <div className="empty-state">
          <h2>No Departments Found</h2>
          <p>The demo data may need to be refreshed to load the 10 NCAD departments.</p>
          <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (confirm('This will reset all demo data and reload the page. Continue?')) {
                  localStorage.removeItem('ncadbook_demo_data');
                  window.location.reload();
                }
              }}
              className="btn btn-primary"
            >
              🔄 Reset Demo Data
            </button>
            <button onClick={() => handleOpenModal()} className="btn btn-secondary">
              Or Create Department Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="equipment-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Parent School</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(department => (
                <tr key={department.id} data-testid="department-row">
                  <td style={{ fontWeight: '600' }}>{department.name}</td>
                  <td>{department.description || '-'}</td>
                  <td>{department.school || '-'}</td>
                  <td>{new Date(department.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleOpenModal(department)}
                        className="btn btn-sm btn-secondary"
                        data-testid="edit-department-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="btn btn-sm btn-danger"
                        data-testid="delete-department-btn"
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="department-modal">
            <div className="modal-header">
              <h2>{editingDepartment ? 'Edit Department' : 'Create Department'}</h2>
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
                    data-testid="department-name-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this department"
                    rows="3"
                    data-testid="department-description-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="school">Parent School</label>
                  <select
                    id="school"
                    className="form-select"
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    data-testid="department-parent-select"
                  >
                    <option value="">-- Select School --</option>
                    <option value="School of Design">School of Design</option>
                    <option value="School of Fine Art">School of Fine Art</option>
                    <option value="School of Education">School of Education</option>
                    <option value="School of Visual Culture">School of Visual Culture</option>
                    <option value="First Year Studies">First Year Studies</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" data-testid="save-department-btn">
                    {editingDepartment ? 'Update' : 'Create'} Department
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
