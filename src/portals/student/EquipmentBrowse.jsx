import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';

export default function EquipmentBrowse() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEquipment();
  }, [filter]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const filters = filter === 'all' ? {} : { category: filter };
      const data = await demoMode.query('equipment', filters);
      setEquipment(data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'Camera', 'Computer', 'Lighting', 'Support'];

  return (
    <div className="equipment-browse">
      <div className="browse-header">
        <h2>Browse Equipment</h2>
        <div className="filter-controls">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={filter === cat ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading equipment...</div>
      ) : (
        <div className="equipment-grid">
          {equipment.map(item => (
            <div key={item.id} className="equipment-card">
              <div className="equipment-image">
                <div className="image-placeholder">
                  {item.category === 'Camera' ? '📷' : 
                   item.category === 'Computer' ? '💻' :
                   item.category === 'Lighting' ? '💡' : '🎬'}
                </div>
              </div>
              <div className="equipment-info">
                <h3>{item.product_name}</h3>
                <p className="category">{item.category}</p>
                <p className="description">{item.description}</p>
                <div className="equipment-meta">
                  <span className={`status status-${item.status}`}>
                    {item.status}
                  </span>
                  <span className="department">{item.department}</span>
                </div>
                <button className="btn btn-primary btn-block">
                  Book Equipment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
