import { useState, useEffect } from 'react';
import { equipmentAPI } from '../../utils/api';
import { getDepartmentList } from '../../config/departments';

export default function EquipmentForm({ equipment, onClose, onSuccess, mode = 'add' }) {
  const [formData, setFormData] = useState({
    product_name: '',
    tracking_number: '',
    description: '',
    category: 'Camera',
    department: 'Moving Image Design',
    status: 'available',
    image_url: '',
    qr_code: '',
    requires_justification: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const departments = getDepartmentList();
  const categories = [
    'Camera',
    'Lens',
    'Lighting',
    'Audio',
    'Grip & Support',
    'Computer',
    'Monitor',
    'Storage',
    'Accessories',
    'Other'
  ];

  useEffect(() => {
    if (mode === 'edit' && equipment) {
      setFormData({
        product_name: equipment.product_name || '',
        tracking_number: equipment.tracking_number || '',
        description: equipment.description || '',
        category: equipment.category || 'Camera',
        department: equipment.department || 'Moving Image Design',
        status: equipment.status || 'available',
        image_url: equipment.image_url || '',
        qr_code: equipment.qr_code || '',
        requires_justification: equipment.requires_justification || false
      });
    }
  }, [equipment, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }

    if (!formData.tracking_number.trim()) {
      newErrors.tracking_number = 'Tracking number is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'add') {
        await equipmentAPI.create(formData);
      } else {
        await equipmentAPI.update(equipment.id, formData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to save equipment' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content equipment-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'add' ? 'Add Equipment' : 'Edit Equipment'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {errors.submit && (
            <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
              {errors.submit}
            </div>
          )}

          <div className="form-grid">
            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="product_name">
                Product Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="e.g., Canon EOS R5"
                className={errors.product_name ? 'error' : ''}
              />
              {errors.product_name && <span className="error-text">{errors.product_name}</span>}
            </div>

            {/* Tracking Number */}
            <div className="form-group">
              <label htmlFor="tracking_number">
                Tracking Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="tracking_number"
                name="tracking_number"
                value={formData.tracking_number}
                onChange={handleChange}
                placeholder="e.g., CAM-001"
                className={errors.tracking_number ? 'error' : ''}
              />
              {errors.tracking_number && <span className="error-text">{errors.tracking_number}</span>}
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="department">
                Department <span className="required">*</span>
              </label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={errors.department ? 'error' : ''}
              >
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.department && <span className="error-text">{errors.department}</span>}
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_service">Out of Service</option>
              </select>
            </div>

            {/* QR Code */}
            <div className="form-group">
              <label htmlFor="qr_code">QR Code</label>
              <input
                type="text"
                id="qr_code"
                name="qr_code"
                value={formData.qr_code}
                onChange={handleChange}
                placeholder="Optional"
              />
            </div>

            {/* Description - Full Width */}
            <div className="form-group full-width">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter detailed description..."
                rows="4"
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            {/* Image URL - Full Width */}
            <div className="form-group full-width">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              <small>Enter a URL to an equipment image (optional)</small>
            </div>

            {/* Requires Justification */}
            <div className="form-group full-width">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="requires_justification"
                  checked={formData.requires_justification}
                  onChange={handleChange}
                />
                <span>Requires booking justification</span>
              </label>
              <small>Students must provide a detailed reason when booking this equipment</small>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (mode === 'add' ? 'Adding...' : 'Saving...') : (mode === 'add' ? 'Add Equipment' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .equipment-form-modal {
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          background-color: #ffffff !important;
        }

        .form-group select {
          appearance: none !important;
          background-color: #ffffff !important;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e") !important;
          background-repeat: no-repeat !important;
          background-position: right 12px center !important;
          background-size: 16px !important;
          padding-right: 40px !important;
          cursor: pointer;
          opacity: 1 !important;
        }

        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
          border-color: #c00;
        }

        .error-text {
          color: #c00;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .required {
          color: #c00;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        small {
          color: #666;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .equipment-form-modal {
            max-width: 95%;
          }
        }
      `}</style>
    </div>
  );
}
