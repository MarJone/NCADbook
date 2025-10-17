import { useState } from 'react';
import { haptics } from '../../utils/haptics';

export default function AvailabilityFilter({ onFilterChange }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFilterChange = (filter) => {
    haptics.light();
    setSelectedFilter(filter);

    if (filter === 'custom' && startDate) {
      // If no end date specified, default to same as start date (1-day booking)
      const effectiveEndDate = endDate || startDate;
      onFilterChange({ type: 'custom', startDate, endDate: effectiveEndDate });
    } else {
      onFilterChange({ type: filter });
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (date) {
      setSelectedFilter('custom');
      // If no end date specified, default to same as start date (1-day booking)
      const effectiveEndDate = endDate || date;
      onFilterChange({ type: 'custom', startDate: date, endDate: effectiveEndDate });
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (startDate) {
      // If end date is cleared, default back to start date (1-day booking)
      const effectiveEndDate = date || startDate;
      onFilterChange({ type: 'custom', startDate, endDate: effectiveEndDate });
    }
  };

  return (
    <div className="availability-filter" role="group" aria-label="Filter by availability">
      <div className="filter-label">
        <strong>Availability:</strong>
      </div>

      <div className="filter-options">
        <button
          onClick={() => handleFilterChange('all')}
          className={selectedFilter === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          data-testid="filter-all"
        >
          All Equipment
        </button>

        <button
          onClick={() => handleFilterChange('available')}
          className={selectedFilter === 'available' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          data-testid="filter-available-now"
        >
          Available Now
        </button>

        <button
          onClick={() => handleFilterChange('custom')}
          className={selectedFilter === 'custom' ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
          data-testid="filter-custom-date"
        >
          Available on Date
        </button>
      </div>

      {selectedFilter === 'custom' && (
        <div className="custom-date-picker">
          <div className="date-range-inputs">
            <div className="date-input-group">
              <label htmlFor="availability-start-date">
                Start Date
              </label>
              <input
                id="availability-start-date"
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="date-input"
                data-testid="custom-start-date-input"
              />
            </div>

            <div className="date-input-group">
              <label htmlFor="availability-end-date">
                End Date <span className="optional-label">(optional, defaults to start date)</span>
              </label>
              <input
                id="availability-end-date"
                type="date"
                value={endDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="date-input"
                data-testid="custom-end-date-input"
                placeholder="Same as start date"
              />
            </div>
          </div>
          {startDate && !endDate && (
            <p className="date-range-hint">
              💡 No end date specified - searching for 1-day availability on {new Date(startDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
