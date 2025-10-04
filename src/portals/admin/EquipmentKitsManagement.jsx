import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getKitsByDepartment, deleteKit } from '../../services/equipmentKits.service';
import EquipmentKitForm from './EquipmentKitForm';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import '../../styles/equipment-kits.css';

export default function EquipmentKitsManagement() {
  const { user } = useAuth();
  const [kits, setKits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadKits();
  }, [showInactive]);

  const loadKits = async () => {
    setLoading(true);
    try {
      const departmentKits = await getKitsByDepartment(user.department, !showInactive);
      setKits(departmentKits);
    } catch (error) {
      console.error('Failed to load kits:', error);
      showToast('Failed to load equipment kits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKit = () => {
    setEditingKit(null);
    setShowForm(true);
  };

  const handleEditKit = (kit) => {
    setEditingKit(kit);
    setShowForm(true);
  };

  const handleDeleteKit = async (kitId, kitName) => {
    if (!confirm(`Are you sure you want to deactivate "${kitName}"? It will no longer be visible to students.`)) {
      return;
    }

    try {
      await deleteKit(kitId);
      showToast('Kit deactivated successfully', 'success');
      loadKits();
    } catch (error) {
      console.error('Failed to delete kit:', error);
      showToast('Failed to deactivate kit', 'error');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingKit(null);
  };

  const handleFormSuccess = () => {
    showToast(editingKit ? 'Kit updated successfully' : 'Kit created successfully', 'success');
    loadKits();
    handleFormClose();
  };

  if (loading) {
    return (
      <div className="equipment-kits-management">
        <h2>Equipment Kits Management</h2>
        <p>Loading kits...</p>
      </div>
    );
  }

  return (
    <div className="equipment-kits-management">
      <div className="page-header">
        <div>
          <h2>Equipment Kits Management</h2>
          <p className="subtitle">
            Create equipment bundles that students in your department can book as a single unit
          </p>
        </div>
        <button onClick={handleCreateKit} className="btn btn-primary">
          + Create New Kit
        </button>
      </div>

      <div className="kits-controls">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive kits
        </label>
        <div className="kits-count">
          {kits.length} kit{kits.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {kits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No equipment kits yet</h3>
          <p>Create your first equipment kit to help students book commonly used equipment bundles together.</p>
          <button onClick={handleCreateKit} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Create Your First Kit
          </button>
        </div>
      ) : (
        <div className="kits-grid">
          {kits.map(kit => (
            <div key={kit.id} className={`kit-card ${!kit.is_active ? 'inactive' : ''}`}>
              <div className="kit-header">
                <div className="kit-title-section">
                  <h3>{kit.name}</h3>
                  {!kit.is_active && (
                    <span className="inactive-badge">Inactive</span>
                  )}
                </div>
                {kit.image_url && (
                  <div className="kit-image">
                    <img src={kit.image_url} alt={kit.name} />
                  </div>
                )}
              </div>

              <p className="kit-description">{kit.description}</p>

              <div className="kit-equipment-list">
                <strong>Equipment in this kit ({kit.equipment_ids.length} items):</strong>
                <ul>
                  {kit.equipment_ids.slice(0, 5).map((eqId, index) => (
                    <li key={eqId}>Equipment ID: {eqId}</li>
                  ))}
                  {kit.equipment_ids.length > 5 && (
                    <li className="more-items">+ {kit.equipment_ids.length - 5} more items</li>
                  )}
                </ul>
              </div>

              <div className="kit-metadata">
                <small>Created: {new Date(kit.created_at).toLocaleDateString()}</small>
              </div>

              <div className="kit-actions">
                <button
                  onClick={() => handleEditKit(kit)}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                {kit.is_active && (
                  <button
                    onClick={() => handleDeleteKit(kit.id, kit.name)}
                    className="btn btn-danger btn-sm"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EquipmentKitForm
          kit={editingKit}
          departmentId={user.department}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
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
