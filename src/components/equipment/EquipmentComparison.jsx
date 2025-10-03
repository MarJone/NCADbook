import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';

export default function EquipmentComparison({ initialEquipmentIds = [], onClose }) {
  const [selectedIds, setSelectedIds] = useState(initialEquipmentIds.slice(0, 3));
  const [equipment, setEquipment] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, [selectedIds]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      // Load all equipment for selection
      const all = await demoMode.query('equipment');
      setAllEquipment(all);

      // Load selected equipment details
      if (selectedIds.length > 0) {
        const selected = await Promise.all(
          selectedIds.map(id => demoMode.findOne('equipment', { id }))
        );
        setEquipment(selected.filter(Boolean));
      } else {
        setEquipment([]);
      }
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = (equipmentId) => {
    if (selectedIds.length >= 3) {
      return;
    }

    if (!selectedIds.includes(equipmentId)) {
      setSelectedIds([...selectedIds, equipmentId]);
    }
  };

  const handleRemoveEquipment = (equipmentId) => {
    setSelectedIds(selectedIds.filter(id => id !== equipmentId));
  };

  const comparisonFields = [
    { key: 'product_name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status' },
    { key: 'description', label: 'Description' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content comparison-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Compare Equipment</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {equipment.length === 0 ? (
            <div className="comparison-empty">
              <p>Select up to 3 items to compare</p>
              <div className="equipment-selector">
                <label htmlFor="equipment-select">Add Equipment:</label>
                <select
                  id="equipment-select"
                  onChange={(e) => handleAddEquipment(e.target.value)}
                  value=""
                  disabled={selectedIds.length >= 3}
                  data-testid="equipment-select"
                >
                  <option value="">Choose equipment...</option>
                  {allEquipment
                    .filter(item => !selectedIds.includes(item.id))
                    .map(item => (
                      <option key={item.id} value={item.id}>
                        {item.product_name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              {selectedIds.length < 3 && (
                <div className="comparison-add-more">
                  <label htmlFor="add-equipment-select">Add Another:</label>
                  <select
                    id="add-equipment-select"
                    onChange={(e) => handleAddEquipment(e.target.value)}
                    value=""
                    data-testid="add-equipment-select"
                  >
                    <option value="">Choose equipment...</option>
                    {allEquipment
                      .filter(item => !selectedIds.includes(item.id))
                      .map(item => (
                        <option key={item.id} value={item.id}>
                          {item.product_name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="comparison-table-container">
                <table className="comparison-table" data-testid="comparison-table">
                  <thead>
                    <tr>
                      <th>Specification</th>
                      {equipment.map((item, index) => (
                        <th key={item.id}>
                          <div className="comparison-header">
                            <span>{item.product_name}</span>
                            <button
                              onClick={() => handleRemoveEquipment(item.id)}
                              className="btn-icon"
                              aria-label={`Remove ${item.product_name}`}
                              data-testid={`remove-${index}`}
                            >
                              ×
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFields.map(field => (
                      <tr key={field.key}>
                        <td className="comparison-label">{field.label}</td>
                        {equipment.map(item => (
                          <td key={`${item.id}-${field.key}`}>
                            {field.key === 'status' ? (
                              <span className={`status status-${item[field.key]}`}>
                                {item[field.key]}
                              </span>
                            ) : (
                              item[field.key] || 'N/A'
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
