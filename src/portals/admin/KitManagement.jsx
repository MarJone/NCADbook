import { useState, useEffect } from 'react';
import { equipmentAPI, equipmentKitsAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/common/Toast';

export default function KitManagement() {
  const { user } = useAuth();
  const [kits, setKits] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [equipmentRes, kitsRes] = await Promise.all([
        equipmentAPI.getAll(),
        equipmentKitsAPI.getAll({ department_id: user?.department || 'all' })
      ]);

      setEquipment(equipmentRes.equipment || []);
      setKits(kitsRes.kits || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load data', 'error');
    }
  };

  const handleCreateKit = () => {
    setEditingKit({
      name: '',
      description: '',
      department_id: user?.department || 'all',
      equipment_ids: []
    });
    setShowCreateModal(true);
  };

  const handleSaveKit = async (kitData) => {
    try {
      if (kitData.id) {
        // Update existing kit
        await equipmentKitsAPI.update(kitData.id, kitData);
        showToast('Kit updated successfully', 'success');
      } else {
        // Create new kit
        await equipmentKitsAPI.create(kitData);
        showToast('Kit created successfully', 'success');
      }
      loadData();
      setShowCreateModal(false);
      setEditingKit(null);
    } catch (error) {
      showToast('Failed to save kit: ' + error.message, 'error');
    }
  };

  const handleDeleteKit = async (kitId) => {
    if (!confirm('Are you sure you want to delete this kit?')) return;

    try {
      await equipmentKitsAPI.delete(kitId);
      showToast('Kit deleted successfully', 'success');
      loadData();
    } catch (error) {
      showToast('Failed to delete kit: ' + error.message, 'error');
    }
  };

  const handleEditKit = (kit) => {
    setEditingKit(kit);
    setShowCreateModal(true);
  };

  return (
    <div className="kit-management">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Equipment Kits Management</h2>
          <p className="subtitle">
            Create preset equipment kits that students can quickly book
          </p>
        </div>
        <button
          onClick={handleCreateKit}
          className="btn btn-primary"
          data-testid="create-kit-btn"
        >
          + Create New Kit
        </button>
      </div>

      {kits.length === 0 ? (
        <div className="empty-state">
          <h3>No Equipment Kits Yet</h3>
          <p>Create your first equipment kit to help students quickly book common equipment combinations.</p>
          <button onClick={handleCreateKit} className="btn btn-primary">
            Create First Kit
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {kits.map(kit => {
            const kitEquipment = equipment.filter(eq => kit.equipment_ids?.includes(eq.id));

            return (
              <div
                key={kit.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: '1.5rem'
                }}
                data-testid="kit-item"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>
                      {kit.name}
                    </h3>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>
                      {kit.description}
                    </p>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span className="role-badge">
                        {kit.department === 'all' ? 'All Departments' : kit.department}
                      </span>
                      <span style={{ marginLeft: '1rem' }}>
                        {kitEquipment.length} item{kitEquipment.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEditKit(kit)}
                      className="btn btn-secondary btn-sm"
                      data-testid="edit-kit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteKit(kit.id)}
                      className="btn btn-danger btn-sm"
                      data-testid="delete-kit-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {kitEquipment.length > 0 && (
                  <div>
                    <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                      Equipment in this kit:
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                      {kitEquipment.map(eq => (
                        <div
                          key={eq.id}
                          style={{
                            padding: '0.5rem',
                            background: 'var(--surface)',
                            borderRadius: 'var(--border-radius)',
                            fontSize: '0.875rem'
                          }}
                        >
                          <div style={{ fontWeight: '600' }}>{eq.product_name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                            {eq.category}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <KitEditModal
          kit={editingKit}
          equipment={equipment}
          onSave={handleSaveKit}
          onClose={() => {
            setShowCreateModal(false);
            setEditingKit(null);
          }}
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
    </div>
  );
}

function KitEditModal({ kit, equipment, onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: kit?.id || null,
    name: kit?.name || '',
    description: kit?.description || '',
    department: kit?.department || 'all',
    equipment_ids: kit?.equipment_ids || []
  });

  const departments = ['all', 'Moving Image Design', 'Graphic Design', 'Illustration'];
  const categories = [...new Set(equipment.map(eq => eq.category))];

  const toggleEquipment = (equipmentId) => {
    setFormData(prev => ({
      ...prev,
      equipment_ids: prev.equipment_ids.includes(equipmentId)
        ? prev.equipment_ids.filter(id => id !== equipmentId)
        : [...prev.equipment_ids, equipmentId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.equipment_ids.length === 0) {
      alert('Please select at least one piece of equipment');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}
      >
        <div className="modal-header">
          <h2>{kit?.id ? 'Edit Equipment Kit' : 'Create New Equipment Kit'}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Kit Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 'Documentary Filming Kit'"
                className="form-input"
                required
                data-testid="kit-name-input"
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this kit is for..."
                rows={3}
                required
                data-testid="kit-description-input"
              />
            </div>

            <div className="form-group">
              <label>Department Access</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="form-input"
                data-testid="kit-department-select"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Select Equipment ({formData.equipment_ids.length} selected) *
              </label>
              <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', padding: '1rem' }}>
                {categories.map(category => {
                  const categoryEquipment = equipment.filter(eq => eq.category === category);

                  return (
                    <div key={category} style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-primary)' }}>{category}</h4>
                      <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {categoryEquipment.map(eq => (
                          <label
                            key={eq.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.75rem',
                              background: formData.equipment_ids.includes(eq.id) ? 'rgba(102, 126, 234, 0.1)' : 'var(--surface)',
                              borderRadius: 'var(--border-radius)',
                              cursor: 'pointer',
                              border: `1px solid ${formData.equipment_ids.includes(eq.id) ? 'var(--primary-color)' : 'var(--border-color)'}`
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.equipment_ids.includes(eq.id)}
                              onChange={() => toggleEquipment(eq.id)}
                              style={{ width: '18px', height: '18px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600' }}>{eq.product_name}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                {eq.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" data-testid="save-kit-btn">
                {kit?.id ? 'Update Kit' : 'Create Kit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
