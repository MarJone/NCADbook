import { useState } from 'react';

export default function AvailabilityFilter({ onFilterChange }) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);

    if (filter === 'custom' && customDate) {
      onFilterChange({ type: 'custom', date: customDate });
    } else {
      onFilterChange({ type: filter });
    }
  };

  const handleCustomDateChange = (date) => {
    setCustomDate(date);
    if (date) {
      setSelectedFilter('custom');
      onFilterChange({ type: 'custom', date });
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
          <label htmlFor="availability-date" className="visually-hidden">
            Select date
          </label>
          <input
            id="availability-date"
            type="date"
            value={customDate}
            onChange={(e) => handleCustomDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="date-input"
            data-testid="custom-date-input"
          />
        </div>
      )}
    </div>
  );
}
