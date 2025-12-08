import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Package,
  Calendar,
  Users,
  Settings,
  BarChart3,
  FileText,
  Shield,
  AlertTriangle,
  Home,
  BookOpen,
  Clock,
  Star,
  Zap,
  Camera,
  Monitor,
  Headphones,
  Laptop,
} from 'lucide-react';
import './MegaMenuNav.css';

/**
 * MegaMenuNav - Desktop mega-menu navigation
 *
 * Features:
 * - Smartway2-inspired dropdowns with 3D fold animation
 * - Icon rotations on expand
 * - Accent underlines on hover
 * - Feature promotion panels
 *
 * @param {Object} props
 * @param {string} props.portalType - Current portal type
 * @param {Object} props.user - Current user
 * @param {Array} props.customMenuItems - Additional menu items
 */
export function MegaMenuNav({
  portalType = 'student',
  user,
  customMenuItems = [],
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const location = useLocation();
  const navRef = useRef(null);

  // Menu configurations per portal
  const menuConfigs = {
    student: [
      {
        id: 'browse',
        label: 'Browse Equipment',
        icon: Package,
        megaMenu: {
          sections: [
            {
              title: 'Categories',
              items: [
                { label: 'Cameras', icon: Camera, href: '/equipment?category=cameras', description: 'DSLR, Mirrorless, Cinema' },
                { label: 'Audio', icon: Headphones, href: '/equipment?category=audio', description: 'Mics, Recorders, Mixers' },
                { label: 'Computers', icon: Laptop, href: '/equipment?category=computers', description: 'Laptops, Workstations' },
                { label: 'Monitors', icon: Monitor, href: '/equipment?category=monitors', description: 'Field & Studio Monitors' },
              ],
            },
            {
              title: 'Quick Access',
              items: [
                { label: 'Available Now', icon: Zap, href: '/equipment?available=true', highlight: true },
                { label: 'New Arrivals', icon: Star, href: '/equipment?sort=newest' },
                { label: 'Popular Items', icon: BarChart3, href: '/equipment?sort=popular' },
              ],
            },
          ],
          featured: {
            title: 'Featured Equipment',
            description: 'Check out our newly added Sony FX6 cinema camera kit!',
            href: '/equipment/sony-fx6',
            image: '/images/equipment/featured-camera.jpg',
          },
        },
      },
      {
        id: 'bookings',
        label: 'My Bookings',
        icon: Calendar,
        megaMenu: {
          sections: [
            {
              title: 'Manage Bookings',
              items: [
                { label: 'Active Bookings', icon: Clock, href: '/bookings/active' },
                { label: 'Booking History', icon: BookOpen, href: '/bookings/history' },
                { label: 'Pending Approval', icon: AlertTriangle, href: '/bookings/pending' },
              ],
            },
          ],
        },
      },
    ],

    staff: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/staff/dashboard',
      },
      {
        id: 'equipment',
        label: 'Equipment',
        icon: Package,
        megaMenu: {
          sections: [
            {
              title: 'Management',
              items: [
                { label: 'All Equipment', icon: Package, href: '/staff/equipment' },
                { label: 'Add New', icon: Zap, href: '/staff/equipment/new' },
                { label: 'Maintenance', icon: Settings, href: '/staff/equipment/maintenance' },
              ],
            },
          ],
        },
      },
      {
        id: 'bookings',
        label: 'Bookings',
        icon: Calendar,
        megaMenu: {
          sections: [
            {
              title: 'Booking Management',
              items: [
                { label: 'All Bookings', icon: Calendar, href: '/staff/bookings' },
                { label: 'Pending Approval', icon: AlertTriangle, href: '/staff/bookings/pending', badge: true },
                { label: 'Schedule View', icon: Clock, href: '/staff/bookings/schedule' },
              ],
            },
          ],
        },
      },
    ],

    'dept-admin': [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/dept-admin/dashboard',
      },
      {
        id: 'equipment',
        label: 'Equipment',
        icon: Package,
        href: '/dept-admin/equipment',
      },
      {
        id: 'bookings',
        label: 'Bookings',
        icon: Calendar,
        megaMenu: {
          sections: [
            {
              title: 'Booking Management',
              items: [
                { label: 'All Bookings', icon: Calendar, href: '/dept-admin/bookings' },
                { label: 'Pending Approval', icon: AlertTriangle, href: '/dept-admin/bookings/pending', badge: true },
                { label: 'Department Stats', icon: BarChart3, href: '/dept-admin/analytics' },
              ],
            },
          ],
        },
      },
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        href: '/dept-admin/users',
      },
    ],

    'master-admin': [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/master-admin/dashboard',
      },
      {
        id: 'equipment',
        label: 'Equipment',
        icon: Package,
        megaMenu: {
          sections: [
            {
              title: 'Equipment Management',
              items: [
                { label: 'All Equipment', icon: Package, href: '/master-admin/equipment' },
                { label: 'Add New', icon: Zap, href: '/master-admin/equipment/new' },
                { label: 'Categories', icon: FileText, href: '/master-admin/equipment/categories' },
                { label: 'Maintenance', icon: Settings, href: '/master-admin/equipment/maintenance' },
              ],
            },
          ],
        },
      },
      {
        id: 'bookings',
        label: 'Bookings',
        icon: Calendar,
        megaMenu: {
          sections: [
            {
              title: 'Booking Management',
              items: [
                { label: 'All Bookings', icon: Calendar, href: '/master-admin/bookings' },
                { label: 'Pending Approval', icon: AlertTriangle, href: '/master-admin/bookings/pending', badge: true },
                { label: 'Schedule View', icon: Clock, href: '/master-admin/bookings/schedule' },
              ],
            },
          ],
        },
      },
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        megaMenu: {
          sections: [
            {
              title: 'User Management',
              items: [
                { label: 'All Users', icon: Users, href: '/master-admin/users' },
                { label: 'Import CSV', icon: FileText, href: '/master-admin/users/import' },
                { label: 'Permissions', icon: Shield, href: '/master-admin/users/permissions' },
              ],
            },
          ],
        },
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/master-admin/analytics',
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        megaMenu: {
          sections: [
            {
              title: 'System Settings',
              items: [
                { label: 'Policies', icon: Shield, href: '/master-admin/settings/policies' },
                { label: 'Fines', icon: AlertTriangle, href: '/master-admin/settings/fines' },
                { label: 'Departments', icon: FileText, href: '/master-admin/settings/departments' },
                { label: 'System Config', icon: Settings, href: '/master-admin/settings/system' },
              ],
            },
          ],
        },
      },
    ],
  };

  const menuItems = [...(menuConfigs[portalType] || []), ...customMenuItems];

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = useCallback((menuId) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setActiveMenu(menuId);
  }, [hoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
    setHoverTimeout(timeout);
  }, []);

  const isActive = (href) => {
    if (!href) return false;
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="mega-menu-nav" ref={navRef} aria-label="Main navigation">
      <ul className="mega-menu-list" role="menubar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasMegaMenu = item.megaMenu && item.megaMenu.sections;
          const isMenuActive = activeMenu === item.id;
          const isCurrentActive = item.href ? isActive(item.href) : false;

          return (
            <li
              key={item.id}
              className={`mega-menu-item ${isMenuActive ? 'active' : ''} ${isCurrentActive ? 'current' : ''}`}
              onMouseEnter={() => hasMegaMenu && handleMouseEnter(item.id)}
              onMouseLeave={handleMouseLeave}
              role="none"
            >
              {item.href && !hasMegaMenu ? (
                <Link
                  to={item.href}
                  className="mega-menu-trigger"
                  role="menuitem"
                >
                  {Icon && <Icon className="mega-menu-icon" size={18} />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  className="mega-menu-trigger"
                  aria-expanded={isMenuActive}
                  aria-haspopup="true"
                  role="menuitem"
                  onClick={() => setActiveMenu(isMenuActive ? null : item.id)}
                >
                  {Icon && <Icon className="mega-menu-icon" size={18} />}
                  <span>{item.label}</span>
                  {hasMegaMenu && (
                    <ChevronDown
                      className={`mega-menu-chevron ${isMenuActive ? 'rotated' : ''}`}
                      size={16}
                    />
                  )}
                </button>
              )}

              {/* Accent underline */}
              <div className="mega-menu-underline" />

              {/* Mega Menu Dropdown */}
              {hasMegaMenu && (
                <div
                  className={`mega-menu-dropdown ${isMenuActive ? 'visible' : ''}`}
                  role="menu"
                  aria-hidden={!isMenuActive}
                >
                  <div className="mega-menu-content">
                    {item.megaMenu.sections.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="mega-menu-section">
                        <h3 className="mega-menu-section-title">{section.title}</h3>
                        <ul className="mega-menu-section-items">
                          {section.items.map((subItem, subIndex) => {
                            const SubIcon = subItem.icon;
                            return (
                              <li key={subIndex}>
                                <Link
                                  to={subItem.href}
                                  className={`mega-menu-subitem ${subItem.highlight ? 'highlight' : ''}`}
                                  onClick={() => setActiveMenu(null)}
                                  role="menuitem"
                                >
                                  {SubIcon && <SubIcon className="mega-menu-subitem-icon" size={18} />}
                                  <div className="mega-menu-subitem-content">
                                    <span className="mega-menu-subitem-label">
                                      {subItem.label}
                                      {subItem.badge && (
                                        <span className="mega-menu-badge">New</span>
                                      )}
                                    </span>
                                    {subItem.description && (
                                      <span className="mega-menu-subitem-desc">{subItem.description}</span>
                                    )}
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}

                    {/* Featured Panel */}
                    {item.megaMenu.featured && (
                      <div className="mega-menu-featured">
                        <Link
                          to={item.megaMenu.featured.href}
                          className="mega-menu-featured-link"
                          onClick={() => setActiveMenu(null)}
                        >
                          {item.megaMenu.featured.image && (
                            <div className="mega-menu-featured-image">
                              <img src={item.megaMenu.featured.image} alt="" />
                            </div>
                          )}
                          <div className="mega-menu-featured-content">
                            <h4 className="mega-menu-featured-title">{item.megaMenu.featured.title}</h4>
                            <p className="mega-menu-featured-desc">{item.megaMenu.featured.description}</p>
                            <span className="mega-menu-featured-cta">Learn more →</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MegaMenuNav;
