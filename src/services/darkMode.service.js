// Dark Mode Service - Manages dark mode preference using localStorage

const DARK_MODE_KEY = 'ncadbook_dark_mode';

class DarkModeService {
  constructor() {
    this.initialize();
  }

  /**
   * Initialize dark mode based on saved preference or system preference
   */
  initialize() {
    const savedPreference = this.getPreference();

    if (savedPreference !== null) {
      this.setDarkMode(savedPreference);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }
  }

  /**
   * Get saved dark mode preference
   * @returns {boolean|null} - True if dark mode, false if light mode, null if not set
   */
  getPreference() {
    try {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      return stored !== null ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get dark mode preference:', error);
      return null;
    }
  }

  /**
   * Check if dark mode is currently enabled
   * @returns {boolean} - True if dark mode is enabled
   */
  isDarkMode() {
    return document.documentElement.classList.contains('dark-mode');
  }

  /**
   * Enable or disable dark mode
   * @param {boolean} enabled - True to enable dark mode
   */
  setDarkMode(enabled) {
    try {
      if (enabled) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
      }

      localStorage.setItem(DARK_MODE_KEY, JSON.stringify(enabled));
    } catch (error) {
      console.error('Failed to set dark mode:', error);
    }
  }

  /**
   * Toggle dark mode
   * @returns {boolean} - New dark mode status
   */
  toggle() {
    const newMode = !this.isDarkMode();
    this.setDarkMode(newMode);
    return newMode;
  }

  /**
   * Reset to system preference
   */
  resetToSystem() {
    localStorage.removeItem(DARK_MODE_KEY);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setDarkMode(prefersDark);
  }

  /**
   * Listen for system preference changes
   * @param {Function} callback - Callback function when system preference changes
   * @returns {Function} - Cleanup function to remove listener
   */
  watchSystemPreference(callback) {
    if (!window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e) => {
      if (this.getPreference() === null) {
        // Only update if user hasn't set a preference
        this.setDarkMode(e.matches);
        callback(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
}

export const darkModeService = new DarkModeService();
