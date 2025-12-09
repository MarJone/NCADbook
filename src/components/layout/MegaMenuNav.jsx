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
  Printer,
  QrCode,
  ClipboardCheck,
  Brain,
  Mail,
  Database,
  Sparkles,
  FileUp,
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
  // Routes must match actual routes defined in App.jsx and Layout components:
  // - Student: /student/*
  // - Staff: /staff/*
  // - Admin (both dept-admin and master-admin): /admin/*
  const menuConfigs = {
    student: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/student',
      },
      {
        id: 'browse',
        label: 'Browse Equipment',
        icon: Package,
        megaMenu: {
          sections: [
            {
              title: 'Categories',
              items: [
                { label: 'Cameras', icon: Camera, href: '/student/equipment?category=cameras', description: 'DSLR, Mirrorless, Cinema' },
                { label: 'Audio', icon: Headphones, href: '/student/equipment?category=audio', description: 'Mics, Recorders, Mixers' },
                { label: 'Computers', icon: Laptop, href: '/student/equipment?category=computers', description: 'Laptops, Workstations' },
                { label: 'Monitors', icon: Monitor, href: '/student/equipment?category=monitors', description: 'Field & Studio Monitors' },
              ],
            },
            {
              title: 'Quick Access',
              items: [
                { label: 'Available Now', icon: Zap, href: '/student/equipment?available=true', highlight: true },
                { label: 'New Arrivals', icon: Star, href: '/student/equipment?sort=newest' },
                { label: 'Popular Items', icon: BarChart3, href: '/student/equipment?sort=popular' },
              ],
            },
          ],
        },
      },
      {
        id: 'bookings',
        label: 'My Bookings',
        icon: Calendar,
        href: '/student/bookings',
      },
    ],

    staff: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/staff',
      },
      {
        id: 'equipment',
        label: 'Equipment',
        icon: Package,
        href: '/staff/equipment',
      },
      {
        id: 'bookings',
        label: 'Bookings',
        icon: Calendar,
        href: '/staff/bookings',
      },
      {
        id: 'rooms',
        label: 'Room Booking',
        icon: Calendar,
        href: '/staff/rooms',
      },
    ],

    'dept-admin': [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/admin',
      },
      {
        id: 'approvals',
        label: 'Approvals',
        icon: AlertTriangle,
        href: '/admin/approvals',
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
                { label: 'All Equipment', icon: Package, href: '/admin/equipment' },
                { label: 'Accessories', icon: Package, href: '/admin/accessories' },
              ],
            },
            {
              title: 'Verification & Labels',
              items: [
                { label: 'Checkout Verification', icon: ClipboardCheck, href: '/admin/checkout' },
                { label: 'Return Verification', icon: ClipboardCheck, href: '/admin/return' },
                { label: 'Print Labels', icon: Printer, href: '/admin/labels', description: 'Batch print QR labels' },
              ],
            },
          ],
        },
      },
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        href: '/admin/users',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/admin/analytics',
      },
    ],

    'master-admin': [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: Home,
        href: '/admin',
      },
      {
        id: 'approvals',
        label: 'Approvals',
        icon: AlertTriangle,
        href: '/admin/approvals',
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
                { label: 'All Equipment', icon: Package, href: '/admin/equipment' },
                { label: 'Equipment Kits', icon: Package, href: '/admin/equipment-kits' },
                { label: 'Kit Management', icon: Settings, href: '/admin/kits' },
                { label: 'Accessories', icon: Package, href: '/admin/accessories' },
              ],
            },
            {
              title: 'Verification & Labels',
              items: [
                { label: 'Checkout Verification', icon: ClipboardCheck, href: '/admin/checkout' },
                { label: 'Return Verification', icon: ClipboardCheck, href: '/admin/return' },
                { label: 'Print Labels', icon: Printer, href: '/admin/labels', description: 'Batch print QR labels' },
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
                { label: 'All Users', icon: Users, href: '/admin/users' },
                { label: 'AI Import', icon: FileUp, href: '/admin/ai-import', description: 'Smart data import' },
                { label: 'Permissions', icon: Shield, href: '/admin/permissions' },
                { label: 'Role Management', icon: Shield, href: '/admin/role-management' },
              ],
            },
          ],
        },
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/admin/analytics',
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
                { label: 'System Settings', icon: Settings, href: '/admin/system-settings' },
                { label: 'Departments', icon: FileText, href: '/admin/departments' },
                { label: 'Feature Flags', icon: Zap, href: '/admin/features' },
              ],
            },
            {
              title: 'AI Tools',
              items: [
                { label: 'AI Settings', icon: Brain, href: '/admin/ai-settings', description: 'Configure local LLM' },
                { label: 'AI Import', icon: FileUp, href: '/admin/ai-import', description: 'Smart data import wizard' },
                { label: 'Natural Language Query', icon: Database, href: '/admin/nlq', description: 'Query data with AI' },
                { label: 'Email Draft Assistant', icon: Mail, href: '/admin/email-draft', description: 'AI-powered emails' },
                { label: 'Justification Analyzer', icon: FileText, href: '/admin/justification-analyzer', description: 'Analyze booking requests' },
                { label: 'Condition Assessment', icon: Sparkles, href: '/admin/condition-assessment', description: 'AI equipment inspection' },
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
