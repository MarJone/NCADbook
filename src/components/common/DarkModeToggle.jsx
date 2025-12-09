import { useTheme } from '../../contexts/ThemeContext';
import './DarkModeToggle.css';

/**
 * DarkModeToggle - Theme toggle button
 *
 * Features:
 * - Integrates with ThemeContext
 * - Saves preference to localStorage
 * - Detects system preference initially
 * - Disabled for Master Admin portal (always dark)
 * - Full keyboard accessibility
 *
 * @param {Object} props
 * @param {boolean} props.showLabel - Show text label (defaults to true)
 * @param {string} props.className - Additional CSS classes
 */
export default function DarkModeToggle({ showLabel = true, className = '' }) {
  const { isDarkMode, toggleDarkMode, canToggleDarkMode } = useTheme();

  // Don't render if portal doesn't support dark mode toggle
  if (!canToggleDarkMode) {
    return null;
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={`dark-mode-toggle ${className}`.trim()}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDarkMode}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      data-testid="dark-mode-toggle"
    >
      <span className="mode-icon" aria-hidden="true">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
      {showLabel && (
        <span className="mode-label">
          {isDarkMode ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
