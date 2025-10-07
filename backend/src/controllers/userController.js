import { query } from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * Get all users with optional filters
 * GET /api/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role, department, search, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT
        id, email, full_name, first_name, surname,
        role, department, strike_count, created_at,
        admin_permissions, view_permissions
      FROM users
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Apply role-based filters
    if (req.user.role === 'department_admin') {
      // Dept admins only see users in their department
      queryText += ` AND department = $${paramCount}`;
      params.push(req.user.department);
      paramCount++;
    }
    // Master admins see all users (no filter needed)

    // Additional filters
    if (role) {
      queryText += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (department) {
      queryText += ` AND department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    if (search) {
      queryText += ` AND (
        LOWER(full_name) LIKE LOWER($${paramCount}) OR
        LOWER(email) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Add ordering and pagination
    queryText += ` ORDER BY full_name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (req.user.role === 'department_admin') {
      countQuery += ` AND department = $${countParamCount}`;
      countParams.push(req.user.department);
      countParamCount++;
    }

    if (role) {
      countQuery += ` AND role = $${countParamCount}`;
      countParams.push(role);
      countParamCount++;
    }

    if (department) {
      countQuery += ` AND department = $${countParamCount}`;
      countParams.push(department);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND (
        LOWER(full_name) LIKE LOWER($${countParamCount}) OR
        LOWER(email) LIKE LOWER($${countParamCount})
      )`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Remove password from all users
    const users = result.rows.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Get single user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        id, email, full_name, first_name, surname,
        role, department, strike_count, created_at,
        admin_permissions, view_permissions
      FROM users
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Check permissions
    if (req.user.role === 'department_admin' && user.department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

/**
 * Create new user
 * POST /api/users
 */
export const createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      first_name,
      surname,
      role,
      department,
      admin_permissions,
      view_permissions
    } = req.body;

    // Validate required fields
    if (!email || !password || !full_name || !role || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(`
      INSERT INTO users (
        email, password, full_name, first_name, surname,
        role, department, admin_permissions, view_permissions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, full_name, first_name, surname, role, department, created_at
    `, [
      email,
      hashedPassword,
      full_name,
      first_name || '',
      surname || '',
      role,
      department,
      admin_permissions ? JSON.stringify(admin_permissions) : null,
      view_permissions ? JSON.stringify(view_permissions) : null
    ]);

    const user = result.rows[0];

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'create',
      'user',
      user.id,
      JSON.stringify({ email, role, department })
    ]);

    res.status(201).json({ user, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

/**
 * Update user
 * PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      full_name,
      first_name,
      surname,
      role,
      department,
      admin_permissions,
      view_permissions,
      strike_count
    } = req.body;

    // Check if user exists
    const existingUser = await query('SELECT id, department FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check permissions
    if (req.user.role === 'department_admin') {
      const user = existingUser.rows[0];
      if (user.department !== req.user.department) {
        return res.status(403).json({ error: 'Access denied' });
      }
      // Dept admins cannot change roles or departments
      if (role || department) {
        return res.status(403).json({ error: 'Insufficient permissions to modify role/department' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      params.push(email);
      paramCount++;
    }

    if (full_name !== undefined) {
      updates.push(`full_name = $${paramCount}`);
      params.push(full_name);
      paramCount++;
    }

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      params.push(first_name);
      paramCount++;
    }

    if (surname !== undefined) {
      updates.push(`surname = $${paramCount}`);
      params.push(surname);
      paramCount++;
    }

    if (role !== undefined) {
      updates.push(`role = $${paramCount}`);
      params.push(role);
      paramCount++;
    }

    if (department !== undefined) {
      updates.push(`department = $${paramCount}`);
      params.push(department);
      paramCount++;
    }

    if (admin_permissions !== undefined) {
      updates.push(`admin_permissions = $${paramCount}`);
      params.push(JSON.stringify(admin_permissions));
      paramCount++;
    }

    if (view_permissions !== undefined) {
      updates.push(`view_permissions = $${paramCount}`);
      params.push(JSON.stringify(view_permissions));
      paramCount++;
    }

    if (strike_count !== undefined) {
      updates.push(`strike_count = $${paramCount}`);
      params.push(strike_count);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update user
    params.push(id);
    const result = await query(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, full_name, first_name, surname, role, department, strike_count, created_at
    `, params);

    const user = result.rows[0];

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'update',
      'user',
      user.id,
      JSON.stringify(req.body)
    ]);

    res.json({ user, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Delete user
 * DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await query('SELECT id, email FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = existingUser.rows[0];

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check for active bookings
    const activeBookings = await query(`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE user_id = $1 AND status IN ('pending', 'approved')
    `, [id]);

    if (parseInt(activeBookings.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'Cannot delete user with active bookings',
        activeBookings: parseInt(activeBookings.rows[0].count)
      });
    }

    // Delete user
    await query('DELETE FROM users WHERE id = $1', [id]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'delete',
      'user',
      id,
      JSON.stringify({ email: user.email })
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

/**
 * Add strike to user
 * POST /api/users/:id/strike
 */
export const addStrike = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, booking_id } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Strike reason is required' });
    }

    // Check if user exists
    const userResult = await query('SELECT id, strike_count FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentStrikes = userResult.rows[0].strike_count || 0;
    const newStrikeCount = currentStrikes + 1;

    // Update user strike count
    await query('UPDATE users SET strike_count = $1 WHERE id = $2', [newStrikeCount, id]);

    // Record strike in strike_history
    await query(`
      INSERT INTO strike_history (user_id, admin_id, reason, booking_id)
      VALUES ($1, $2, $3, $4)
    `, [id, req.user.id, reason, booking_id || null]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'add_strike',
      'user',
      id,
      JSON.stringify({ reason, booking_id, new_strike_count: newStrikeCount })
    ]);

    res.json({
      message: 'Strike added successfully',
      strike_count: newStrikeCount
    });
  } catch (error) {
    console.error('Add strike error:', error);
    res.status(500).json({ error: 'Failed to add strike' });
  }
};

/**
 * Get user strike history
 * GET /api/users/:id/strikes
 */
export const getUserStrikes = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        sh.id, sh.user_id, sh.admin_id, sh.reason, sh.booking_id, sh.created_at,
        u.full_name as admin_name
      FROM strike_history sh
      LEFT JOIN users u ON sh.admin_id = u.id
      WHERE sh.user_id = $1
      ORDER BY sh.created_at DESC
    `, [id]);

    res.json({ strikes: result.rows });
  } catch (error) {
    console.error('Get strikes error:', error);
    res.status(500).json({ error: 'Failed to fetch strike history' });
  }
};
