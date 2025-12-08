import React, { useState, useEffect, useRef } from 'react';

/**
 * MorphingIcon - Animated SVG icon transitions
 *
 * Features:
 * - Smooth path morphing between two states
 * - CSS-only fallback for performance
 * - Reduced motion support
 * - Multiple preset icon pairs
 *
 * @param {Object} props
 * @param {string} props.from - Starting icon state
 * @param {string} props.to - Ending icon state
 * @param {boolean} props.active - Whether to show 'to' state
 * @param {number} props.size - Icon size in pixels
 * @param {string} props.color - Icon color
 * @param {number} props.duration - Animation duration in ms
 * @param {string} props.className - Additional CSS classes
 */
export function MorphingIcon({
  from = 'menu',
  to = 'close',
  active = false,
  size = 24,
  color = 'currentColor',
  duration = 300,
  className = '',
  onClick,
  ...props
}) {
  const [currentState, setCurrentState] = useState(active ? to : from);
  const [isAnimating, setIsAnimating] = useState(false);
  const prefersReducedMotion = useRef(false);

  // Check for reduced motion
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Update state when active changes
  useEffect(() => {
    if (prefersReducedMotion.current) {
      setCurrentState(active ? to : from);
      return;
    }

    setIsAnimating(true);
    const timer = setTimeout(() => {
      setCurrentState(active ? to : from);
      setIsAnimating(false);
    }, duration / 2);

    return () => clearTimeout(timer);
  }, [active, from, to, duration]);

  // Icon path definitions
  const iconPaths = {
    menu: {
      path: 'M3 6h18M3 12h18M3 18h18',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    close: {
      path: 'M6 6l12 12M6 18L18 6',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    plus: {
      path: 'M12 5v14M5 12h14',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    minus: {
      path: 'M5 12h14',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    check: {
      path: 'M5 12l5 5L20 7',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    chevronDown: {
      path: 'M6 9l6 6 6-6',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    chevronUp: {
      path: 'M6 15l6-6 6 6',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    chevronLeft: {
      path: 'M15 18l-6-6 6-6',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    chevronRight: {
      path: 'M9 18l6-6-6-6',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    arrowUp: {
      path: 'M12 19V5M5 12l7-7 7 7',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    arrowDown: {
      path: 'M12 5v14M5 12l7 7 7-7',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    play: {
      path: 'M5 3l14 9-14 9V3z',
      viewBox: '0 0 24 24',
      fill: true,
    },
    pause: {
      path: 'M6 4h4v16H6V4zM14 4h4v16h-4V4z',
      viewBox: '0 0 24 24',
      fill: true,
    },
    sun: {
      path: 'M12 3v1M12 20v1M3 12h1M20 12h1M5.6 5.6l.7.7M17.7 17.7l.7.7M5.6 18.4l.7-.7M17.7 6.3l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z',
      viewBox: '0 0 24 24',
    },
    moon: {
      path: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
      viewBox: '0 0 24 24',
    },
    search: {
      path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    filter: {
      path: 'M3 4h18M7 9h10M10 14h4',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    grid: {
      path: 'M3 3h7v7H3V3zM14 3h7v7h-7V3zM14 14h7v7h-7v-7zM3 14h7v7H3v-7z',
      viewBox: '0 0 24 24',
    },
    list: {
      path: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
      viewBox: '0 0 24 24',
      strokeLinecap: 'round',
    },
    heart: {
      path: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
      viewBox: '0 0 24 24',
    },
    heartFilled: {
      path: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
      viewBox: '0 0 24 24',
      fill: true,
    },
    star: {
      path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      viewBox: '0 0 24 24',
    },
    starFilled: {
      path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      viewBox: '0 0 24 24',
      fill: true,
    },
  };

  const currentIcon = iconPaths[currentState] || iconPaths.menu;
  const { path, viewBox, strokeLinecap, fill } = currentIcon;

  const animationStyle = {
    transition: prefersReducedMotion.current ? 'none' : `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    transform: isAnimating ? 'scale(0.8) rotate(90deg)' : 'scale(1) rotate(0deg)',
    opacity: isAnimating ? 0.5 : 1,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill ? color : 'none'}
      stroke={fill ? 'none' : color}
      strokeWidth="2"
      strokeLinecap={strokeLinecap || 'butt'}
      strokeLinejoin="round"
      className={`morphing-icon morphing-icon--${currentState} ${className}`}
      style={animationStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      <path d={path} />
    </svg>
  );
}

/**
 * Pre-built morphing icon combinations
 */

// Menu to Close (hamburger)
export function MenuCloseIcon({ isOpen, ...props }) {
  return <MorphingIcon from="menu" to="close" active={isOpen} {...props} />;
}

// Plus to Minus (accordion)
export function PlusMinusIcon({ isExpanded, ...props }) {
  return <MorphingIcon from="plus" to="minus" active={isExpanded} {...props} />;
}

// Plus to Check (add to cart/confirm)
export function PlusCheckIcon({ isConfirmed, ...props }) {
  return <MorphingIcon from="plus" to="check" active={isConfirmed} {...props} />;
}

// Chevron rotation
export function ChevronIcon({ isUp, ...props }) {
  return <MorphingIcon from="chevronDown" to="chevronUp" active={isUp} {...props} />;
}

// Play to Pause
export function PlayPauseIcon({ isPlaying, ...props }) {
  return <MorphingIcon from="play" to="pause" active={isPlaying} {...props} />;
}

// Sun to Moon (theme toggle)
export function ThemeToggleIcon({ isDark, ...props }) {
  return <MorphingIcon from="sun" to="moon" active={isDark} {...props} />;
}

// Grid to List (view toggle)
export function ViewToggleIcon({ isList, ...props }) {
  return <MorphingIcon from="grid" to="list" active={isList} {...props} />;
}

// Heart (favorite)
export function HeartIcon({ isFilled, ...props }) {
  return <MorphingIcon from="heart" to="heartFilled" active={isFilled} {...props} />;
}

// Star (rating)
export function StarIcon({ isFilled, ...props }) {
  return <MorphingIcon from="star" to="starFilled" active={isFilled} {...props} />;
}

export default MorphingIcon;
