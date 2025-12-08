import React, { useRef, useState, useCallback, useEffect } from 'react';
import { use3DTilt } from '../../hooks/useGestures';

/**
 * Card3D - Interactive 3D card with mouse-follow tilt effect
 *
 * Features:
 * - Mouse-follow perspective tilt
 * - Flip animation (front/back)
 * - Depth layers for parallax
 * - Reduced motion support
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Card content
 * @param {ReactNode} props.backContent - Back face content (for flip cards)
 * @param {boolean} props.flippable - Enable flip on click
 * @param {boolean} props.tiltEnabled - Enable mouse-follow tilt
 * @param {number} props.maxTilt - Maximum tilt angle (default: 10)
 * @param {boolean} props.glare - Show glare effect on hover
 * @param {string} props.className - Additional CSS classes
 */
export function Card3D({
  children,
  backContent,
  flippable = false,
  tiltEnabled = true,
  maxTilt = 10,
  glare = false,
  className = '',
  style = {},
  onClick,
  ...props
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const glareRef = useRef(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  // Use 3D tilt hook
  const { ref: tiltRef, tilt, style: tiltStyle } = use3DTilt({
    maxTilt: prefersReducedMotion ? 0 : maxTilt,
    perspective: true,
  });

  // Handle glare effect
  const handleMouseMove = useCallback((e) => {
    if (!glare || prefersReducedMotion || !glareRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    glareRef.current.style.background = `
      radial-gradient(
        circle at ${x}% ${y}%,
        rgba(255, 255, 255, 0.3) 0%,
        transparent 60%
      )
    `;
    glareRef.current.style.opacity = '1';
  }, [glare, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, []);

  // Handle flip
  const handleClick = useCallback((e) => {
    if (flippable) {
      setIsFlipped(prev => !prev);
    }
    onClick?.(e);
  }, [flippable, onClick]);

  const cardStyle = {
    ...style,
    ...(tiltEnabled && !prefersReducedMotion ? tiltStyle : {}),
  };

  // Simple card without flip
  if (!backContent) {
    return (
      <div
        ref={tiltEnabled ? tiltRef : undefined}
        className={`card-3d ${className}`}
        style={cardStyle}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
        {glare && (
          <div
            ref={glareRef}
            className="card-3d-glare"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              opacity: 0,
              transition: 'opacity 0.3s ease',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    );
  }

  // Flip card with front/back
  return (
    <div
      className={`card-3d-container ${className}`}
      style={{ perspective: '1000px', ...style }}
      onClick={handleClick}
      {...props}
    >
      <div
        className={`card-3d-inner ${isFlipped ? 'flipped' : ''}`}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: prefersReducedMotion ? 'none' : 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
        }}
      >
        {/* Front face */}
        <div
          ref={tiltEnabled ? tiltRef : undefined}
          className="card-3d-front"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {children}
          {glare && (
            <div
              ref={glareRef}
              className="card-3d-glare"
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                opacity: 0,
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        {/* Back face */}
        <div
          className="card-3d-back"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {backContent}
        </div>
      </div>
    </div>
  );
}

/**
 * Card3DLayer - Creates depth layers within a 3D card
 */
export function Card3DLayer({ children, depth = 0, className = '', style = {}, ...props }) {
  return (
    <div
      className={`card-3d-layer ${className}`}
      style={{
        transform: `translateZ(${depth}px)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card3D;
