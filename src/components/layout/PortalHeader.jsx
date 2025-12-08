import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Bell, User, Search, Command } from 'lucide-react';
import { MegaMenuNav } from './MegaMenuNav';
import { useScrollHeader } from '../../hooks/useScrollReveal';
import './PortalHeader.css';

/**
 * PortalHeader - Scroll-aware header with glassmorphism
 *
 * Features:
 * - Scroll-aware styling
 * - Integrated mega menu navigation
 * - Notification indicator
 * - User menu
 * - Mobile hamburger
 *
 * @param {Object} props
 * @param {string} props.portalType - Current portal type
 * @param {Object} props.user - Current user
 * @param {string} props.logoSrc - Logo image source
 * @param {Function} props.onMobileMenuToggle - Mobile menu toggle callback
 * @param {Function} props.onSearchOpen - Search open callback
 * @param {Function} props.onCommandPaletteOpen - Command palette callback
 * @param {number} props.notificationCount - Number of notifications
 */
export function PortalHeader({
  portalType = 'student',
  user,
  logoSrc = '/images/ncad-logo.svg',
  onMobileMenuToggle,
  onSearchOpen,
  onCommandPaletteOpen,
  notificationCount = 0,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Scroll behavior
  const { isScrolled, scrollY } = useScrollHeader(50);

  // Portal display names
  const portalNames = {
    student: 'Student Portal',
    staff: 'Staff Portal',
    'dept-admin': 'Department Admin',
    'master-admin': 'Master Admin',
  };

  // Handle mobile menu toggle
  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    onMobileMenuToggle?.(!isMobileMenuOpen);
  }, [isMobileMenuOpen, onMobileMenuToggle]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.header-user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K or Ctrl+K for search/command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (portalType === 'master-admin') {
          onCommandPaletteOpen?.();
        } else {
          onSearchOpen?.();
        }
      }

      // / for quick search focus
      if (e.key === '/' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        onSearchOpen?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [portalType, onSearchOpen, onCommandPaletteOpen]);

  // Determine header class based on portal and scroll state
  const headerClass = `
    portal-header
    ${portalType}-header
    ${isScrolled ? 'scrolled' : ''}
  `.trim();

  return (
    <header
      className={headerClass}
      data-scrolled={isScrolled}
      data-scroll-y={scrollY}
    >
      <div className="header-container">
        {/* Logo / Portal Name */}
        <div className="header-brand">
          <Link to={`/${portalType === 'student' ? '' : portalType}`} className="header-logo-link">
            {logoSrc ? (
              <img src={logoSrc} alt="NCAD" className="header-logo" />
            ) : (
              <span className="header-logo-text">NCAD</span>
            )}
          </Link>
          <span className="header-portal-name">{portalNames[portalType]}</span>
        </div>

        {/* Desktop Navigation */}
        <div className="header-nav-desktop">
          <MegaMenuNav portalType={portalType} user={user} />
        </div>

        {/* Actions */}
        <div className="header-actions">
          {/* Search Trigger */}
          <button
            className="header-action-btn"
            onClick={onSearchOpen}
            aria-label="Search"
          >
            <Search size={20} />
            <span className="header-shortcut">/</span>
          </button>

          {/* Command Palette (Master Admin only) */}
          {portalType === 'master-admin' && (
            <button
              className="header-action-btn"
              onClick={onCommandPaletteOpen}
              aria-label="Command palette"
            >
              <Command size={20} />
              <span className="header-shortcut">
                <kbd>⌘</kbd><kbd>K</kbd>
              </span>
            </button>
          )}

          {/* Notifications */}
          <button
            className="header-action-btn header-notifications"
            aria-label={`${notificationCount} notifications`}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="header-badge">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="header-user-menu-container">
            <button
              className="header-user-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-expanded={isUserMenuOpen}
              aria-haspopup="true"
            >
              <div className="header-user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <span className="header-user-name">{user?.name || 'User'}</span>
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="header-user-dropdown">
                <div className="header-user-dropdown-header">
                  <div className="header-user-dropdown-name">{user?.name || 'User'}</div>
                  <div className="header-user-dropdown-email">{user?.email || 'user@ncad.ie'}</div>
                </div>
                <div className="header-user-dropdown-divider" />
                <ul className="header-user-dropdown-menu">
                  <li><Link to="/profile">My Profile</Link></li>
                  <li><Link to="/bookings">My Bookings</Link></li>
                  <li><Link to="/settings">Settings</Link></li>
                </ul>
                <div className="header-user-dropdown-divider" />
                <button className="header-user-dropdown-logout">Sign Out</button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="header-mobile-toggle"
            onClick={handleMobileMenuToggle}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <div
        className="header-scroll-progress"
        style={{ transform: `scaleX(${Math.min(scrollY / 1000, 1)})` }}
      />
    </header>
  );
}

export default PortalHeader;
