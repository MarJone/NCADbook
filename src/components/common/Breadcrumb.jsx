import { Link, useLocation } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import './Breadcrumb.css';

/**
 * Breadcrumb Navigation Component
 *
 * Provides automatic route-based breadcrumb navigation with:
 * - Automatic route detection from URL
 * - Clickable parent paths
 * - Non-clickable current page
 * - Home icon for root
 * - Chevron separators
 * - Responsive design (collapses on mobile)
 *
 * @param {Object} props
 * @param {Array} props.customItems - Optional custom breadcrumb items (overrides auto-generation)
 * @param {string} props.className - Additional CSS classes
 */
export default function Breadcrumb({ customItems = null, className = '' }) {
  const location = useLocation();

  // Route mapping for human-readable labels
  const routeLabels = {
    // Admin portal routes
    'admin': 'Dashboard',
    'approvals': 'Booking Approvals',
    'equipment': 'Equipment Management',
    'analytics': 'Analytics & Reports',
    'users': 'User Management',
    'kits': 'Kit Management',
    'departments': 'Department Management',
    'student-assignment': 'Student Assignment',
    'interdisciplinary': 'Interdisciplinary Access',
    'access-requests': 'Access Requests',
    'manage-access-requests': 'Manage Access Requests',
    'csv-import': 'CSV Import',
    'permissions': 'Admin Permissions',
    'features': 'Feature Flags',
    'department-staff-permissions': 'Department Staff Permissions',
    'system-settings': 'System Settings',
    'role-management': 'Role Management',
    'cross-department-requests': 'Cross-Department Requests',
    'equipment-kits': 'Equipment Kits',
    'checkout': 'Checkout Verification',
    'return': 'Return Verification',
    'accessories': 'Accessory Manager',
    'labels': 'Print Labels',

    // Master admin routes
    'master-admin': 'Master Admin Dashboard',

    // Student portal routes
    'student': 'Student Dashboard',
    'browse': 'Browse Equipment',
    'bookings': 'My Bookings',
    'profile': 'My Profile',

    // Staff portal routes
    'staff': 'Staff Dashboard',
    'rooms': 'Room Booking',
    'my-cross-department-requests': 'My Cross-Department Requests',
  };

  /**
   * Generate breadcrumb items from current URL path
   * @returns {Array} Array of breadcrumb items with label, path, and isLast properties
   */
  const generateBreadcrumbs = () => {
    if (customItems) {
      return customItems;
    }

    const pathnames = location.pathname.split('/').filter(x => x && x !== 'NCADbook');

    // Don't show breadcrumbs on root path
    if (pathnames.length === 0) {
      return [];
    }

    const items = [];

    // Add home/root item based on first path segment
    const rootPath = pathnames[0];
    const homeLabel = routeLabels[rootPath] || 'Home';
    const homePath = `/${rootPath}`;

    items.push({
      label: homeLabel,
      path: homePath,
      isHome: true,
      isLast: pathnames.length === 1
    });

    // Add intermediate and final items
    let currentPath = `/${rootPath}`;
    for (let i = 1; i < pathnames.length; i++) {
      const segment = pathnames[i];
      currentPath += `/${segment}`;

      // Get human-readable label
      const label = routeLabels[segment] || formatLabel(segment);

      items.push({
        label,
        path: currentPath,
        isHome: false,
        isLast: i === pathnames.length - 1
      });
    }

    return items;
  };

  /**
   * Format a URL segment into a readable label
   * Converts kebab-case and snake_case to Title Case
   * @param {string} segment - URL segment to format
   * @returns {string} Formatted label
   */
  const formatLabel = (segment) => {
    return segment
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      className={`breadcrumb ${className}`}
      aria-label="Breadcrumb navigation"
      data-testid="breadcrumb"
    >
      <ol className="breadcrumb-list">
        {breadcrumbs.map((item, index) => (
          <li
            key={item.path}
            className={`breadcrumb-item ${item.isLast ? 'breadcrumb-item--active' : ''}`}
          >
            {item.isLast ? (
              // Current page - not clickable
              <span className="breadcrumb-current" aria-current="page">
                {item.label}
              </span>
            ) : (
              // Parent pages - clickable
              <>
                <Link
                  to={item.path}
                  className="breadcrumb-link"
                  aria-label={item.isHome ? 'Go to home' : `Go to ${item.label}`}
                >
                  {item.isHome ? (
                    <>
                      <Home
                        className="breadcrumb-home-icon"
                        size={16}
                        aria-hidden="true"
                      />
                      <span className="breadcrumb-label">{item.label}</span>
                    </>
                  ) : (
                    <span className="breadcrumb-label">{item.label}</span>
                  )}
                </Link>
                <ChevronRight
                  className="breadcrumb-separator"
                  size={16}
                  aria-hidden="true"
                />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
