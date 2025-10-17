import '../../styles/filter-chips.css';

export default function FilterChips({ filters, onRemove, onClearAll }) {
  if (!filters || filters.length === 0) {
    return null;
  }

  return (
    <div className="filter-chips-container" role="region" aria-label="Active filters">
      <div className="filter-chips">
        {filters.map((filter, index) => (
          <div key={index} className="filter-chip">
            <span className="filter-chip-label">{filter.label}</span>
            <span className="filter-chip-value">{filter.value}</span>
            <button
              className="filter-chip-remove"
              onClick={() => onRemove(filter.id)}
              aria-label={`Remove ${filter.label} filter`}
              title="Remove filter"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {filters.length > 1 && (
        <button
          className="btn btn-text filter-clear-all"
          onClick={onClearAll}
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
