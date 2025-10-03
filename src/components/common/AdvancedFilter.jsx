import { useState } from 'react';

export default function AdvancedFilter({
  filters = [],
  sortOptions = [],
  onFilterChange,
  onSortChange
}) {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [selectedSort, setSelectedSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (filterId, value) => {
    const newFilters = {
      ...selectedFilters,
      [filterId]: value
    };

    // Remove filter if value is empty or 'all'
    if (!value || value === 'all') {
      delete newFilters[filterId];
    }

    setSelectedFilters(newFilters);

    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleMultiSelectChange = (filterId, optionValue) => {
    const currentValues = selectedFilters[filterId] || [];
    let newValues;

    if (currentValues.includes(optionValue)) {
      newValues = currentValues.filter(v => v !== optionValue);
    } else {
      newValues = [...currentValues, optionValue];
    }

    const newFilters = {
      ...selectedFilters,
      [filterId]: newValues.length > 0 ? newValues : undefined
    };

    if (newValues.length === 0) {
      delete newFilters[filterId];
    }

    setSelectedFilters(newFilters);

    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSortChange = (sortValue) => {
    setSelectedSort(sortValue);

    if (onSortChange) {
      onSortChange(sortValue);
    }
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setSelectedSort('');

    if (onFilterChange) {
      onFilterChange({});
    }

    if (onSortChange) {
      onSortChange('');
    }
  };

  const activeFilterCount = Object.keys(selectedFilters).length;

  return (
    <div className="advanced-filter" data-testid="advanced-filter">
      <div className="filter-header">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-secondary btn-sm"
          aria-expanded={showFilters}
          data-testid="toggle-filters-btn"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {activeFilterCount > 0 && (
            <span className="filter-badge" aria-label={`${activeFilterCount} active filters`}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="btn-text"
            data-testid="clear-filters-btn"
          >
            Clear All
          </button>
        )}
      </div>

      {showFilters && (
        <div className="filter-panel" data-testid="filter-panel">
          {sortOptions.length > 0 && (
            <div className="filter-group">
              <label htmlFor="sort-select">Sort By:</label>
              <select
                id="sort-select"
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="filter-select"
                data-testid="sort-select"
              >
                <option value="">Default</option>
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filters.map(filter => (
            <div key={filter.id} className="filter-group">
              <label>{filter.label}:</label>

              {filter.type === 'select' && (
                <select
                  value={selectedFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="filter-select"
                  data-testid={`filter-${filter.id}`}
                >
                  <option value="">All</option>
                  {filter.options.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'multiselect' && (
                <div className="filter-multiselect">
                  {filter.options.map(option => (
                    <label key={option.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={(selectedFilters[filter.id] || []).includes(option.value)}
                        onChange={() => handleMultiSelectChange(filter.id, option.value)}
                        data-testid={`filter-${filter.id}-${option.value}`}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {filter.type === 'date' && (
                <input
                  type="date"
                  value={selectedFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  className="filter-date"
                  data-testid={`filter-${filter.id}`}
                />
              )}

              {filter.type === 'daterange' && (
                <div className="filter-daterange">
                  <input
                    type="date"
                    value={selectedFilters[`${filter.id}_start`] || ''}
                    onChange={(e) => handleFilterChange(`${filter.id}_start`, e.target.value)}
                    className="filter-date"
                    placeholder="Start date"
                    aria-label={`${filter.label} start date`}
                  />
                  <span>to</span>
                  <input
                    type="date"
                    value={selectedFilters[`${filter.id}_end`] || ''}
                    onChange={(e) => handleFilterChange(`${filter.id}_end`, e.target.value)}
                    className="filter-date"
                    placeholder="End date"
                    aria-label={`${filter.label} end date`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
