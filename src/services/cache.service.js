// Cache Service - Manages temporary data caching to reduce API calls
// Equipment cache: 5 minutes, User cache: session-based

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

class CacheService {
  constructor() {
    this.cache = new Map();
    this.sessionCache = new Map();
  }

  /**
   * Set a cached value with expiration time
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} duration - Cache duration in milliseconds (default: 5 minutes)
   */
  set(key, value, duration = CACHE_DURATION) {
    const expiry = Date.now() + duration;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Get a cached value if it exists and hasn't expired
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if expired/not found
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set a session-based cached value (persists for session)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  setSession(key, value) {
    this.sessionCache.set(key, value);
    try {
      sessionStorage.setItem(`ncad_cache_${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  }

  /**
   * Get a session-based cached value
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found
   */
  getSession(key) {
    // First check in-memory cache
    if (this.sessionCache.has(key)) {
      return this.sessionCache.get(key);
    }

    // Fallback to sessionStorage
    try {
      const item = sessionStorage.getItem(`ncad_cache_${key}`);
      if (item) {
        const value = JSON.parse(item);
        this.sessionCache.set(key, value);
        return value;
      }
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
    }

    return null;
  }

  /**
   * Clear a specific cache entry
   * @param {string} key - Cache key
   */
  clear(key) {
    this.cache.delete(key);
    this.sessionCache.delete(key);
    try {
      sessionStorage.removeItem(`ncad_cache_${key}`);
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll() {
    this.cache.clear();
    this.sessionCache.clear();
    try {
      // Clear all ncad_cache_ prefixed items from sessionStorage
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('ncad_cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }

  /**
   * Get equipment data with caching
   * @param {Function} fetchFn - Function to fetch equipment data
   * @param {string} key - Cache key (default: 'equipment_list')
   * @returns {Promise<any>} - Equipment data
   */
  async getEquipment(fetchFn, key = 'equipment_list') {
    const cached = this.get(key);
    if (cached) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data);
    return data;
  }

  /**
   * Get user data with session-based caching
   * @param {Function} fetchFn - Function to fetch user data
   * @param {string} userId - User ID for cache key
   * @returns {Promise<any>} - User data
   */
  async getUser(fetchFn, userId) {
    const key = `user_${userId}`;
    const cached = this.getSession(key);
    if (cached) {
      return cached;
    }

    const data = await fetchFn();
    this.setSession(key, data);
    return data;
  }

  /**
   * Invalidate equipment cache (call after equipment updates)
   */
  invalidateEquipment() {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith('equipment_')) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Check if a cache entry exists and is valid
   * @param {string} key - Cache key
   * @returns {boolean} - True if cache entry exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Check if a session cache entry exists
   * @param {string} key - Cache key
   * @returns {boolean} - True if session cache entry exists
   */
  hasSession(key) {
    return this.getSession(key) !== null;
  }
}

export const cacheService = new CacheService();
