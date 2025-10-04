import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <>
          <span className="theme-icon">🌙</span>
          <span className="theme-label">Dark</span>
        </>
      ) : (
        <>
          <span className="theme-icon">☀️</span>
          <span className="theme-label">Light</span>
        </>
      )}
    </button>
  );
}
