import { useState } from 'react';
import './EquipmentImage.css';

/**
 * Equipment Image Component with Placeholder System
 *
 * Displays equipment images with fallback to category-based placeholders.
 * Supports lazy loading and responsive sizing.
 */

// Category-based placeholder mapping
const PLACEHOLDER_ICONS = {
  camera: '📷',
  lens: '🔭',
  lighting: '💡',
  audio: '🎤',
  video: '🎥',
  tripod: '📐',
  computer: '💻',
  software: '💿',
  storage: '💾',
  accessory: '🔧',
  default: '📦'
};

// Category detection from equipment name/description
const detectCategory = (name = '', description = '') => {
  const text = `${name} ${description}`.toLowerCase();

  if (text.match(/camera|canon|nikon|sony|dslr|mirrorless/)) return 'camera';
  if (text.match(/lens|mm|f\/|zoom|prime|telephoto|wide/)) return 'lens';
  if (text.match(/light|led|softbox|reflector|flash|strobe/)) return 'lighting';
  if (text.match(/mic|microphone|audio|recorder|sound|boom/)) return 'audio';
  if (text.match(/video|camcorder|recorder/)) return 'video';
  if (text.match(/tripod|stand|mount|rig|gimbal/)) return 'tripod';
  if (text.match(/computer|laptop|mac|pc|imac/)) return 'computer';
  if (text.match(/software|license|adobe|final cut/)) return 'software';
  if (text.match(/sd card|memory|hard drive|ssd|storage/)) return 'storage';
  if (text.match(/cable|adapter|charger|battery|bag|case/)) return 'accessory';

  return 'default';
};

export default function EquipmentImage({
  equipment,
  size = 'medium',
  showCategory = false
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const category = detectCategory(equipment?.product_name, equipment?.description);
  const placeholderIcon = PLACEHOLDER_ICONS[category];
  const hasImage = equipment?.link_to_image && !imageError;

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className={`equipment-image equipment-image--${size}`}>
      {hasImage ? (
        <>
          {imageLoading && (
            <div className="equipment-image-skeleton">
              <span className="equipment-image-placeholder-icon">{placeholderIcon}</span>
            </div>
          )}
          <img
            src={equipment.link_to_image}
            alt={equipment.product_name}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            className={imageLoading ? 'equipment-image-hidden' : 'equipment-image-loaded'}
          />
        </>
      ) : (
        <div className="equipment-image-placeholder">
          <span className="equipment-image-placeholder-icon">{placeholderIcon}</span>
          {showCategory && (
            <span className="equipment-image-category">{category}</span>
          )}
        </div>
      )}
    </div>
  );
}
