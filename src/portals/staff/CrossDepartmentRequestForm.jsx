import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEquipmentAvailabilityByType, determineRequestRouting, createCrossDepartmentRequest } from '../../services/crossDepartmentRequests.service';
import { demoMode } from '../../mocks/demo-mode';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import '../../styles/cross-dept-request.css';

export default function CrossDepartmentRequestForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipmentType, setEquipmentType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [justification, setJustification] = useState('');
  const [availabilityPreview, setAvailabilityPreview] = useState(null);
  const [routingPreview, setRoutingPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Get unique equipment types from all equipment
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  useEffect(() => {
    loadEquipmentTypes();
  }, []);

  const loadEquipmentTypes = async () => {
    try {
      const allEquipment = await demoMode.query('equipment');
      const uniqueTypes = [...new Set(allEquipment.map(eq => eq.product_name))];
      setEquipmentTypes(uniqueTypes.sort());
    } catch (error) {
      console.error('Failed to load equipment types:', error);
    }
  };

  const handleCheckAvailability = async () => {
    if (!equipmentType || quantity < 1) {
      showToast('Please select equipment type and quantity', 'error');
      return;
    }

    setChecking(true);
    try {
      const availability = await getEquipmentAvailabilityByType(equipmentType);
      setAvailabilityPreview(availability);

      const routing = await determineRequestRouting(equipmentType, quantity);
      setRoutingPreview(routing);
    } catch (error) {
      console.error('Failed to check availability:', error);
      showToast('Failed to check availability', 'error');
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!equipmentType || quantity < 1 || !startDate || !endDate || justification.trim().length < 50) {
      showToast('Please fill all required fields. Justification must be at least 50 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        requestingUserId: user.id,
        requestingDepartmentId: user.department,
        equipmentType,
        quantity,
        startDate,
        endDate,
        justification
      };

      const result = await createCrossDepartmentRequest(requestData);

      showToast(
        `Request created successfully! ${result.routingType === 'broadcast' ? `Sent to ${result.requests.length} departments` : 'Sent to 1 department'}`,
        'success'
      );

      // Navigate to My Requests page after short delay
      setTimeout(() => {
        navigate('/staff/my-cross-department-requests');
      }, 1500);
    } catch (error) {
      console.error('Failed to create request:', error);
      showToast(error.message || 'Failed to create request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/staff');
  };

  return (
    <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <button
          onClick={handleCancel}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1rem' }}
        >
          ← Back
        </button>
        <h2>Request Equipment from Another Department</h2>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>
          Request equipment from other departments when your department doesn't have what you need
        </p>
      </div>

      <div className="cross-dept-request-form">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h3>Equipment Details</h3>

            <div className="form-group">
              <label htmlFor="equipment-type">Equipment Type *</label>
              <select
                id="equipment-type"
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                required
              >
                <option value="">Select equipment type...</option>
                {equipmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <small>Select the type of equipment you need</small>
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                required
              />
              <small>How many items do you need?</small>
            </div>

            <button
              type="button"
              onClick={handleCheckAvailability}
              className="btn btn-secondary btn-sm"
              disabled={!equipmentType || quantity < 1 || checking}
              style={{ marginTop: '0.5rem' }}
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>
          </div>

          {availabilityPreview && (
            <div className="availability-preview">
              <h4>Equipment Availability Across Departments</h4>
              {availabilityPreview.length === 0 ? (
                <p className="no-availability">No departments have "{equipmentType}" available</p>
              ) : (
                <table className="availability-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availabilityPreview.map(dept => (
                      <tr key={dept.departmentId}>
                        <td>{dept.departmentName}</td>
                        <td className="availability-count">{dept.availableCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {routingPreview && (
            <div className={`routing-preview routing-${routingPreview.routingType}`}>
              <h4>
                {routingPreview.routingType === 'single' && '📍 Single Department Request'}
                {routingPreview.routingType === 'broadcast' && '📢 Broadcast Request'}
              </h4>
              <p>{routingPreview.message}</p>
            </div>
          )}

          <div className="form-section">
            <h3>Booking Dates</h3>

            <div className="form-group">
              <label htmlFor="start-date">Start Date *</label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end-date">End Date *</label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Justification</h3>
            <div className="form-group">
              <label htmlFor="justification">
                Why do you need this equipment? *
              </label>
              <textarea
                id="justification"
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                rows="5"
                placeholder="Provide a detailed justification for your request (minimum 50 characters)..."
                required
                minLength="50"
              />
              <small className={justification.length < 50 ? 'text-error' : 'text-success'}>
                {justification.length} / 50 characters minimum
              </small>
            </div>
          </div>

          <div className="form-actions" style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #dee2e6'
          }}>
            <button type="button" onClick={handleCancel} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || (routingPreview && routingPreview.routingType === 'none')}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>

        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
