import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getKitsByDepartment, getKitById, checkKitAvailability, bookKit } from '../../services/equipmentKits.service';
import '../../styles/kit-browser.css';

export default function KitBrowser({ onBookingSuccess }) {
  const { user } = useAuth();
  const [kits, setKits] = useState([]);
  const [selectedKit, setSelectedKit] = useState(null);
  const [kitDetails, setKitDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingDates, setBookingDates] = useState({ start: '', end: '' });
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [booking, setBooking] = useState(false);
  const [justification, setJustification] = useState('');

  useEffect(() => {
    loadKits();
  }, []);

  const loadKits = async () => {
    setLoading(true);
    try {
      const departmentKits = await getKitsByDepartment(user.department, true);
      setKits(departmentKits);
    } catch (error) {
      console.error('Failed to load kits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKitSelect = async (kit) => {
    setSelectedKit(kit);
    setBookingDates({ start: '', end: '' });
    setAvailability(null);
    setJustification('');

    try {
      const details = await getKitById(kit.id);
      setKitDetails(details);
    } catch (error) {
      console.error('Failed to load kit details:', error);
    }
  };

  const handleCheckAvailability = async () => {
    if (!bookingDates.start || !bookingDates.end) {
      alert('Please select both start and end dates');
      return;
    }

    setCheckingAvailability(true);
    try {
      const result = await checkKitAvailability(selectedKit.id, bookingDates.start, bookingDates.end);
      setAvailability(result);
    } catch (error) {
      console.error('Failed to check availability:', error);
      alert('Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleBookKit = async () => {
    if (!availability || !availability.available) {
      alert('Please check availability first');
      return;
    }

    if (justification.trim().length < 30) {
      alert('Please provide a justification (minimum 30 characters)');
      return;
    }

    setBooking(true);
    try {
      await bookKit({
        kitId: selectedKit.id,
        userId: user.id,
        startDate: bookingDates.start,
        endDate: bookingDates.end,
        justification: justification.trim()
      });

      alert(`Kit booked successfully! ${kitDetails.equipment_ids.length} individual bookings created. Awaiting admin approval.`);
      setSelectedKit(null);
      setKitDetails(null);
      setBookingDates({ start: '', end: '' });
      setAvailability(null);
      setJustification('');

      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error('Failed to book kit:', error);
      alert(error.message || 'Failed to book kit');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="kit-browser">
        <p>Loading equipment kits...</p>
      </div>
    );
  }

  if (kits.length === 0) {
    return (
      <div className="kit-browser">
        <div className="empty-state-small">
          <p>No equipment kits available for your department yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="kit-browser">
      <h3>Equipment Kits</h3>
      <p className="kit-browser-subtitle">
        Book pre-configured equipment bundles for common use cases
      </p>

      <div className="kits-list">
        {kits.map(kit => (
          <div
            key={kit.id}
            className={`kit-item ${selectedKit?.id === kit.id ? 'selected' : ''}`}
            onClick={() => handleKitSelect(kit)}
          >
            {kit.image_url && (
              <div className="kit-item-image">
                <img src={kit.image_url} alt={kit.name} />
              </div>
            )}
            <div className="kit-item-info">
              <h4>{kit.name}</h4>
              <p>{kit.description}</p>
              <small>{kit.equipment_ids.length} items in this kit</small>
            </div>
          </div>
        ))}
      </div>

      {selectedKit && kitDetails && (
        <div className="kit-details-panel">
          <h4>Book: {selectedKit.name}</h4>

          <div className="kit-equipment">
            <strong>Equipment in this kit:</strong>
            <ul>
              {kitDetails.equipment.map(eq => (
                <li key={eq.id}>
                  {eq.product_name} ({eq.tracking_number}) - <span className={`status-${eq.status}`}>{eq.status}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="booking-form">
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={bookingDates.start}
                  onChange={(e) => setBookingDates({ ...bookingDates, start: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={bookingDates.end}
                  onChange={(e) => setBookingDates({ ...bookingDates, end: e.target.value })}
                  min={bookingDates.start || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <button
              onClick={handleCheckAvailability}
              className="btn btn-secondary btn-sm"
              disabled={!bookingDates.start || !bookingDates.end || checkingAvailability}
            >
              {checkingAvailability ? 'Checking...' : 'Check Availability'}
            </button>

            {availability && (
              <div className={`availability-result ${availability.available ? 'available' : 'unavailable'}`}>
                {availability.available ? (
                  <p><strong>✓ All equipment available!</strong> You can proceed with booking.</p>
                ) : (
                  <div>
                    <p><strong>✗ Some equipment unavailable</strong></p>
                    <ul>
                      {availability.unavailableItems.map((item, index) => (
                        <li key={index}>
                          {item.equipment.product_name} - Booked {item.conflictingBookings.length} time(s)
                        </li>
                      ))}
                    </ul>
                    <p className="suggestion">Please select different dates or book individual items instead.</p>
                  </div>
                )}
              </div>
            )}

            {availability?.available && (
              <div className="justification-section">
                <label>Justification *</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why you need this equipment kit (minimum 30 characters)..."
                  rows="3"
                  minLength="30"
                />
                <small className={justification.length < 30 ? 'text-error' : 'text-success'}>
                  {justification.length} / 30 characters minimum
                </small>
              </div>
            )}

            <div className="booking-actions">
              <button
                onClick={() => {
                  setSelectedKit(null);
                  setKitDetails(null);
                  setAvailability(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              {availability?.available && (
                <button
                  onClick={handleBookKit}
                  className="btn btn-primary"
                  disabled={booking || justification.length < 30}
                >
                  {booking ? 'Booking...' : `Book Kit (${kitDetails.equipment_ids.length} items)`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
