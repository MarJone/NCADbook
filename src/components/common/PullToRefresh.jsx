import { useState, useRef, useEffect } from 'react';
import '../../styles/pull-to-refresh.css';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef(null);
  const threshold = 80; // Distance needed to trigger refresh
  const maxPullDistance = 120; // Maximum pull distance for visual effect

  // Handle touch start
  const handleTouchStart = (e) => {
    // Only trigger if user is at the top of the scroll container
    const scrollTop = containerRef.current?.scrollTop || window.scrollY;
    if (scrollTop === 0 && !isRefreshing) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    // Only pull down (positive distance)
    if (distance > 0) {
      // Prevent default to stop page bounce on iOS
      if (distance > 10) {
        e.preventDefault();
      }

      // Apply resistance curve for more natural feel
      const resistance = 0.5;
      const adjustedDistance = Math.min(
        distance * resistance,
        maxPullDistance
      );
      setPullDistance(adjustedDistance);
    }
  };

  // Handle touch end
  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    // Trigger refresh if pulled past threshold
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);

      // Add haptic feedback if available
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }

      try {
        // Call the refresh callback
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        // Keep spinner visible for minimum time (feels more natural)
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      // Spring back if not pulled enough
      setPullDistance(0);
    }
  };

  // Calculate rotation for spinner based on pull distance
  const getSpinnerRotation = () => {
    if (isRefreshing) return 360;
    return (pullDistance / threshold) * 180;
  };

  // Calculate opacity for pull indicator
  const getIndicatorOpacity = () => {
    if (isRefreshing) return 1;
    return Math.min(pullDistance / threshold, 1);
  };

  // Get status message
  const getStatusMessage = () => {
    if (isRefreshing) return 'Refreshing...';
    if (pullDistance >= threshold) return 'Release to refresh';
    if (pullDistance > 0) return 'Pull to refresh';
    return '';
  };

  return (
    <div
      ref={containerRef}
      className="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-testid="pull-to-refresh-container"
    >
      {/* Pull indicator */}
      <div
        className={`pull-indicator ${isRefreshing ? 'refreshing' : ''}`}
        style={{
          transform: `translateY(${pullDistance}px)`,
          opacity: getIndicatorOpacity(),
          transition: isPulling ? 'none' : 'transform 0.3s ease-out, opacity 0.3s ease-out'
        }}
        data-testid="pull-indicator"
      >
        <div
          className={`spinner ${isRefreshing ? 'spinning' : ''}`}
          style={{
            transform: `rotate(${getSpinnerRotation()}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <span className="status-message">{getStatusMessage()}</span>
      </div>

      {/* Content wrapper */}
      <div
        className="pull-to-refresh-content"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
