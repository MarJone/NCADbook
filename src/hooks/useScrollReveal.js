import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for scroll-triggered reveal animations
 *
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Intersection threshold (0-1), default 0.1
 * @param {string} options.rootMargin - Root margin for early/late triggering
 * @param {boolean} options.triggerOnce - Only trigger once (default true)
 * @param {boolean} options.disabled - Disable the effect
 *
 * @returns {Object} { ref, isRevealed, progress }
 *
 * @example
 * function MyComponent() {
 *   const { ref, isRevealed } = useScrollReveal();
 *   return (
 *     <div ref={ref} className={`scroll-reveal ${isRevealed ? 'revealed' : ''}`}>
 *       Content
 *     </div>
 *   );
 * }
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    disabled = false,
  } = options;

  const elementRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Skip if disabled or reduced motion preferred
    if (disabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      setProgress(1);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;
        const intersectionRatio = entry.intersectionRatio;

        if (isIntersecting) {
          setIsRevealed(true);
          setProgress(intersectionRatio);

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsRevealed(false);
          setProgress(0);
        }
      },
      {
        threshold: Array.isArray(threshold) ? threshold : [threshold],
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, disabled]);

  return { ref: elementRef, isRevealed, progress };
}

/**
 * Hook for scroll progress tracking
 *
 * @returns {Object} { progress, direction }
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState('down');
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const newProgress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

      setProgress(newProgress);
      setDirection(scrollY > lastScrollY.current ? 'down' : 'up');
      lastScrollY.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { progress, direction };
}

/**
 * Hook for header scroll state (dark-to-light transition)
 *
 * @param {number} threshold - Scroll distance to trigger (default 100px)
 * @returns {Object} { isScrolled, scrollY }
 */
export function useScrollHeader(threshold = 100) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return { isScrolled, scrollY };
}

/**
 * Hook for parallax scrolling effect
 *
 * @param {number} speed - Parallax speed factor (0-1)
 * @returns {Object} { ref, offset }
 */
export function useParallax(speed = 0.5) {
  const elementRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far into the viewport the element is
      const elementTop = rect.top;
      const elementVisible = windowHeight - elementTop;

      if (elementVisible > 0 && elementTop < windowHeight) {
        const parallaxOffset = elementVisible * speed;
        setOffset(parallaxOffset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return {
    ref: elementRef,
    offset,
    style: { transform: `translateY(${offset}px)` },
  };
}

/**
 * Hook for staggered reveal of multiple elements
 *
 * @param {Object} options - Configuration options
 * @returns {Object} { containerRef, isRevealed }
 */
export function useStaggerReveal(options = {}) {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;

  const containerRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(container);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { containerRef, isRevealed };
}

/**
 * Hook for infinite scroll loading
 *
 * @param {Function} onLoadMore - Callback when trigger is visible
 * @param {Object} options - Configuration options
 * @returns {Object} { triggerRef, isLoading }
 */
export function useInfiniteScroll(onLoadMore, options = {}) {
  const { threshold = 0, rootMargin = '200px' } = options;

  const triggerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleIntersection = useCallback(
    async ([entry]) => {
      if (entry.isIntersecting && !isLoading) {
        setIsLoading(true);
        try {
          await onLoadMore();
        } finally {
          setIsLoading(false);
        }
      }
    },
    [onLoadMore, isLoading]
  );

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(trigger);

    return () => observer.disconnect();
  }, [handleIntersection, threshold, rootMargin]);

  return { triggerRef, isLoading };
}

export default useScrollReveal;
