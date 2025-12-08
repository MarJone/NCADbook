import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Hook for swipe gesture detection
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {Function} options.onSwipeUp - Callback for up swipe
 * @param {Function} options.onSwipeDown - Callback for down swipe
 * @param {number} options.threshold - Minimum swipe distance (default 50px)
 * @param {number} options.velocity - Minimum velocity threshold
 *
 * @returns {Object} { ref, isSwiping, direction }
 */
export function useSwipeGesture(options = {}) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    velocity = 0.3,
  } = options;

  const elementRef = useRef(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [direction, setDirection] = useState(null);

  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const touchCurrent = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchCurrent.current = { x: touch.clientX, y: touch.clientY };
    setIsSwiping(true);
    setDirection(null);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isSwiping) return;

    const touch = e.touches[0];
    touchCurrent.current = { x: touch.clientX, y: touch.clientY };

    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;

    // Determine dominant direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setDirection(deltaY > 0 ? 'down' : 'up');
    }
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;

    const deltaX = touchCurrent.current.x - touchStart.current.x;
    const deltaY = touchCurrent.current.y - touchStart.current.y;
    const duration = Date.now() - touchStart.current.time;
    const velocityX = Math.abs(deltaX) / duration;
    const velocityY = Math.abs(deltaY) / duration;

    // Check horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) >= threshold || velocityX >= velocity) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    }
    // Check vertical swipe
    else {
      if (Math.abs(deltaY) >= threshold || velocityY >= velocity) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    setIsSwiping(false);
    setDirection(null);
  }, [isSwiping, threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    isSwiping,
    direction,
    offset: isSwiping ? {
      x: touchCurrent.current.x - touchStart.current.x,
      y: touchCurrent.current.y - touchStart.current.y,
    } : { x: 0, y: 0 },
  };
}

/**
 * Hook for pinch-to-zoom gesture
 *
 * @param {Object} options - Configuration options
 * @param {number} options.minScale - Minimum scale (default 0.5)
 * @param {number} options.maxScale - Maximum scale (default 3)
 * @param {Function} options.onScaleChange - Callback with scale value
 *
 * @returns {Object} { ref, scale, isPinching }
 */
export function usePinchZoom(options = {}) {
  const {
    minScale = 0.5,
    maxScale = 3,
    onScaleChange,
  } = options;

  const elementRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);

  const initialDistance = useRef(0);
  const initialScale = useRef(1);

  const getDistance = (touch1, touch2) => {
    return Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  };

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      initialDistance.current = getDistance(e.touches[0], e.touches[1]);
      initialScale.current = scale;
      setIsPinching(true);
    }
  }, [scale]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && isPinching) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleFactor = currentDistance / initialDistance.current;
      const newScale = Math.min(maxScale, Math.max(minScale, initialScale.current * scaleFactor));

      setScale(newScale);
      onScaleChange?.(newScale);
    }
  }, [isPinching, minScale, maxScale, onScaleChange]);

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false);
  }, []);

  const resetScale = useCallback(() => {
    setScale(1);
    onScaleChange?.(1);
  }, [onScaleChange]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    scale,
    isPinching,
    resetScale,
    style: { transform: `scale(${scale})` },
  };
}

/**
 * Hook for pull-to-refresh gesture
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onRefresh - Async callback when refresh triggered
 * @param {number} options.threshold - Pull distance to trigger (default 80px)
 *
 * @returns {Object} { ref, isPulling, pullDistance, isRefreshing }
 */
export function usePullToRefresh(options = {}) {
  const {
    onRefresh,
    threshold = 80,
  } = options;

  const elementRef = useRef(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const startY = useRef(0);
  const scrollTop = useRef(0);

  const handleTouchStart = useCallback((e) => {
    if (elementRef.current) {
      scrollTop.current = elementRef.current.scrollTop;
    }
    if (scrollTop.current === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);

    // Apply resistance
    const resistance = 0.5;
    const resistedDistance = distance * resistance;

    setPullDistance(resistedDistance);
  }, [isPulling, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    isPulling,
    pullDistance,
    isRefreshing,
    progress: Math.min(pullDistance / threshold, 1),
  };
}

/**
 * Hook for long press gesture
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onLongPress - Callback when long press detected
 * @param {number} options.delay - Delay before triggering (default 500ms)
 *
 * @returns {Object} { ref, isLongPressing }
 */
export function useLongPress(options = {}) {
  const {
    onLongPress,
    delay = 500,
  } = options;

  const elementRef = useRef(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timeoutRef = useRef(null);

  const start = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
      onLongPress?.();
    }, delay);
  }, [delay, onLongPress]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLongPressing(false);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', cancel);
    element.addEventListener('mouseleave', cancel);
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', cancel, { passive: true });

    return () => {
      element.removeEventListener('mousedown', start);
      element.removeEventListener('mouseup', cancel);
      element.removeEventListener('mouseleave', cancel);
      element.removeEventListener('touchstart', start);
      element.removeEventListener('touchend', cancel);
      cancel();
    };
  }, [start, cancel]);

  return { ref: elementRef, isLongPressing };
}

/**
 * Hook for 3D mouse-follow tilt effect
 *
 * @param {Object} options - Configuration options
 * @param {number} options.maxTilt - Maximum tilt angle (default 10)
 * @param {boolean} options.perspective - Enable perspective (default true)
 *
 * @returns {Object} { ref, tilt, style }
 */
export function use3DTilt(options = {}) {
  const {
    maxTilt = 10,
    perspective = true,
  } = options;

  const elementRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);

    setTilt({
      x: -percentY * maxTilt, // Inverted for natural feel
      y: percentX * maxTilt,
    });
  }, [maxTilt]);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const style = {
    transform: `
      ${perspective ? 'perspective(1000px)' : ''}
      rotateX(${tilt.x}deg)
      rotateY(${tilt.y}deg)
    `.trim(),
    transition: 'transform 0.1s ease-out',
  };

  return { ref: elementRef, tilt, style };
}

/**
 * Hook for drag and drop
 *
 * @param {Object} options - Configuration options
 * @param {Function} options.onDragStart - Callback when drag starts
 * @param {Function} options.onDrag - Callback during drag
 * @param {Function} options.onDragEnd - Callback when drag ends
 *
 * @returns {Object} { ref, isDragging, position }
 */
export function useDrag(options = {}) {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
  } = options;

  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const startPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    startPos.current = { x: e.clientX, y: e.clientY };
    currentPos.current = { x: 0, y: 0 };
    setIsDragging(true);
    onDragStart?.({ x: e.clientX, y: e.clientY });
  }, [onDragStart]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    currentPos.current = { x: deltaX, y: deltaY };
    setPosition({ x: deltaX, y: deltaY });
    onDrag?.({ x: deltaX, y: deltaY });
  }, [isDragging, onDrag]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    onDragEnd?.(currentPos.current);
    setPosition({ x: 0, y: 0 });
  }, [isDragging, onDragEnd]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return {
    ref: elementRef,
    isDragging,
    position,
    style: isDragging ? {
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: 'grabbing',
    } : { cursor: 'grab' },
  };
}

export default {
  useSwipeGesture,
  usePinchZoom,
  usePullToRefresh,
  useLongPress,
  use3DTilt,
  useDrag,
};
