import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const currentUser = demoMode.getCurrentUser();
    if (!currentUser) return;

    try {
      // Get notifications from demo data
      const data = demoMode.getData();

      // In a real app, this would be a separate notifications table
      // For demo, we'll generate notifications from bookings
      const allNotifications = [];

      if (currentUser.role === 'student') {
        // Students get notifications about their booking status changes
        const userBookings = data.bookings.filter(b => b.user_id === currentUser.id);
        userBookings.forEach(booking => {
          if (booking.status !== 'pending') {
            allNotifications.push({
              id: `booking-${booking.id}`,
              type: booking.status === 'approved' ? 'success' : 'error',
              message: `Booking for ${booking.equipment_name} has been ${booking.status}`,
              timestamp: booking.updated_at || booking.created_at,
              read: false
            });
          }
        });
      } else if (currentUser.role === 'sub_area_admin' || currentUser.role === 'master_admin') {
        // Admins get notifications about pending bookings
        const pendingBookings = data.bookings.filter(b => b.status === 'pending');
        if (pendingBookings.length > 0) {
          allNotifications.push({
            id: 'pending-bookings',
            type: 'info',
            message: `${pendingBookings.length} booking${pendingBookings.length > 1 ? 's' : ''} awaiting approval`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }

        // Access requests for master admin
        if (currentUser.role === 'master_admin') {
          const pendingRequests = data.access_requests?.filter(r => r.status === 'pending') || [];
          if (pendingRequests.length > 0) {
            allNotifications.push({
              id: 'access-requests',
              type: 'info',
              message: `${pendingRequests.length} access request${pendingRequests.length > 1 ? 's' : ''} pending review`,
              timestamp: new Date().toISOString(),
              read: false
            });
          }
        }
      }

      // Sort by timestamp, newest first
      allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(allNotifications.slice(0, 10)); // Limit to 10 most recent
      setUnreadCount(allNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info':
      default: return 'ℹ';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-center">
      <button
        className="notification-bell"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label={`Notifications. ${unreadCount} unread`}
        data-testid="notification-bell"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge" data-testid="notification-count">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown" data-testid="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="btn-text"
                data-testid="mark-all-read-btn"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  data-testid="notification-item"
                >
                  <span className={`notification-icon notification-${notification.type}`}>
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
                  </div>
                  {!notification.read && <span className="unread-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
