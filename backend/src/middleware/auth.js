import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

/**
 * Authentication middleware - Verifies JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await query(
      'SELECT id, email, first_name, surname, full_name, role, department, admin_permissions, view_permissions FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Role-based authorization middleware
 * @param {Array<string>} allowedRoles - Array of roles that can access the route
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Check if user has specific admin permissions
 * @param {string} permission - Permission to check (e.g., 'csv_import', 'analytics')
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Master admins have all permissions
    if (req.user.role === 'master_admin') {
      return next();
    }

    // Check specific permission in admin_permissions JSONB field
    const permissions = req.user.admin_permissions || {};
    if (!permissions[permission]) {
      return res.status(403).json({ error: `Missing permission: ${permission}` });
    }

    next();
  };
};

/**
 * Check if user can access specific department
 * @param {string} departmentField - Request field containing department (e.g., 'params.dept_id')
 */
export const requireDepartmentAccess = (departmentField) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Master admins can access all departments
    if (req.user.role === 'master_admin') {
      return next();
    }

    // Get department from request
    const fieldParts = departmentField.split('.');
    let department = req;
    for (const part of fieldParts) {
      department = department[part];
    }

    // Department admins can only access their managed department
    if (req.user.role === 'department_admin') {
      const permissions = req.user.admin_permissions || {};
      if (permissions.department_id !== department) {
        return res.status(403).json({ error: 'Cannot access this department' });
      }
    }

    next();
  };
};

/**
 * Require admin role (staff, department_admin, or master_admin)
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const adminRoles = ['staff', 'department_admin', 'master_admin'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
