import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, X, Settings, Users, Package, Calendar, FileText, Shield, BarChart3, AlertTriangle, Download, Upload, Moon, Sun, Zap } from 'lucide-react';
import '../../styles/experimental/ai-interface.css';

/**
 * CommandPalette - Cmd+K interface for power users (Master Admin)
 *
 * Features:
 * - Fuzzy search across all admin actions
 * - Keyboard navigation
 * - Recent commands history
 * - Categorized commands
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Visibility state
 * @param {Function} props.onClose - Close callback
 * @param {Function} props.onCommand - Command execution callback
 * @param {Array} props.customCommands - Additional custom commands
 */
export function CommandPalette({
  isOpen = false,
  onClose,
  onCommand,
  customCommands = [],
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState([]);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Default admin commands
  const defaultCommands = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', name: 'Go to Dashboard', description: 'View system overview', icon: BarChart3, category: 'Navigation', shortcut: ['G', 'D'] },
    { id: 'nav-equipment', name: 'Go to Equipment', description: 'Manage equipment catalog', icon: Package, category: 'Navigation', shortcut: ['G', 'E'] },
    { id: 'nav-users', name: 'Go to Users', description: 'Manage user accounts', icon: Users, category: 'Navigation', shortcut: ['G', 'U'] },
    { id: 'nav-bookings', name: 'Go to Bookings', description: 'View all bookings', icon: Calendar, category: 'Navigation', shortcut: ['G', 'B'] },
    { id: 'nav-reports', name: 'Go to Reports', description: 'Analytics and reports', icon: FileText, category: 'Navigation', shortcut: ['G', 'R'] },

    // Actions
    { id: 'action-add-equipment', name: 'Add New Equipment', description: 'Create equipment entry', icon: Package, category: 'Actions', shortcut: ['N', 'E'] },
    { id: 'action-add-user', name: 'Add New User', description: 'Create user account', icon: Users, category: 'Actions', shortcut: ['N', 'U'] },
    { id: 'action-import-csv', name: 'Import CSV', description: 'Bulk import data', icon: Upload, category: 'Actions', shortcut: ['I'] },
    { id: 'action-export-report', name: 'Export Report', description: 'Download analytics', icon: Download, category: 'Actions', shortcut: ['E'] },

    // Admin
    { id: 'admin-policies', name: 'Policy Settings', description: 'Configure booking policies', icon: Shield, category: 'Admin', shortcut: ['A', 'P'] },
    { id: 'admin-fines', name: 'Fine Management', description: 'View and manage fines', icon: AlertTriangle, category: 'Admin', shortcut: ['A', 'F'] },
    { id: 'admin-settings', name: 'System Settings', description: 'Global configuration', icon: Settings, category: 'Admin', shortcut: ['A', 'S'] },

    // Quick Actions
    { id: 'quick-approve-all', name: 'Approve All Pending', description: 'Approve all pending bookings', icon: Zap, category: 'Quick Actions' },
    { id: 'quick-maintenance', name: 'Mark Equipment Maintenance', description: 'Set equipment to maintenance mode', icon: Settings, category: 'Quick Actions' },

    // Theme
    { id: 'theme-toggle', name: 'Toggle Theme', description: 'Switch light/dark mode', icon: Moon, category: 'Preferences', shortcut: ['T'] },
  ], []);

  // Combine default and custom commands
  const allCommands = useMemo(() => [...defaultCommands, ...customCommands], [defaultCommands, customCommands]);

  // Fuzzy search function
  const fuzzySearch = useCallback((items, searchQuery) => {
    if (!searchQuery) return items;

    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(item => {
      const name = item.name.toLowerCase();
      const description = item.description?.toLowerCase() || '';
      const category = item.category?.toLowerCase() || '';

      return name.includes(lowerQuery) ||
             description.includes(lowerQuery) ||
             category.includes(lowerQuery);
    }).sort((a, b) => {
      // Prioritize name matches
      const aNameMatch = a.name.toLowerCase().indexOf(lowerQuery);
      const bNameMatch = b.name.toLowerCase().indexOf(lowerQuery);

      if (aNameMatch === 0 && bNameMatch !== 0) return -1;
      if (bNameMatch === 0 && aNameMatch !== 0) return 1;
      return 0;
    });
  }, []);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) {
      // Show recent commands first, then all commands
      const recent = recentCommands.slice(0, 3);
      const other = allCommands.filter(c => !recent.find(r => r.id === c.id));
      return [...recent, ...other];
    }
    return fuzzySearch(allCommands, query);
  }, [query, allCommands, recentCommands, fuzzySearch]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach(command => {
      const category = query ? 'Results' : (recentCommands.find(r => r.id === command.id) ? 'Recent' : command.category);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
    });
    return groups;
  }, [filteredCommands, query, recentCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose?.();
        break;
    }
  };

  // Execute command
  const executeCommand = (command) => {
    // Add to recent commands
    setRecentCommands(prev => {
      const filtered = prev.filter(c => c.id !== command.id);
      return [command, ...filtered].slice(0, 5);
    });

    onCommand?.(command);
    onClose?.();
  };

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector('.selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Get flat index for an item
  const getFlatIndex = (category, itemIndex) => {
    let flatIndex = 0;
    const categories = Object.keys(groupedCommands);

    for (const cat of categories) {
      if (cat === category) {
        return flatIndex + itemIndex;
      }
      flatIndex += groupedCommands[cat].length;
    }
    return flatIndex;
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`command-palette-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`command-palette ${isOpen ? 'visible' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="command-palette-header">
          <Search className="command-palette-search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            aria-label="Search commands"
          />
          <button
            className="command-palette-close"
            onClick={onClose}
            aria-label="Close command palette"
          >
            <X size={16} />
          </button>
        </div>

        <div className="command-palette-body" ref={listRef} role="listbox">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="command-palette-section">
              <div className="command-palette-section-title">{category}</div>
              {commands.map((command, index) => {
                const flatIndex = getFlatIndex(category, index);
                const Icon = command.icon;

                return (
                  <div
                    key={command.id}
                    className={`command-palette-item ${flatIndex === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeCommand(command)}
                    role="option"
                    aria-selected={flatIndex === selectedIndex}
                  >
                    <div className="command-palette-item-icon">
                      {Icon && <Icon size={18} />}
                    </div>
                    <div className="command-palette-item-content">
                      <div className="command-palette-item-title">{command.name}</div>
                      <div className="command-palette-item-description">{command.description}</div>
                    </div>
                    {command.shortcut && (
                      <div className="command-palette-item-shortcut">
                        {command.shortcut.map((key, i) => (
                          <span key={i} className="command-palette-key">{key}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="command-palette-section">
              <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--theme-text-tertiary)' }}>
                No commands found for "{query}"
              </div>
            </div>
          )}
        </div>

        <div className="command-palette-footer">
          <div className="command-palette-hint">
            <div className="command-palette-hint-item">
              <span className="command-palette-key">↑↓</span>
              Navigate
            </div>
            <div className="command-palette-hint-item">
              <span className="command-palette-key">↵</span>
              Select
            </div>
            <div className="command-palette-hint-item">
              <span className="command-palette-key">esc</span>
              Close
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * useCommandPalette - Hook to manage command palette state
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}

export default CommandPalette;
