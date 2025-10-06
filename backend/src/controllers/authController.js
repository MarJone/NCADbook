import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register new user (Master Admin only)
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { email, password, first_name, surname, role, department } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !surname || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(`
      INSERT INTO users (email, password, first_name, surname, full_name, role, department)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, first_name, surname, full_name, role, department, created_at
    `, [
      email,
      hashedPassword,
      first_name,
      surname,
      `${first_name} ${surname}`,
      role || 'student',
      department
    ]);

    const user = result.rows[0];

    // Log admin action if done by admin
    if (req.user) {
      await query(`
        INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        req.user.id,
        'create',
        'user',
        user.id,
        JSON.stringify({ email, role: user.role, department })
      ]);
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        surname: user.surname,
        full_name: user.full_name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user from database
    const result = await query(`
      SELECT id, email, password, first_name, surname, full_name, role, department,
             admin_permissions, view_permissions, strike_count, blacklist_until
      FROM users
      WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is blacklisted
    if (user.blacklist_until && new Date(user.blacklist_until) > new Date()) {
      return res.status(403).json({
        error: 'Account temporarily suspended',
        blacklist_until: user.blacklist_until
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        surname: user.surname,
        full_name: user.full_name,
        role: user.role,
        department: user.department,
        admin_permissions: user.admin_permissions,
        view_permissions: user.view_permissions,
        strike_count: user.strike_count
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/**
 * Demo login (no password required - for development/demo only)
 * POST /api/auth/demo-login
 */
export const demoLogin = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    const validRoles = ['student', 'staff', 'department_admin', 'master_admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Get first user with this role
    const result = await query(`
      SELECT id, email, first_name, surname, full_name, role, department,
             admin_permissions, view_permissions
      FROM users
      WHERE role = $1
      LIMIT 1
    `, [role]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `No ${role} user found` });
    }

    const user = result.rows[0];

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Demo login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        surname: user.surname,
        full_name: user.full_name,
        role: user.role,
        department: user.department,
        admin_permissions: user.admin_permissions,
        view_permissions: user.view_permissions
      }
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Demo login failed' });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by authenticate middleware
    const user = req.user;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        surname: user.surname,
        full_name: user.full_name,
        role: user.role,
        department: user.department,
        admin_permissions: user.admin_permissions,
        view_permissions: user.view_permissions
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

/**
 * Update password
 * PUT /api/auth/password
 */
export const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Validate required fields
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    // Validate password strength
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Get user with password
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    // Verify current password
    const passwordMatch = await bcrypt.compare(current_password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};
