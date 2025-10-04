import { useState, useRef, useEffect } from 'react';
import '../../styles/swipe-action-card.css';

export default function SwipeActionCard({
  booking,
  onApprove,
  onDeny,
  onSelectToggle,
  isSelected,
  formatDate,
  getStatusColor,
  children
}) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const cardRef = useRef(null);
  const dragThreshold = 100; // Pixels needed to trigger action

  // Handle touch start
  const handleTouchStart = (e) => {
    if (booking.status !== 'pending') return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    if (!isDragging || booking.status !== 'pending') return;
    const currentX = e.touches[0].clientX;
    const offset = currentX - startX;

    // Limit the drag offset to prevent excessive swiping
    const maxOffset = 150;
    const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset));
    setDragOffset(limitedOffset);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isDragging || booking.status !== 'pending') return;

    // Swipe right to approve
    if (dragOffset > dragThreshold) {
      onApprove(booking.id);
      // Add haptic feedback if available
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }
    // Swipe left to deny
    else if (dragOffset < -dragThreshold) {
      onDeny(booking);
      // Add haptic feedback if available
      if (window.navigator.vibrate) {
        window.navigator.vibrate([50, 50]);
      }
    }

    // Reset
    setDragOffset(0);
    setIsDragging(false);
  };

  // Handle mouse events for desktop testing
  const handleMouseDown = (e) => {
    if (booking.status !== 'pending') return;
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || booking.status !== 'pending') return;
    const currentX = e.clientX;
    const offset = currentX - startX;

    const maxOffset = 150;
    const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset));
    setDragOffset(limitedOffset);
  };

  const handleMouseUp = () => {
    if (!isDragging || booking.status !== 'pending') return;

    if (dragOffset > dragThreshold) {
      onApprove(booking.id);
    } else if (dragOffset < -dragThreshold) {
      onDeny(booking);
    }

    setDragOffset(0);
    setIsDragging(false);
  };

  // Prevent default drag behavior
  useEffect(() => {
    const preventDefault = (e) => {
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', preventDefault);
    };
  }, [isDragging, dragOffset]);

  // Determine action hint based on swipe direction
  const getActionHint = () => {
    if (dragOffset > 50) return 'approve';
    if (dragOffset < -50) return 'deny';
    return null;
  };

  const actionHint = getActionHint();
  const swipeProgress = Math.min(Math.abs(dragOffset) / dragThreshold, 1);

  return (
    <div
      ref={cardRef}
      className={`swipe-action-card ${isDragging ? 'dragging' : ''} ${actionHint ? `hint-${actionHint}` : ''}`}
      style={{
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      data-testid="swipe-action-card"
    >
      {/* Swipe action backgrounds */}
      {booking.status === 'pending' && (
        <>
          <div
            className="swipe-action-bg swipe-approve"
            style={{ opacity: dragOffset > 0 ? swipeProgress : 0 }}
          >
            <span className="action-icon">✓</span>
            <span className="action-text">Approve</span>
          </div>
          <div
            className="swipe-action-bg swipe-deny"
            style={{ opacity: dragOffset < 0 ? swipeProgress : 0 }}
          >
            <span className="action-icon">✕</span>
            <span className="action-text">Deny</span>
          </div>
        </>
      )}

      {/* Card content */}
      <div className="approval-item" data-testid="booking-card">
        <div className="approval-header">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            {booking.status === 'pending' && onSelectToggle && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectToggle(booking.id)}
                data-testid={`select-booking-${booking.id}`}
                aria-label={`Select booking for ${booking.equipment?.product_name}`}
                style={{ marginTop: '0.25rem' }}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <div>
              <h3>{booking.equipment?.product_name || 'Unknown Equipment'}</h3>
              <p className="student-name">
                Requested by: {booking.student?.full_name || 'Unknown'}
                ({booking.student?.department})
              </p>
            </div>
          </div>
          <span className={'status-badge status-' + getStatusColor(booking.status)}>
            {booking.status}
          </span>
        </div>

        <div className="approval-details">
          <div className="detail-row">
            <span className="label">Equipment:</span>
            <span>{booking.equipment?.category} - {booking.equipment?.tracking_number}</span>
          </div>
          <div className="detail-row">
            <span className="label">Dates:</span>
            <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
          </div>
          <div className="detail-row">
            <span className="label">Purpose:</span>
            <span>{booking.purpose || 'Not provided'}</span>
          </div>
          <div className="detail-row">
            <span className="label">Requested:</span>
            <span>{formatDate(booking.created_at)}</span>
          </div>
          {booking.denial_reason && (
            <div className="detail-row error">
              <span className="label">Denial Reason:</span>
              <span>{booking.denial_reason}</span>
            </div>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
