import { query } from '../config/database.js';

/**
 * Get all equipment kits
 * GET /api/kits
 */
export const getAllKits = async (req, res) => {
  try {
    const { department_id, is_active } = req.query;

    let queryText = `
      SELECT
        k.id, k.name, k.description, k.department_id, k.equipment_ids,
        k.image_url, k.is_active, k.created_at,
        u.full_name as created_by_name
      FROM equipment_kits k
      LEFT JOIN users u ON k.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Apply role-based filters
    if (req.user.role === 'department_admin') {
      // Dept admins only see kits for their department
      queryText += ` AND k.department_id = $${paramCount}`;
      params.push(req.user.department);
      paramCount++;
    }

    if (department_id) {
      queryText += ` AND k.department_id = $${paramCount}`;
      params.push(department_id);
      paramCount++;
    }

    if (is_active !== undefined) {
      queryText += ` AND k.is_active = $${paramCount}`;
      params.push(is_active === 'true');
      paramCount++;
    }

    queryText += ' ORDER BY k.name ASC';

    const result = await query(queryText, params);

    res.json({
      kits: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get kits error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment kits' });
  }
};

/**
 * Get single kit by ID
 * GET /api/kits/:id
 */
export const getKitById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        k.id, k.name, k.description, k.department_id, k.equipment_ids,
        k.image_url, k.is_active, k.created_at,
        u.full_name as created_by_name
      FROM equipment_kits k
      LEFT JOIN users u ON k.created_by = u.id
      WHERE k.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kit not found' });
    }

    const kit = result.rows[0];

    // Check permissions
    if (req.user.role === 'department_admin' && kit.department_id !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get equipment details
    if (kit.equipment_ids && kit.equipment_ids.length > 0) {
      const equipmentResult = await query(`
        SELECT id, product_name, category, status, image_url
        FROM equipment
        WHERE id = ANY($1)
      `, [kit.equipment_ids]);

      kit.equipment = equipmentResult.rows;
    } else {
      kit.equipment = [];
    }

    res.json({ kit });
  } catch (error) {
    console.error('Get kit error:', error);
    res.status(500).json({ error: 'Failed to fetch kit' });
  }
};

/**
 * Create equipment kit
 * POST /api/kits
 */
export const createKit = async (req, res) => {
  try {
    const { id, name, description, department_id, equipment_ids, image_url } = req.body;

    if (!id || !name || !department_id || !equipment_ids || equipment_ids.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check permissions
    if (req.user.role === 'department_admin' && department_id !== req.user.department) {
      return res.status(403).json({ error: 'Can only create kits for your department' });
    }

    // Check if kit ID already exists
    const existing = await query('SELECT id FROM equipment_kits WHERE id = $1', [id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Kit with this ID already exists' });
    }

    // Verify all equipment exists
    const equipmentCheck = await query(
      'SELECT COUNT(*) as count FROM equipment WHERE id = ANY($1)',
      [equipment_ids]
    );

    if (parseInt(equipmentCheck.rows[0].count) !== equipment_ids.length) {
      return res.status(400).json({ error: 'Some equipment IDs are invalid' });
    }

    const result = await query(`
      INSERT INTO equipment_kits (
        id, name, description, department_id, equipment_ids,
        image_url, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, description, department_id, equipment_ids, image_url, is_active, created_at
    `, [
      id,
      name,
      description || null,
      department_id,
      equipment_ids,
      image_url || null,
      req.user.id
    ]);

    const kit = result.rows[0];

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'create',
      'equipment_kit',
      kit.id,
      JSON.stringify({ name, department_id, equipment_count: equipment_ids.length })
    ]);

    res.status(201).json({ kit, message: 'Kit created successfully' });
  } catch (error) {
    console.error('Create kit error:', error);
    res.status(500).json({ error: 'Failed to create kit' });
  }
};

/**
 * Update equipment kit
 * PUT /api/kits/:id
 */
export const updateKit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, equipment_ids, image_url, is_active } = req.body;

    // Check if kit exists
    const existing = await query('SELECT id, department_id FROM equipment_kits WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Kit not found' });
    }

    const kit = existing.rows[0];

    // Check permissions
    if (req.user.role === 'department_admin' && kit.department_id !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Verify equipment IDs if provided
    if (equipment_ids && equipment_ids.length > 0) {
      const equipmentCheck = await query(
        'SELECT COUNT(*) as count FROM equipment WHERE id = ANY($1)',
        [equipment_ids]
      );

      if (parseInt(equipmentCheck.rows[0].count) !== equipment_ids.length) {
        return res.status(400).json({ error: 'Some equipment IDs are invalid' });
      }
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (equipment_ids !== undefined) {
      updates.push(`equipment_ids = $${paramCount}`);
      params.push(equipment_ids);
      paramCount++;
    }

    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount}`);
      params.push(image_url);
      paramCount++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount}`);
      params.push(is_active);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const result = await query(`
      UPDATE equipment_kits
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, description, department_id, equipment_ids, image_url, is_active, created_at
    `, params);

    const updatedKit = result.rows[0];

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'update',
      'equipment_kit',
      updatedKit.id,
      JSON.stringify(req.body)
    ]);

    res.json({ kit: updatedKit, message: 'Kit updated successfully' });
  } catch (error) {
    console.error('Update kit error:', error);
    res.status(500).json({ error: 'Failed to update kit' });
  }
};

/**
 * Delete equipment kit
 * DELETE /api/kits/:id
 */
export const deleteKit = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if kit exists
    const existing = await query('SELECT id, name, department_id FROM equipment_kits WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Kit not found' });
    }

    const kit = existing.rows[0];

    // Check permissions
    if (req.user.role === 'department_admin' && kit.department_id !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete kit
    await query('DELETE FROM equipment_kits WHERE id = $1', [id]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'delete',
      'equipment_kit',
      id,
      JSON.stringify({ name: kit.name })
    ]);

    res.json({ message: 'Kit deleted successfully' });
  } catch (error) {
    console.error('Delete kit error:', error);
    res.status(500).json({ error: 'Failed to delete kit' });
  }
};
