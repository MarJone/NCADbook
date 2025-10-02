import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import BookingModal from '../../components/booking/BookingModal';
import EquipmentDetails from '../../components/equipment/EquipmentDetails';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

export default function EquipmentBrowse() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

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

  const handleCardClick = (item) => {
    setSelectedEquipment(item);
    setShowDetails(true);
  };

  const handleBookClick = (item) => {
    if (item.status !== 'available') {
      showToast('This equipment is not available for booking', 'error');
      return;
    }
    setSelectedEquipment(item);
    setShowModal(true);
  };

  const handleBookingSuccess = () => {
    showToast('Booking created successfully! Awaiting admin approval.', 'success');
    setShowModal(false);
  };

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
            <div key={item.id} className="equipment-card" data-testid="equipment-card">
              <div className="equipment-image" onClick={() => handleCardClick(item)} style={{ cursor: 'pointer' }}>
                <div className="image-placeholder">
                  {item.category === 'Camera' ? '📷' :
                   item.category === 'Computer' ? '💻' :
                   item.category === 'Lighting' ? '💡' : '🎬'}
                </div>
              </div>
              <div className="equipment-info">
                <h3 onClick={() => handleCardClick(item)} style={{ cursor: 'pointer' }}>{item.product_name}</h3>
                <p className="category">{item.category}</p>
                <p className="description">{item.description}</p>
                <div className="equipment-meta">
                  <span className={`status status-${item.status}`}>
                    {item.status}
                  </span>
                  <span className="department">{item.department}</span>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookClick(item);
                  }}
                  disabled={item.status !== 'available'}
                  data-testid="book-equipment-btn"
                >
                  {item.status === 'available' ? 'Book Equipment' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetails && selectedEquipment && (
        <EquipmentDetails
          equipment={selectedEquipment}
          onClose={() => setShowDetails(false)}
          onBookClick={handleBookClick}
        />
      )}

      {showModal && selectedEquipment && (
        <BookingModal
          equipment={selectedEquipment}
          onClose={() => setShowModal(false)}
          onSuccess={handleBookingSuccess}
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
