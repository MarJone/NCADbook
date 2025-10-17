import { useEffect } from 'react';
import { haptics } from '../../utils/haptics';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    // Trigger haptic feedback based on toast type
    if (type === 'success') {
      haptics.success();
    } else if (type === 'error') {
      haptics.error();
    } else if (type === 'warning') {
      haptics.warning();
    }

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, type]);

  return (
    <div
      className={`toast toast-${type}`}
      role="alert"
      data-testid="toast-notification"
    >
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✗'}
          {type === 'info' && 'ℹ'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
      <button
        className="toast-close"
        onClick={() => {
          haptics.light();
          onClose();
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}
