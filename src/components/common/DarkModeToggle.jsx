import { useState, useEffect } from 'react';
import { darkModeService } from '../../services/darkMode.service';

export default function DarkModeToggle({ showLabel = true }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(darkModeService.isDarkMode());

    // Watch for system preference changes
    const cleanup = darkModeService.watchSystemPreference((prefersDark) => {
      setIsDark(prefersDark);
    });

    return cleanup;
  }, []);

  const handleToggle = () => {
    const newMode = darkModeService.toggle();
    setIsDark(newMode);
  };

  return (
    <button
      onClick={handleToggle}
      className="dark-mode-toggle"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      data-testid="dark-mode-toggle"
    >
      <span className="mode-icon" aria-hidden="true">
        {isDark ? '☀' : '☾'}
      </span>
      {showLabel && (
        <span className="mode-label">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
