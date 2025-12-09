import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { equipmentAPI } from '../../utils/api';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import './AccessoryManager.css';

/**
 * AccessoryManager - Manage accessories bundled with equipment
 *
 * Allows admins to:
 * - View accessories for a specific equipment item
 * - Add new accessories (batteries, cables, chargers, etc.)
 * - Edit existing accessories
 * - Remove accessories
 * - Mark accessories as required or optional
 */
export default function AccessoryManager() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();

  // Get equipment ID from URL params
  const equipmentId = searchParams.get('equipment');

  // State
  const [equipment, setEquipment] = useState(null);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for new/edit accessory
  const [formData, setFormData] = useState({
    accessory_name: '',
    accessory_description: '',
    is_required: true,
    quantity: 1,
    sort_order: 0
  });

  // Load equipment and accessories
  useEffect(() => {
    if (equipmentId) {
      loadEquipmentAndAccessories();
    } else {
      setLoading(false);
    }
  }, [equipmentId]);

  const loadEquipmentAndAccessories = async () => {
    setLoading(true);
    try {
      // Load equipment details
      const equipmentResponse = await equipmentAPI.getById(equipmentId);
      if (equipmentResponse?.equipment) {
        setEquipment(equipmentResponse.equipment);
      } else {
        // Mock equipment for demo
        setEquipment({
          id: equipmentId,
          product_name: 'Sample Equipment',
          category: 'Camera',
          department: 'Moving Image Design'
        });
      }

      // Load accessories
      const accessoriesResponse = await equipmentAPI.getAccessories?.(equipmentId);
      if (accessoriesResponse?.accessories) {
        setAccessories(accessoriesResponse.accessories);
      } else {
        // Mock accessories for demo
        setAccessories([
          { id: 1, accessory_name: 'Battery', accessory_description: 'Main battery pack', is_required: true, quantity: 1, sort_order: 1 },
          { id: 2, accessory_name: 'Charger', accessory_description: 'AC power adapter', is_required: true, quantity: 1, sort_order: 2 },
          { id: 3, accessory_name: 'Carry Case', accessory_description: 'Protective carrying case', is_required: true, quantity: 1, sort_order: 3 },
          { id: 4, accessory_name: 'SD Card', accessory_description: '64GB memory card', is_required: false, quantity: 2, sort_order: 4 },
        ]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load equipment data', 'error');
      // Use mock data
      setEquipment({
        id: equipmentId,
        product_name: 'Sample Equipment',
        category: 'Camera'
      });
      setAccessories([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      accessory_name: '',
      accessory_description: '',
      is_required: true,
      quantity: 1,
      sort_order: accessories.length + 1
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  // Start editing an accessory
  const handleEdit = (accessory) => {
    setFormData({
      accessory_name: accessory.accessory_name,
      accessory_description: accessory.accessory_description || '',
      is_required: accessory.is_required,
      quantity: accessory.quantity || 1,
      sort_order: accessory.sort_order || 0
    });
    setEditingId(accessory.id);
    setShowAddForm(true);
  };

  // Save accessory (create or update)
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.accessory_name.trim()) {
      showToast('Accessory name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        // Update existing
        if (equipmentAPI.updateAccessory) {
          await equipmentAPI.updateAccessory(editingId, formData);
        }
        setAccessories(prev =>
          prev.map(acc =>
            acc.id === editingId
              ? { ...acc, ...formData }
              : acc
          )
        );
        showToast('Accessory updated', 'success');
      } else {
        // Create new
        let newAccessory;
        if (equipmentAPI.createAccessory) {
          const response = await equipmentAPI.createAccessory(equipmentId, formData);
          newAccessory = response.accessory;
        } else {
          // Mock for demo
          newAccessory = {
            id: Date.now(),
            equipment_id: parseInt(equipmentId),
            ...formData
          };
        }
        setAccessories(prev => [...prev, newAccessory]);
        showToast('Accessory added', 'success');
      }
      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save accessory: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete accessory
  const handleDelete = async (accessoryId) => {
    const confirm = window.confirm('Are you sure you want to remove this accessory?');
    if (!confirm) return;

    try {
      if (equipmentAPI.deleteAccessory) {
        await equipmentAPI.deleteAccessory(accessoryId);
      }
      setAccessories(prev => prev.filter(acc => acc.id !== accessoryId));
      showToast('Accessory removed', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      showToast('Failed to remove accessory: ' + error.message, 'error');
    }
  };

  // Reorder accessories (move up/down)
  const handleReorder = async (accessoryId, direction) => {
    const index = accessories.findIndex(a => a.id === accessoryId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= accessories.length) return;

    const newAccessories = [...accessories];
    [newAccessories[index], newAccessories[newIndex]] = [newAccessories[newIndex], newAccessories[index]];

    // Update sort orders
    newAccessories.forEach((acc, i) => {
      acc.sort_order = i + 1;
    });

    setAccessories(newAccessories);

    // Save to backend
    try {
      if (equipmentAPI.reorderAccessories) {
        await equipmentAPI.reorderAccessories(equipmentId, newAccessories.map(a => ({ id: a.id, sort_order: a.sort_order })));
      }
    } catch (error) {
      console.warn('Failed to save order:', error);
    }
  };

  // Navigate back to equipment management
  const handleBack = () => {
    navigate('/admin/equipment');
  };

  // No equipment selected
  if (!equipmentId) {
    return (
      <div className="accessory-manager">
        <div className="accessory-manager__empty">
          <h2>No Equipment Selected</h2>
          <p>Please select an equipment item to manage its accessories.</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Go to Equipment Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accessory-manager" data-testid="accessory-manager">
      {/* Header */}
      <div className="accessory-manager__header">
        <button className="btn-back" onClick={handleBack} aria-label="Back to equipment">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {loading ? (
          <LoadingSkeleton type="text" width="200px" />
        ) : (
          <div className="accessory-manager__title">
            <h2>Manage Accessories</h2>
            <p className="equipment-name">{equipment?.product_name}</p>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          disabled={loading}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Accessory
        </button>
      </div>

      {/* Equipment Info */}
      {!loading && equipment && (
        <div className="accessory-manager__info">
          <div className="info-item">
            <span className="info-label">Category:</span>
            <span className="info-value">{equipment.category || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Department:</span>
            <span className="info-value">{equipment.department || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Accessories:</span>
            <span className="info-value">{accessories.length}</span>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="accessory-form-overlay" onClick={() => resetForm()}>
          <form className="accessory-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSave}>
            <h3>{editingId ? 'Edit Accessory' : 'Add New Accessory'}</h3>

            <div className="form-group">
              <label htmlFor="accessory-name">Name *</label>
              <input
                id="accessory-name"
                type="text"
                value={formData.accessory_name}
                onChange={(e) => setFormData(prev => ({ ...prev, accessory_name: e.target.value }))}
                placeholder="e.g., Battery, Charger, SD Card"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="accessory-description">Description</label>
              <textarea
                id="accessory-description"
                value={formData.accessory_description}
                onChange={(e) => setFormData(prev => ({ ...prev, accessory_description: e.target.value }))}
                placeholder="Optional description or specifications"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="accessory-quantity">Quantity</label>
                <input
                  id="accessory-quantity"
                  type="number"
                  min="1"
                  max="99"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.is_required}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                  />
                  <span>Required for checkout</span>
                </label>
                <p className="form-hint">Required accessories must be present during checkout verification</p>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : (editingId ? 'Update' : 'Add Accessory')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accessories List */}
      <div className="accessory-list">
        {loading ? (
          <LoadingSkeleton type="list-item" count={4} />
        ) : accessories.length === 0 ? (
          <div className="accessory-list__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
            <h3>No Accessories</h3>
            <p>This equipment has no accessories configured yet.</p>
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              Add First Accessory
            </button>
          </div>
        ) : (
          <div className="accessory-cards">
            {accessories
              .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
              .map((accessory, index) => (
                <div key={accessory.id} className="accessory-card">
                  <div className="accessory-card__reorder">
                    <button
                      type="button"
                      className="reorder-btn"
                      onClick={() => handleReorder(accessory.id, 'up')}
                      disabled={index === 0}
                      aria-label="Move up"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="reorder-btn"
                      onClick={() => handleReorder(accessory.id, 'down')}
                      disabled={index === accessories.length - 1}
                      aria-label="Move down"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  <div className="accessory-card__content">
                    <div className="accessory-card__header">
                      <h4 className="accessory-name">
                        {accessory.accessory_name}
                        {accessory.quantity > 1 && (
                          <span className="accessory-qty">x{accessory.quantity}</span>
                        )}
                      </h4>
                      {accessory.is_required ? (
                        <span className="badge badge-required">Required</span>
                      ) : (
                        <span className="badge badge-optional">Optional</span>
                      )}
                    </div>
                    {accessory.accessory_description && (
                      <p className="accessory-description">{accessory.accessory_description}</p>
                    )}
                  </div>

                  <div className="accessory-card__actions">
                    <button
                      type="button"
                      className="action-btn edit"
                      onClick={() => handleEdit(accessory)}
                      aria-label="Edit accessory"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="action-btn delete"
                      onClick={() => handleDelete(accessory.id)}
                      aria-label="Delete accessory"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Toast notifications */}
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
