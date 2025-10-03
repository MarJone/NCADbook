import { useState, useEffect, useRef } from 'react';

export default function SearchBar({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  ariaLabel = 'Search'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const debounceTimeout = useRef(null);

  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    // Cleanup on unmount
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm, debounceMs, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar" role="search">
      <label htmlFor="search-input" className="visually-hidden">{ariaLabel}</label>
      <input
        id="search-input"
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="search-input"
        aria-label={ariaLabel}
        data-testid="search-input"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="btn-clear-search"
          aria-label="Clear search"
          data-testid="clear-search-btn"
        >
          Clear
        </button>
      )}
    </div>
  );
}
