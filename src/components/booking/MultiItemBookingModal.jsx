import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { equipmentAPI, bookingsAPI } from '../../utils/api';
import { kitStorage } from '../../utils/kitStorage';
import BookingProgress from './BookingProgress';

export default function MultiItemBookingModal({ onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: Select dates, 2: Select equipment, 3: Submit
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveAsKit, setSaveAsKit] = useState(false);
  const [kitName, setKitName] = useState('');

  useEffect(() => {
    if (step === 2 && startDate && endDate) {
      loadAvailableEquipment();
    }
  }, [step, startDate, endDate]);

  const loadAvailableEquipment = async () => {
    setLoading(true);
    try {
      // Fetch available equipment from API
      const response = await equipmentAPI.getAll({ status: 'available' });
      setAvailableEquipment(response.equipment || []);
    } catch (err) {
      setError('Failed to load available equipment');
      console.error(err);
      setAvailableEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError('Start date cannot be in the past');
      return;
    }

    if (end < start) {
      setError('End date must be after start date');
      return;
    }

    setStep(2);
  };

  const toggleItemSelection = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedItems.length === 0) {
      setError('Please select at least one item');
      return;
    }

    if (!purpose.trim()) {
      setError('Please provide a purpose for this booking');
      return;
    }

    setLoading(true);

    try {
      // Save as kit if requested
      if (saveAsKit && kitName.trim()) {
        kitStorage.saveUserKit(user.id, {
          name: kitName,
          equipment_ids: selectedItems.map(item => item.id)
        });
      }

      // Create a booking for each selected item
      for (const item of selectedItems) {
        await bookingsAPI.create({
          equipment_id: item.id,
          start_date: startDate,
          end_date: endDate,
          purpose: purpose,
          booking_type: 'standard'
        });
      }

      onSuccess();
    } catch (err) {
      setError('Failed to create booking: ' + err.message);
      setLoading(false);
    }
  };

  const categories = [...new Set(availableEquipment.map(item => item.category))];

  const progressSteps = [
    { id: 'dates', label: 'Select Dates' },
    { id: 'equipment', label: 'Select Equipment' },
    { id: 'confirm', label: 'Confirm' }
  ];

  const getCurrentStepId = () => {
    if (step === 1) return 'dates';
    if (step === 2) return 'equipment';
    return 'confirm';
  };

  const handleStepClick = (stepId) => {
    // Allow backward navigation
    if (stepId === 'dates') setStep(1);
    else if (stepId === 'equipment' && step >= 2) setStep(2);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Book Multiple Items</h2>
          <button onClick={onClose} className="modal-close" aria-label="Close">×</button>
        </div>

        <BookingProgress
          currentStep={getCurrentStepId()}
          steps={progressSteps}
          onStepClick={handleStepClick}
        />

        <div className="modal-body">

          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>
          )}

          {/* Step 1: Select Dates */}
          {step === 1 && (
            <form onSubmit={handleDateSubmit}>
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                  required
                  data-testid="start-date-input"
                />
              </div>

              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                  required
                  data-testid="end-date-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-testid="next-to-equipment-btn">
                  Next: Select Equipment
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Select Equipment */}
          {step === 2 && (
            <div>
              <div style={{
                background: 'var(--surface)',
                padding: '1rem',
                borderRadius: 'var(--border-radius)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Selected Dates</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                </p>
                {selectedItems.length > 0 && (
                  <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading available equipment...</div>
              ) : (
                <>
                  {categories.map(category => {
                    const categoryItems = availableEquipment.filter(item => item.category === category);
                    if (categoryItems.length === 0) return null;

                    return (
                      <div key={category} style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-primary)' }}>{category}</h4>
                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {categoryItems.map(item => {
                            const isSelected = selectedItems.find(i => i.id === item.id);
                            return (
                              <div
                                key={item.id}
                                onClick={() => toggleItemSelection(item)}
                                style={{
                                  padding: '1rem',
                                  border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                  borderRadius: 'var(--border-radius)',
                                  cursor: 'pointer',
                                  background: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'white',
                                  transition: 'all 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '1rem'
                                }}
                                data-testid="equipment-selection-item"
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  style={{ width: '20px', height: '20px' }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                    {item.product_name}
                                  </div>
                                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    {item.description}
                                  </div>
                                </div>
                                <div className="equipment-category-label" style={{ fontSize: '0.875rem' }}>
                                  {item.category}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {availableEquipment.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No equipment available for the selected dates.
                    </div>
                  )}
                </>
              )}

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn btn-primary"
                  disabled={selectedItems.length === 0}
                  data-testid="next-to-confirm-btn"
                >
                  Next: Confirm Booking
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm and Submit */}
          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <div style={{
                background: 'var(--surface)',
                padding: '1.5rem',
                borderRadius: 'var(--border-radius)',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>Booking Summary</h4>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Dates:</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    Equipment ({selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                    {selectedItems.map(item => (
                      <li key={item.id}>{item.product_name} ({item.category})</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Purpose / Justification *
                  <span className="required"> Required for booking approval</span>
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Please describe how you plan to use this equipment..."
                  rows={4}
                  required
                  data-testid="booking-purpose"
                />
              </div>

              {/* Save as Kit Option */}
              <div style={{
                background: 'rgba(102, 126, 234, 0.1)',
                padding: '1rem',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--primary-color)',
                marginBottom: '1rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: saveAsKit ? '0.75rem' : '0' }}>
                  <input
                    type="checkbox"
                    checked={saveAsKit}
                    onChange={(e) => setSaveAsKit(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                    data-testid="save-as-kit-checkbox"
                  />
                  <span style={{ fontWeight: '600' }}>Save this selection as a reusable kit</span>
                </label>

                {saveAsKit && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Kit Name *</label>
                    <input
                      type="text"
                      value={kitName}
                      onChange={(e) => setKitName(e.target.value)}
                      placeholder="e.g., 'Documentary Filming Kit' or 'Studio Photography Setup'"
                      className="form-input"
                      required={saveAsKit}
                      data-testid="kit-name-input"
                    />
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
                      This kit will appear in your dashboard for quick rebooking.
                    </p>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary" disabled={loading}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} data-testid="submit-booking-btn">
                  {loading ? 'Submitting...' : 'Submit Booking Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
