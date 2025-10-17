import { useEffect } from 'react';
import EquipmentImage from './EquipmentImage';
import '../../styles/equipment-quick-view.css';

export default function EquipmentQuickView({ equipment, onClose, onBookClick, onViewFullDetails }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="quick-view-overlay"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div className="quick-view-content">
        {/* Close button */}
        <button
          className="quick-view-close"
          onClick={onClose}
          aria-label="Close quick view"
        >
          ×
        </button>

        {/* Image section */}
        <div className="quick-view-image-section">
          <EquipmentImage
            equipment={equipment}
            size="large"
          />
        </div>

        {/* Details section */}
        <div className="quick-view-details-section">
          <h2 id="quick-view-title" className="quick-view-title">
            {equipment.product_name}
          </h2>

          <div className="quick-view-meta">
            <span className={`status status-${equipment.status}`}>
              {equipment.status}
            </span>
            <span className="quick-view-category">{equipment.category}</span>
          </div>

          <p className="quick-view-description">
            {equipment.description}
          </p>

          {/* Key specs */}
          <div className="quick-view-specs">
            <h3>Details</h3>
            <div className="spec-grid">
              <div className="spec-item">
                <span className="spec-label">Department</span>
                <span className="spec-value">{equipment.department}</span>
              </div>
              {equipment.tracking_number && (
                <div className="spec-item">
                  <span className="spec-label">Tracking</span>
                  <span className="spec-value">{equipment.tracking_number}</span>
                </div>
              )}
              {equipment.specifications && (
                <div className="spec-item spec-full-width">
                  <span className="spec-label">Specifications</span>
                  <span className="spec-value">{equipment.specifications}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cross-department badge if applicable */}
          {equipment.isCrossDepartment && (
            <div className="quick-view-cross-dept">
              <strong>🔄 Cross-Department Access</strong>
              <p>From {equipment.lendingDepartment}</p>
              {equipment.collectionInstructions && (
                <p className="collection-info">{equipment.collectionInstructions}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="quick-view-actions">
            {equipment.status === 'available' ? (
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  onClose();
                  onBookClick(equipment);
                }}
              >
                Book Equipment
              </button>
            ) : (
              <button className="btn btn-secondary btn-block" disabled>
                Not Available
              </button>
            )}
            {onViewFullDetails && (
              <button
                className="btn btn-secondary btn-block"
                onClick={onViewFullDetails}
              >
                View Full Details
              </button>
            )}
            <button
              className="btn btn-secondary btn-block"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
