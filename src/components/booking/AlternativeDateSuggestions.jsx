import { useState, useEffect } from 'react';
import { bookingService } from '../../services/booking.service';

/**
 * AlternativeDateSuggestions Component
 * Shows available date alternatives when there's a booking conflict
 *
 * @param {Object} props
 * @param {string} props.equipmentId - Equipment ID to check
 * @param {string} props.startDate - Requested start date
 * @param {string} props.endDate - Requested end date
 * @param {Function} props.onSelectAlternative - Callback when user selects an alternative
 * @param {boolean} props.hasConflict - Whether there's a conflict to show alternatives for
 */
export default function AlternativeDateSuggestions({
  equipmentId,
  startDate,
  endDate,
  onSelectAlternative,
  hasConflict = false,
}) {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Only fetch alternatives when there's a conflict and we have dates
    if (hasConflict && equipmentId && startDate && endDate) {
      fetchAlternatives();
    } else {
      setAlternatives([]);
    }
  }, [hasConflict, equipmentId, startDate, endDate]);

  const fetchAlternatives = async () => {
    setLoading(true);
    try {
      const results = await bookingService.findAlternativeDates(
        equipmentId,
        startDate,
        endDate
      );
      setAlternatives(results);
      if (results.length > 0) {
        setExpanded(true);
      }
    } catch (error) {
      console.error('Failed to fetch alternatives:', error);
      setAlternatives([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (alternative) => {
    onSelectAlternative?.(alternative.startDate, alternative.endDate);
  };

  // Don't render if no conflict or no alternatives
  if (!hasConflict) return null;

  return (
    <div className="alternative-dates" style={{
      marginTop: '16px',
      padding: '12px',
      backgroundColor: 'var(--theme-warning-bg, #fff3cd)',
      borderRadius: '8px',
      border: '1px solid var(--theme-warning, #ffc107)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: expanded ? '12px' : 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📅</span>
          <strong style={{ color: 'var(--theme-warning-text, #856404)' }}>
            Conflict detected
          </strong>
        </div>
        {alternatives.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--theme-accent-primary, #2563eb)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            {expanded ? 'Hide suggestions' : 'Show alternatives'}
          </button>
        )}
      </div>

      {loading && (
        <div style={{ color: 'var(--theme-text-secondary)', fontSize: '13px' }}>
          Finding available dates...
        </div>
      )}

      {expanded && alternatives.length > 0 && (
        <div>
          <p style={{
            fontSize: '13px',
            color: 'var(--theme-warning-text, #856404)',
            marginBottom: '12px',
          }}>
            This equipment is not available for your selected dates. Here are some alternatives:
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {alternatives.map((alt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(alt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  backgroundColor: 'white',
                  border: '1px solid var(--theme-border-light, #e5e7eb)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-accent-primary, #2563eb)';
                  e.currentTarget.style.backgroundColor = 'var(--theme-bg-secondary, #f8f9fa)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--theme-border-light, #e5e7eb)';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                <div>
                  <div style={{
                    fontWeight: '500',
                    color: 'var(--theme-text-primary)',
                    marginBottom: '2px',
                  }}>
                    {alt.label}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--theme-text-secondary)',
                  }}>
                    {alt.duration} day{alt.duration !== 1 ? 's' : ''}
                    {alt.includesWeekend && ' • Includes weekend'}
                  </div>
                </div>
                <span style={{
                  color: 'var(--theme-accent-primary, #2563eb)',
                  fontSize: '13px',
                  fontWeight: '500',
                }}>
                  Select →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {expanded && alternatives.length === 0 && !loading && (
        <p style={{
          fontSize: '13px',
          color: 'var(--theme-warning-text, #856404)',
          margin: 0,
        }}>
          No alternatives found in the next 30 days. Try a different equipment item or contact the equipment office.
        </p>
      )}
    </div>
  );
}
