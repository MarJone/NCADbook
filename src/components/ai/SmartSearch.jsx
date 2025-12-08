import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Mic, MicOff, Sparkles, Clock, TrendingUp, Camera, Laptop, Package } from 'lucide-react';
import '../../styles/experimental/ai-interface.css';

/**
 * SmartSearch - AI-powered search with natural language support
 *
 * Features:
 * - Natural language queries ("camera for documentary")
 * - Voice input support
 * - AI-powered suggestions
 * - Recent searches
 * - Trending items
 *
 * @param {Object} props
 * @param {Function} props.onSearch - Search callback
 * @param {Function} props.onSelectItem - Item selection callback
 * @param {Array} props.suggestions - AI suggestions
 * @param {Array} props.recentSearches - Recent search history
 * @param {Array} props.trendingItems - Trending equipment
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.showVoice - Show voice input button
 */
export function SmartSearch({
  onSearch,
  onSelectItem,
  suggestions = [],
  recentSearches = [],
  trendingItems = [],
  placeholder = "Search equipment... try 'camera for portraits' or 'audio kit'",
  showVoice = true,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAiActive, setIsAiActive] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setQuery(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check for AI-like queries
  useEffect(() => {
    const aiPatterns = ['for', 'like', 'similar to', 'best', 'recommend', 'need'];
    const hasAiQuery = aiPatterns.some(pattern => query.toLowerCase().includes(pattern));
    setIsAiActive(hasAiQuery && query.length > 3);
  }, [query]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    const items = getAllItems();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < items.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : items.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSelectItem(items[selectedIndex]);
        } else if (query) {
          onSearch?.(query);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectItem = (item) => {
    if (item.type === 'query') {
      setQuery(item.text);
      onSearch?.(item.text);
    } else {
      onSelectItem?.(item);
    }
    setIsOpen(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const getAllItems = useCallback(() => {
    const items = [];

    if (suggestions.length > 0) {
      suggestions.forEach(s => items.push({ ...s, section: 'suggestions' }));
    }
    if (recentSearches.length > 0 && !query) {
      recentSearches.forEach(r => items.push({ ...r, type: 'query', section: 'recent' }));
    }
    if (trendingItems.length > 0 && !query) {
      trendingItems.forEach(t => items.push({ ...t, section: 'trending' }));
    }

    return items;
  }, [suggestions, recentSearches, trendingItems, query]);

  const getItemIcon = (item) => {
    if (item.icon) return item.icon;
    if (item.category === 'camera') return <Camera size={18} />;
    if (item.category === 'computer') return <Laptop size={18} />;
    if (item.type === 'query') return <Clock size={18} />;
    return <Package size={18} />;
  };

  const showDropdown = isOpen && (
    suggestions.length > 0 ||
    (recentSearches.length > 0 && !query) ||
    (trendingItems.length > 0 && !query) ||
    isAiActive
  );

  return (
    <div className="smart-search" ref={dropdownRef}>
      <div className={`smart-search-input-wrapper ${isAiActive ? 'ai-active' : ''}`}>
        <Search className="smart-search-icon" size={20} />

        <input
          ref={inputRef}
          type="text"
          className="smart-search-input"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search equipment"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        <div className="smart-search-shortcut">
          <kbd>/</kbd>
        </div>

        {showVoice && recognitionRef.current && (
          <button
            className={`smart-search-voice ${isListening ? 'listening' : ''}`}
            onClick={toggleVoice}
            aria-label={isListening ? 'Stop listening' : 'Start voice search'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        )}
      </div>

      <div className={`smart-search-dropdown ${showDropdown ? 'visible' : ''}`} role="listbox">
        {/* AI Thinking Indicator */}
        {isAiActive && (
          <div className="ai-thinking">
            <Sparkles size={16} className="text-accent" />
            <div className="ai-thinking-gradient" style={{ flex: 1 }} />
            <span className="ai-thinking-text">Understanding your query...</span>
          </div>
        )}

        {/* AI Suggestion Chips */}
        {isAiActive && (
          <div className="smart-search-chips">
            <button className="smart-search-chip" onClick={() => handleSelectItem({ type: 'filter', filter: 'available' })}>
              <span className="smart-search-chip-icon">✓</span>
              Available now
            </button>
            <button className="smart-search-chip" onClick={() => handleSelectItem({ type: 'filter', filter: 'beginner' })}>
              <Sparkles size={14} />
              Beginner friendly
            </button>
            <button className="smart-search-chip" onClick={() => handleSelectItem({ type: 'filter', filter: 'professional' })}>
              <span className="smart-search-chip-icon">★</span>
              Professional grade
            </button>
          </div>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="smart-search-section">
            <div className="smart-search-section-title">
              <Sparkles size={12} style={{ display: 'inline', marginRight: '4px' }} />
              AI Suggestions
            </div>
            {suggestions.map((item, index) => (
              <div
                key={item.id || index}
                className={`smart-search-item ${selectedIndex === index ? 'selected' : ''}`}
                onClick={() => handleSelectItem(item)}
                role="option"
                aria-selected={selectedIndex === index}
              >
                <div className="smart-search-item-icon">
                  {getItemIcon(item)}
                </div>
                <div className="smart-search-item-content">
                  <div className="smart-search-item-title">{item.name || item.text}</div>
                  <div className="smart-search-item-meta">{item.description || item.category}</div>
                </div>
                {item.match && (
                  <span className="smart-search-item-shortcut">{item.match}% match</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && !query && (
          <div className="smart-search-section">
            <div className="smart-search-section-title">
              <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Recent Searches
            </div>
            {recentSearches.map((item, index) => {
              const itemIndex = suggestions.length + index;
              return (
                <div
                  key={item.id || index}
                  className={`smart-search-item ${selectedIndex === itemIndex ? 'selected' : ''}`}
                  onClick={() => handleSelectItem(item)}
                  role="option"
                  aria-selected={selectedIndex === itemIndex}
                >
                  <div className="smart-search-item-icon">
                    <Clock size={18} />
                  </div>
                  <div className="smart-search-item-content">
                    <div className="smart-search-item-title">{item.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trending Items */}
        {trendingItems.length > 0 && !query && (
          <div className="smart-search-section">
            <div className="smart-search-section-title">
              <TrendingUp size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Trending Equipment
            </div>
            {trendingItems.map((item, index) => {
              const itemIndex = suggestions.length + recentSearches.length + index;
              return (
                <div
                  key={item.id || index}
                  className={`smart-search-item ${selectedIndex === itemIndex ? 'selected' : ''}`}
                  onClick={() => handleSelectItem(item)}
                  role="option"
                  aria-selected={selectedIndex === itemIndex}
                >
                  <div className="smart-search-item-icon">
                    {getItemIcon(item)}
                  </div>
                  <div className="smart-search-item-content">
                    <div className="smart-search-item-title">{item.name}</div>
                    <div className="smart-search-item-meta">{item.bookings} bookings this week</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartSearch;
