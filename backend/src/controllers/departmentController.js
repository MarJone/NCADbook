import { query } from '../config/database.js';

/**
 * Get all departments/sub-areas
 * GET /api/departments
 */
export const getAllDepartments = async (req, res) => {
  try {
    const { school } = req.query;

    let queryText = 'SELECT id, name, school, description, parent_department, created_at FROM sub_areas WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (school) {
      queryText += ` AND school = $${paramCount}`;
      params.push(school);
      paramCount++;
    }

    queryText += ' ORDER BY school, name ASC';

    const result = await query(queryText, params);

    res.json({
      departments: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

/**
 * Get single department by ID
 * GET /api/departments/:id
 */
export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT id, name, school, description, parent_department, created_at FROM sub_areas WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json({ department: result.rows[0] });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Failed to fetch department' });
  }
};

/**
 * Create new department
 * POST /api/departments
 */
export const createDepartment = async (req, res) => {
  try {
    const { id, name, school, description, parent_department } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: 'Department ID and name are required' });
    }

    // Check if department already exists
    const existing = await query('SELECT id FROM sub_areas WHERE id = $1', [id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Department with this ID already exists' });
    }

    const result = await query(`
      INSERT INTO sub_areas (id, name, school, description, parent_department)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, school, description, parent_department, created_at
    `, [id, name, school || null, description || null, parent_department || null]);

    const department = result.rows[0];

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'create',
      'department',
      department.id,
      JSON.stringify({ name, school })
    ]);

    res.status(201).json({ department, message: 'Department created successfully' });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
};

/**
 * Update department
 * PUT /api/departments/:id
 */
export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, school, description, parent_department } = req.body;

    // Check if department exists
    const existing = await query('SELECT id FROM sub_areas WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (school !== undefined) {
      updates.push(`school = $${paramCount}`);
      params.push(school);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (parent_department !== undefined) {
      updates.push(`parent_department = $${paramCount}`);
      params.push(parent_department);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const result = await query(`
      UPDATE sub_areas
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, school, description, parent_department, created_at
    `, params);

    const department = result.rows[0];

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'update',
      'department',
      department.id,
      JSON.stringify(req.body)
    ]);

    res.json({ department, message: 'Department updated successfully' });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ error: 'Failed to update department' });
  }
};

/**
 * Delete department
 * DELETE /api/departments/:id
 */
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const existing = await query('SELECT id, name FROM sub_areas WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const dept = existing.rows[0];

    // Check if department has users
    const usersCount = await query('SELECT COUNT(*) as count FROM users WHERE department = $1', [id]);
    if (parseInt(usersCount.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'Cannot delete department with existing users',
        userCount: parseInt(usersCount.rows[0].count)
      });
    }

    // Check if department has equipment
    const equipmentCount = await query('SELECT COUNT(*) as count FROM equipment WHERE department = $1', [id]);
    if (parseInt(equipmentCount.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'Cannot delete department with existing equipment',
        equipmentCount: parseInt(equipmentCount.rows[0].count)
      });
    }

    // Delete department
    await query('DELETE FROM sub_areas WHERE id = $1', [id]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'delete',
      'department',
      id,
      JSON.stringify({ name: dept.name })
    ]);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ error: 'Failed to delete department' });
  }
};
