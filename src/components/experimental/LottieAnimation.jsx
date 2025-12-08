import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * LottieAnimation - Lottie animation wrapper component
 *
 * Features:
 * - Lazy loading of lottie-web
 * - Play, pause, stop controls
 * - Loop and autoplay options
 * - Intersection observer for viewport visibility
 * - Reduced motion support
 *
 * @param {Object} props
 * @param {string} props.animationData - JSON animation data (inline)
 * @param {string} props.src - URL to JSON animation file
 * @param {boolean} props.loop - Loop animation (default: true)
 * @param {boolean} props.autoplay - Autoplay animation (default: true)
 * @param {boolean} props.playOnHover - Only play when hovered
 * @param {boolean} props.playInView - Only play when in viewport
 * @param {number} props.speed - Animation speed (default: 1)
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 * @param {Function} props.onComplete - Callback when animation completes
 * @param {Function} props.onLoopComplete - Callback when loop completes
 */
export function LottieAnimation({
  animationData,
  src,
  loop = true,
  autoplay = true,
  playOnHover = false,
  playInView = false,
  speed = 1,
  className = '',
  style = {},
  onComplete,
  onLoopComplete,
  ...props
}) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection observer for viewport visibility
  useEffect(() => {
    if (!playInView || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [playInView]);

  // Load and initialize animation
  useEffect(() => {
    if (prefersReducedMotion) return;

    let isMounted = true;

    const loadAnimation = async () => {
      try {
        // Dynamically import lottie-web
        const lottie = (await import('lottie-web')).default;

        if (!isMounted || !containerRef.current) return;

        // Load animation data if src provided
        let data = animationData;
        if (src && !animationData) {
          const response = await fetch(src);
          data = await response.json();
        }

        if (!data || !isMounted) return;

        // Initialize animation
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop,
          autoplay: autoplay && !playOnHover && !playInView,
          animationData: data,
        });

        animationRef.current.setSpeed(speed);

        // Event listeners
        if (onComplete) {
          animationRef.current.addEventListener('complete', onComplete);
        }
        if (onLoopComplete) {
          animationRef.current.addEventListener('loopComplete', onLoopComplete);
        }

        setIsLoaded(true);
      } catch (error) {
        console.warn('Failed to load Lottie animation:', error);
      }
    };

    loadAnimation();

    return () => {
      isMounted = false;
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [animationData, src, loop, autoplay, playOnHover, playInView, speed, onComplete, onLoopComplete, prefersReducedMotion]);

  // Handle hover play
  useEffect(() => {
    if (!playOnHover || !animationRef.current || prefersReducedMotion) return;

    if (isHovered) {
      animationRef.current.play();
    } else {
      animationRef.current.pause();
    }
  }, [isHovered, playOnHover, prefersReducedMotion]);

  // Handle viewport play
  useEffect(() => {
    if (!playInView || !animationRef.current || prefersReducedMotion) return;

    if (isInView) {
      animationRef.current.play();
    } else {
      animationRef.current.pause();
    }
  }, [isInView, playInView, prefersReducedMotion]);

  // Playback controls
  const play = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.play();
    }
  }, []);

  const pause = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
  }, []);

  const goToAndPlay = useCallback((frame, isFrame = true) => {
    if (animationRef.current) {
      animationRef.current.goToAndPlay(frame, isFrame);
    }
  }, []);

  const goToAndStop = useCallback((frame, isFrame = true) => {
    if (animationRef.current) {
      animationRef.current.goToAndStop(frame, isFrame);
    }
  }, []);

  // If reduced motion, show static placeholder or first frame
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`lottie-animation lottie-animation--reduced-motion ${className}`}
        style={style}
        {...props}
      >
        {/* Show first frame or placeholder */}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`lottie-animation ${isLoaded ? 'lottie-animation--loaded' : ''} ${className}`}
      style={style}
      onMouseEnter={playOnHover ? () => setIsHovered(true) : undefined}
      onMouseLeave={playOnHover ? () => setIsHovered(false) : undefined}
      {...props}
    />
  );
}

/**
 * Pre-built animation components for common use cases
 */

// Success checkmark animation
export function SuccessAnimation({ size = 100, ...props }) {
  return (
    <LottieAnimation
      src="/animations/success-check.json"
      loop={false}
      autoplay={true}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

// Loading spinner animation
export function LoadingAnimation({ size = 60, ...props }) {
  return (
    <LottieAnimation
      src="/animations/loading-equipment.json"
      loop={true}
      autoplay={true}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

// Empty state animation
export function EmptyStateAnimation({ size = 200, ...props }) {
  return (
    <LottieAnimation
      src="/animations/empty-state.json"
      loop={true}
      autoplay={true}
      playInView={true}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

// AI thinking animation
export function AIThinkingAnimation({ size = 40, ...props }) {
  return (
    <LottieAnimation
      src="/animations/ai-thinking.json"
      loop={true}
      autoplay={true}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

export default LottieAnimation;
