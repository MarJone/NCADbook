import React from 'react';

/**
 * GlassPanel - Glassmorphism wrapper component
 *
 * Features:
 * - Frosted glass effect (backdrop-filter)
 * - Multiple blur intensities
 * - Optional gradient border
 * - Portal-aware tinting
 *
 * @param {Object} props
 * @param {ReactNode} props.children - Panel content
 * @param {string} props.variant - 'subtle' | 'default' | 'strong'
 * @param {boolean} props.gradientBorder - Show gradient border
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Inline styles
 */
export function GlassPanel({
  children,
  variant = 'default',
  gradientBorder = false,
  className = '',
  style = {},
  as: Component = 'div',
  ...props
}) {
  const variantClasses = {
    subtle: 'glass-subtle',
    default: 'glass',
    strong: 'glass-strong',
  };

  const baseClass = variantClasses[variant] || 'glass';
  const borderClass = gradientBorder ? 'glass-card-gradient' : '';

  return (
    <Component
      className={`${baseClass} ${borderClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </Component>
  );
}

/**
 * GlassCard - Glassmorphism card with hover effects
 */
export function GlassCard({
  children,
  hoverable = true,
  className = '',
  ...props
}) {
  return (
    <GlassPanel
      className={`glass-card ${hoverable ? 'hover-lift' : ''} ${className}`}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

/**
 * GlassModal - Glassmorphism modal wrapper
 */
export function GlassModal({
  children,
  isOpen,
  onClose,
  className = '',
  ...props
}) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="glass-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`glass-modal modal-3d-enter ${className}`}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    </>
  );
}

/**
 * GlassNav - Glassmorphism navigation wrapper
 */
export function GlassNav({ children, floating = false, className = '', ...props }) {
  const navClass = floating ? 'glass-nav-floating' : 'glass-nav';

  return (
    <nav className={`${navClass} ${className}`} {...props}>
      {children}
    </nav>
  );
}

/**
 * GlassButton - Glassmorphism button
 */
export function GlassButton({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  const variantClass = variant === 'accent' ? 'glass-btn-accent' : '';

  return (
    <button className={`glass-btn ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

/**
 * GlassInput - Glassmorphism input field
 */
export function GlassInput({ className = '', ...props }) {
  return (
    <input className={`glass-input ${className}`} {...props} />
  );
}

/**
 * GlassSearch - Glassmorphism search input with icon
 */
export function GlassSearch({
  value,
  onChange,
  placeholder = 'Search...',
  icon,
  className = '',
  ...props
}) {
  return (
    <div className={`glass-search ${className}`}>
      {icon && <span className="glass-search-icon">{icon}</span>}
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

/**
 * GlassDropdown - Glassmorphism dropdown menu
 */
export function GlassDropdown({ children, isOpen, className = '', ...props }) {
  if (!isOpen) return null;

  return (
    <div className={`glass-dropdown ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * GlassTooltip - Glassmorphism tooltip
 */
export function GlassTooltip({ children, className = '', ...props }) {
  return (
    <div className={`glass-tooltip ${className}`} {...props}>
      {children}
    </div>
  );
}

/**
 * GlassBadge - Glassmorphism badge
 */
export function GlassBadge({ children, className = '', ...props }) {
  return (
    <span className={`glass-badge ${className}`} {...props}>
      {children}
    </span>
  );
}

/**
 * GlassFAB - Glassmorphism floating action button
 */
export function GlassFAB({ children, onClick, className = '', ...props }) {
  return (
    <button className={`glass-fab ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
}

export default GlassPanel;
