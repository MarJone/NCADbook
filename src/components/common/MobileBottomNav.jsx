import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/mobile-bottom-nav.css';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (!user) return null;

  // Define navigation items based on user role
  const getNavItems = () => {
    switch (user.role) {
      case 'student':
        return [
          { path: '/student/equipment', icon: '🔍', label: 'Browse', testId: 'nav-browse' },
          { path: '/student/bookings', icon: '📅', label: 'Bookings', testId: 'nav-bookings' },
          { path: '/student', icon: '🏠', label: 'Dashboard', testId: 'nav-dashboard' }
        ];

      case 'staff':
        return [
          { path: '/staff', icon: '🏠', label: 'Dashboard', testId: 'nav-dashboard' },
          { path: '/staff/rooms', icon: '📅', label: 'Rooms', testId: 'nav-rooms' },
          { path: '/staff/equipment', icon: '🎥', label: 'Equipment', testId: 'nav-equipment' },
          { path: '/staff/bookings', icon: '📋', label: 'Bookings', testId: 'nav-bookings' }
        ];

      case 'department_admin':
        return [
          { path: '/admin', icon: '📊', label: 'Dashboard', testId: 'nav-dashboard' },
          { path: '/admin/approvals', icon: '✅', label: 'Approvals', testId: 'nav-approvals' },
          { path: '/admin/equipment', icon: '🎥', label: 'Equipment', testId: 'nav-equipment' },
          { path: '/admin/users', icon: '👥', label: 'Users', testId: 'nav-users' }
        ];

      case 'master_admin':
        return [
          { path: '/admin', icon: '📊', label: 'Dashboard', testId: 'nav-dashboard' },
          { path: '/admin/users', icon: '👥', label: 'Users', testId: 'nav-users' },
          { path: '/admin/analytics', icon: '📈', label: 'Analytics', testId: 'nav-analytics' },
          { path: '/admin/system-settings', icon: '⚙️', label: 'Settings', testId: 'nav-settings' }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    if (path === location.pathname) return true;
    // Handle sub-routes (e.g., /student/equipment-browse should highlight /student)
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="mobile-bottom-nav" data-testid="mobile-bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => handleNavigation(item.path)}
          data-testid={item.testId}
          aria-label={item.label}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          <span className="nav-icon" role="img" aria-hidden="true">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
