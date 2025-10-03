import { useState, useEffect } from 'react';
import { favoritesService } from '../../services/favorites.service';
import { useAuth } from '../../hooks/useAuth';

export default function FavoritesButton({ equipmentId, size = 'medium', showLabel = true }) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user && equipmentId) {
      setIsFavorite(favoritesService.isFavorite(user.id, equipmentId));
    }
  }, [user, equipmentId]);

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent event bubbling

    if (!user) {
      return;
    }

    const newStatus = favoritesService.toggleFavorite(user.id, equipmentId);
    setIsFavorite(newStatus);
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'favorites-btn-sm';
      case 'large':
        return 'favorites-btn-lg';
      default:
        return '';
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`favorites-btn ${getSizeClass()} ${isFavorite ? 'is-favorite' : ''}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
      data-testid="favorites-btn"
    >
      <span className="heart-icon" aria-hidden="true">
        {isFavorite ? '♥' : '♡'}
      </span>
      {showLabel && (
        <span className="favorites-label">
          {isFavorite ? 'Favorited' : 'Add to Favorites'}
        </span>
      )}
    </button>
  );
}
