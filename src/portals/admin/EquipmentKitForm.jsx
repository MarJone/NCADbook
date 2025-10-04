import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createKit, updateKit } from '../../services/equipmentKits.service';
import { demoMode } from '../../mocks/demo-mode';

export default function EquipmentKitForm({ kit, departmentId, onClose, onSuccess }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipment, setLoadingEquipment] = useState(true);

  useEffect(() => {
    loadAvailableEquipment();

    if (kit) {
      // Editing existing kit
      setName(kit.name);
      setDescription(kit.description || '');
      setImageUrl(kit.image_url || '');
      setSelectedEquipment(kit.equipment_ids || []);
    }
  }, [kit]);

  const loadAvailableEquipment = async () => {
    setLoadingEquipment(true);
    try {
      // Get all equipment from this department
      const allEquipment = await demoMode.query('equipment', { department: departmentId });
      setAvailableEquipment(allEquipment);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoadingEquipment(false);
    }
  };

  const handleEquipmentToggle = (equipmentId) => {
    setSelectedEquipment(prev => {
      if (prev.includes(equipmentId)) {
        return prev.filter(id => id !== equipmentId);
      } else {
        return [...prev, equipmentId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedEquipment(availableEquipment.map(eq => eq.id));
  };

  const handleDeselectAll = () => {
    setSelectedEquipment([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || selectedEquipment.length === 0) {
      alert('Please provide a kit name and select at least one equipment item');
      return;
    }

    setLoading(true);
    try {
      const kitData = {
        name: name.trim(),
        description: description.trim(),
        department_id: departmentId,
        created_by: user.id,
        equipment_ids: selectedEquipment,
        image_url: imageUrl.trim()
      };

      if (kit) {
        // Update existing kit
        await updateKit(kit.id, kitData);
      } else {
        // Create new kit
        await createKit(kitData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save kit:', error);
      alert('Failed to save kit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Group equipment by category
  const groupedEquipment = availableEquipment.reduce((acc, eq) => {
    const category = eq.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(eq);
    return acc;
  }, {});

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content kit-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{kit ? 'Edit Equipment Kit' : 'Create New Equipment Kit'}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Kit Details</h3>

            <div className="form-group">
              <label htmlFor="kit-name">Kit Name *</label>
              <input
                type="text"
                id="kit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Video Production Starter Kit"
                required
                maxLength="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="kit-description">Description</label>
              <textarea
                id="kit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this kit is for and when students should use it..."
                rows="3"
                maxLength="500"
              />
              <small>{description.length} / 500 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="kit-image">Image URL (optional)</label>
              <input
                type="url"
                id="kit-image"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/kit-image.jpg"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="equipment-selection-header">
              <h3>Select Equipment ({selectedEquipment.length} selected)</h3>
              <div className="selection-actions">
                <button type="button" onClick={handleSelectAll} className="btn btn-secondary btn-sm">
                  Select All
                </button>
                <button type="button" onClick={handleDeselectAll} className="btn btn-secondary btn-sm">
                  Deselect All
                </button>
              </div>
            </div>

            {loadingEquipment ? (
              <p>Loading equipment...</p>
            ) : availableEquipment.length === 0 ? (
              <div className="empty-state-small">
                <p>No equipment found in your department. Add equipment first to create kits.</p>
              </div>
            ) : (
              <div className="equipment-selection-list">
                {Object.entries(groupedEquipment).map(([category, items]) => (
                  <div key={category} className="equipment-category">
                    <h4>{category} ({items.length})</h4>
                    <div className="equipment-items">
                      {items.map(eq => (
                        <label key={eq.id} className="equipment-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedEquipment.includes(eq.id)}
                            onChange={() => handleEquipmentToggle(eq.id)}
                          />
                          <span className="equipment-label">
                            <strong>{eq.product_name}</strong>
                            <small>{eq.tracking_number}</small>
                          </span>
                          <span className={`equipment-status status-${eq.status}`}>
                            {eq.status}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || selectedEquipment.length === 0}
            >
              {loading ? 'Saving...' : (kit ? 'Update Kit' : 'Create Kit')}
            </button>
          </div>
        </form>

        <style jsx>{`
          .kit-form-modal {
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .form-section {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid #eee;
          }

          .form-section:last-of-type {
            border-bottom: none;
          }

          .form-section h3 {
            margin: 0 0 1rem 0;
            color: #333;
            font-size: 1.1rem;
          }

          .form-group {
            margin-bottom: 1rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #333;
          }

          .form-group input[type="text"],
          .form-group input[type="url"],
          .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-size: 1rem;
            font-family: inherit;
          }

          .form-group textarea {
            resize: vertical;
          }

          .form-group small {
            display: block;
            margin-top: 0.25rem;
            color: #666;
            font-size: 0.875rem;
          }

          .equipment-selection-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }

          .selection-actions {
            display: flex;
            gap: 0.5rem;
          }

          .equipment-selection-list {
            max-height: 400px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 1rem;
          }

          .equipment-category {
            margin-bottom: 1.5rem;
          }

          .equipment-category:last-child {
            margin-bottom: 0;
          }

          .equipment-category h4 {
            margin: 0 0 0.75rem 0;
            color: #666;
            font-size: 0.95rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .equipment-items {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .equipment-checkbox {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .equipment-checkbox:hover {
            background-color: #f0f0f0;
            border-color: #1976d2;
          }

          .equipment-checkbox input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }

          .equipment-label {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .equipment-label strong {
            color: #333;
          }

          .equipment-label small {
            color: #666;
            font-size: 0.85rem;
          }

          .equipment-status {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: capitalize;
          }

          .status-available {
            background-color: #d4edda;
            color: #155724;
          }

          .status-booked {
            background-color: #fff3cd;
            color: #856404;
          }

          .status-maintenance {
            background-color: #f8d7da;
            color: #721c24;
          }

          .empty-state-small {
            text-align: center;
            padding: 2rem;
            color: #666;
            background-color: #f5f5f5;
            border-radius: 4px;
          }

          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            margin-top: 2rem;
            padding-top: 1.5rem;
            border-top: 1px solid #eee;
          }

          @media (max-width: 768px) {
            .kit-form-modal {
              max-width: 95vw;
              padding: 1rem;
            }

            .equipment-selection-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 1rem;
            }

            .selection-actions {
              width: 100%;
            }

            .selection-actions button {
              flex: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
