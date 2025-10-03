// Favorites Service - Manages user's favorite equipment using localStorage

const FAVORITES_KEY = 'ncadbook_favorites';

class FavoritesService {
  /**
   * Get all favorites for a user
   * @param {string} userId - User ID
   * @returns {Array} - Array of equipment IDs
   */
  getFavorites(userId) {
    try {
      const stored = localStorage.getItem(`${FAVORITES_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get favorites:', error);
      return [];
    }
  }

  /**
   * Add equipment to favorites
   * @param {string} userId - User ID
   * @param {string} equipmentId - Equipment ID to add
   * @returns {boolean} - Success status
   */
  addFavorite(userId, equipmentId) {
    try {
      const favorites = this.getFavorites(userId);

      if (!favorites.includes(equipmentId)) {
        favorites.push(equipmentId);
        localStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(favorites));
        return true;
      }

      return false; // Already exists
    } catch (error) {
      console.error('Failed to add favorite:', error);
      return false;
    }
  }

  /**
   * Remove equipment from favorites
   * @param {string} userId - User ID
   * @param {string} equipmentId - Equipment ID to remove
   * @returns {boolean} - Success status
   */
  removeFavorite(userId, equipmentId) {
    try {
      const favorites = this.getFavorites(userId);
      const filtered = favorites.filter(id => id !== equipmentId);

      localStorage.setItem(`${FAVORITES_KEY}_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      return false;
    }
  }

  /**
   * Toggle favorite status
   * @param {string} userId - User ID
   * @param {string} equipmentId - Equipment ID
   * @returns {boolean} - New favorite status (true if added, false if removed)
   */
  toggleFavorite(userId, equipmentId) {
    const favorites = this.getFavorites(userId);
    const isFavorite = favorites.includes(equipmentId);

    if (isFavorite) {
      this.removeFavorite(userId, equipmentId);
      return false;
    } else {
      this.addFavorite(userId, equipmentId);
      return true;
    }
  }

  /**
   * Check if equipment is in favorites
   * @param {string} userId - User ID
   * @param {string} equipmentId - Equipment ID
   * @returns {boolean} - True if favorite
   */
  isFavorite(userId, equipmentId) {
    const favorites = this.getFavorites(userId);
    return favorites.includes(equipmentId);
  }

  /**
   * Get count of favorites
   * @param {string} userId - User ID
   * @returns {number} - Number of favorites
   */
  getCount(userId) {
    return this.getFavorites(userId).length;
  }

  /**
   * Clear all favorites for a user
   * @param {string} userId - User ID
   */
  clearAll(userId) {
    try {
      localStorage.removeItem(`${FAVORITES_KEY}_${userId}`);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  }

  /**
   * Get favorite equipment objects (with details)
   * @param {string} userId - User ID
   * @param {Array} allEquipment - Array of all equipment objects
   * @returns {Array} - Array of favorite equipment objects
   */
  getFavoriteEquipment(userId, allEquipment) {
    const favoriteIds = this.getFavorites(userId);
    return allEquipment.filter(equipment => favoriteIds.includes(equipment.id));
  }
}

export const favoritesService = new FavoritesService();
