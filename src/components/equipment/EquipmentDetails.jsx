export default function EquipmentDetails({ equipment, onClose, onBookClick }) {
  if (!equipment) return null;

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="modal-overlay">
      <div
        className="modal-content equipment-details"
        onClick={(e) => e.stopPropagation()}
        data-testid="equipment-details"
      >
        <div className="modal-header">
          <h2>{equipment.product_name}</h2>
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="equipment-image-large">
            <div className="equipment-category-label">
              {equipment.category}
            </div>
          </div>

          <div className="equipment-details-info">
            <div className="detail-row">
              <span className="label">Category:</span>
              <span className="value">{equipment.category}</span>
            </div>

            <div className="detail-row">
              <span className="label">Department:</span>
              <span className="value">{equipment.department}</span>
            </div>

            <div className="detail-row">
              <span className="label">Status:</span>
              <span className={`status status-${equipment.status}`}>
                {equipment.status}
              </span>
            </div>

            <div className="detail-row detail-description">
              <span className="label">Description:</span>
              <p className="value">{equipment.description}</p>
            </div>

            {equipment.link_to_image && (
              <div className="detail-row">
                <span className="label">Manufacturer Link:</span>
                <a href={equipment.link_to_image} target="_blank" rel="noopener noreferrer">
                  View Product Info
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
          {equipment.status === 'available' && onBookClick && (
            <button
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onBookClick(equipment);
              }}
              data-testid="book-from-details-btn"
            >
              Book Equipment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
