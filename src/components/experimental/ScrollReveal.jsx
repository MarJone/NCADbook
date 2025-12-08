import React, { useRef, useEffect, useState, Children, cloneElement } from 'react';
import { useScrollReveal, useStaggerReveal } from '../../hooks/useScrollReveal';

/**
 * ScrollReveal - Wrapper component for scroll-triggered animations
 *
 * Features:
 * - IntersectionObserver-based reveal
 * - Multiple animation variants
 * - Staggered children animations
 * - Reduced motion support
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Content to reveal
 * @param {string} props.variant - Animation variant
 * @param {number} props.threshold - Visibility threshold (0-1)
 * @param {number} props.delay - Animation delay in ms
 * @param {boolean} props.once - Only animate once
 * @param {string} props.className - Additional CSS classes
 */
export function ScrollReveal({
  children,
  variant = 'up',
  threshold = 0.1,
  delay = 0,
  once = true,
  className = '',
  as: Component = 'div',
  style = {},
  ...props
}) {
  const { ref, isRevealed } = useScrollReveal({
    threshold,
    once,
  });

  // Animation variants map to CSS classes
  const variantClasses = {
    up: 'scroll-reveal-up',
    down: 'scroll-reveal-down',
    left: 'scroll-reveal-left',
    right: 'scroll-reveal-right',
    scale: 'scroll-reveal-scale',
    scaleUp: 'scroll-reveal-scale-up',
    rotate: 'scroll-reveal-rotate',
    blur: 'scroll-reveal-blur',
    default: 'scroll-reveal',
  };

  const variantClass = variantClasses[variant] || variantClasses.default;
  const revealedClass = isRevealed ? 'revealed' : '';

  return (
    <Component
      ref={ref}
      className={`${variantClass} ${revealedClass} ${className}`}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * StaggerReveal - Container for staggered child animations
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Children to stagger
 * @param {string} props.variant - Animation variant
 * @param {number} props.staggerDelay - Delay between each child
 * @param {boolean} props.fast - Use faster stagger timing
 * @param {string} props.className - Additional CSS classes
 */
export function StaggerReveal({
  children,
  variant = 'default',
  staggerDelay = 50,
  fast = false,
  threshold = 0.1,
  once = true,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const { containerRef, isRevealed } = useStaggerReveal({
    threshold,
    once,
  });

  const baseClass = fast ? 'stagger-reveal-fast' : 'stagger-reveal';
  const revealedClass = isRevealed ? 'revealed' : '';

  // Clone children and add stagger delay
  const childrenWithDelay = Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    return cloneElement(child, {
      style: {
        ...child.props.style,
        transitionDelay: isRevealed ? `${index * staggerDelay}ms` : '0ms',
      },
    });
  });

  return (
    <Component
      ref={containerRef}
      className={`${baseClass} ${revealedClass} ${className}`}
      {...props}
    >
      {childrenWithDelay}
    </Component>
  );
}

/**
 * List3D - 3D staggered list reveal
 */
export function List3D({
  children,
  threshold = 0.1,
  once = true,
  className = '',
  as: Component = 'div',
  ...props
}) {
  const { containerRef, isRevealed } = useStaggerReveal({
    threshold,
    once,
  });

  return (
    <Component
      ref={containerRef}
      className={`list-3d ${isRevealed ? 'revealed' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * TextReveal - Line-by-line text reveal animation
 */
export function TextReveal({
  children,
  threshold = 0.1,
  once = true,
  className = '',
  ...props
}) {
  const { ref, isRevealed } = useScrollReveal({
    threshold,
    once,
  });

  // Split text into lines
  const text = typeof children === 'string' ? children : '';
  const lines = text.split('\n').filter(Boolean);

  return (
    <div
      ref={ref}
      className={`text-reveal ${isRevealed ? 'revealed' : ''} ${className}`}
      {...props}
    >
      {lines.map((line, index) => (
        <span key={index} className="text-reveal-line">
          {line}
        </span>
      ))}
    </div>
  );
}

/**
 * ImageReveal - Image reveal with curtain or zoom effect
 */
export function ImageReveal({
  children,
  variant = 'curtain',
  threshold = 0.1,
  once = true,
  className = '',
  ...props
}) {
  const { ref, isRevealed } = useScrollReveal({
    threshold,
    once,
  });

  const variantClass = variant === 'zoom' ? '' : `image-reveal-${variant}`;
  const childClass = variant === 'zoom' ? 'image-reveal-zoom' : '';

  return (
    <div
      ref={ref}
      className={`image-reveal-container ${variantClass} ${isRevealed ? 'revealed' : ''} ${className}`}
      {...props}
    >
      {React.isValidElement(children)
        ? cloneElement(children, {
            className: `${children.props.className || ''} ${childClass}`,
          })
        : children}
    </div>
  );
}

/**
 * SectionDivider - Animated section divider
 */
export function SectionDivider({
  threshold = 0.1,
  once = true,
  className = '',
  ...props
}) {
  const { ref, isRevealed } = useScrollReveal({
    threshold,
    once,
  });

  return (
    <div
      ref={ref}
      className={`section-divider ${isRevealed ? 'revealed' : ''} ${className}`}
      {...props}
    />
  );
}

/**
 * ParallaxSection - Container with parallax effect
 */
export function ParallaxSection({
  children,
  speed = 'medium',
  className = '',
  ...props
}) {
  const speedClasses = {
    slow: 'parallax-slow',
    medium: 'parallax-medium',
    fast: 'parallax-fast',
  };

  const speedClass = speedClasses[speed] || speedClasses.medium;

  return (
    <div className={`parallax-container ${className}`} {...props}>
      <div className={`parallax-layer ${speedClass}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * CountUp - Animated counting number
 */
export function CountUp({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  prefix = '',
  suffix = '',
  threshold = 0.1,
  className = '',
  ...props
}) {
  const { ref, isRevealed } = useScrollReveal({
    threshold,
    once: true,
  });

  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!isRevealed) return;

    const startTime = performance.now();
    const diff = end - start;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentCount = start + diff * eased;

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isRevealed, start, end, duration]);

  const displayValue = count.toFixed(decimals);

  return (
    <span
      ref={ref}
      className={`count-up ${isRevealed ? 'revealed' : ''} ${className}`}
      {...props}
    >
      {prefix}{displayValue}{suffix}
    </span>
  );
}

export default ScrollReveal;
