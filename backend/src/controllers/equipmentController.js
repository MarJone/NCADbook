import { query } from '../config/database.js';

/**
 * Get all equipment
 * GET /api/equipment
 * Query params: department, category, status, search
 */
export const getAllEquipment = async (req, res) => {
  try {
    const { department, category, status, search, limit = 100, offset = 0 } = req.query;

    let queryText = `
      SELECT id, product_name, tracking_number, description, image_url,
             category, department, status, qr_code, created_at, updated_at
      FROM equipment
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    // Filter by department
    if (department) {
      queryText += ` AND department = $${paramCount}`;
      queryParams.push(department);
      paramCount++;
    }

    // Filter by category
    if (category) {
      queryText += ` AND category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    // Filter by status
    if (status) {
      queryText += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    // Search by product name or description
    if (search) {
      queryText += ` AND (product_name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Hide tracking_number from students
    if (req.user && req.user.role === 'student') {
      queryText = queryText.replace('tracking_number,', '');
    }

    queryText += ` ORDER BY product_name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM equipment WHERE 1=1';
    const countParams = [];
    let countParamIndex = 1;

    if (department) {
      countQuery += ` AND department = $${countParamIndex}`;
      countParams.push(department);
      countParamIndex++;
    }
    if (category) {
      countQuery += ` AND category = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }
    if (status) {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    if (search) {
      countQuery += ` AND (product_name ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      equipment: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < total
      }
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

/**
 * Get single equipment by ID
 * GET /api/equipment/:id
 */
export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    let queryText = `
      SELECT id, product_name, tracking_number, description, image_url,
             category, department, status, qr_code, created_at, updated_at
      FROM equipment
      WHERE id = $1
    `;

    // Hide tracking_number from students
    if (req.user && req.user.role === 'student') {
      queryText = queryText.replace('tracking_number,', '');
    }

    const result = await query(queryText, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Get equipment notes (admin only)
    let notes = [];
    if (req.user && ['staff', 'department_admin', 'master_admin'].includes(req.user.role)) {
      const notesResult = await query(`
        SELECT en.id, en.note_type, en.note_content, en.created_at, en.updated_at,
               u.full_name as created_by_name
        FROM equipment_notes en
        JOIN users u ON en.created_by = u.id
        WHERE en.equipment_id = $1
        ORDER BY en.created_at DESC
      `, [id]);
      notes = notesResult.rows;
    }

    res.json({
      equipment: result.rows[0],
      notes
    });
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

/**
 * Create new equipment (Admin only)
 * POST /api/equipment
 */
export const createEquipment = async (req, res) => {
  try {
    const {
      product_name,
      tracking_number,
      description,
      image_url,
      category,
      department,
      status = 'available',
      qr_code
    } = req.body;

    // Validate required fields
    if (!product_name || !tracking_number || !category || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if tracking number already exists
    const existing = await query(
      'SELECT id FROM equipment WHERE tracking_number = $1',
      [tracking_number]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Tracking number already exists' });
    }

    // Create equipment
    const result = await query(`
      INSERT INTO equipment (
        product_name, tracking_number, description, image_url,
        category, department, status, qr_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      product_name,
      tracking_number,
      description,
      image_url,
      category,
      department,
      status,
      qr_code
    ]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'create',
      'equipment',
      result.rows[0].id,
      JSON.stringify({ product_name, tracking_number, department })
    ]);

    res.status(201).json({
      message: 'Equipment created successfully',
      equipment: result.rows[0]
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Failed to create equipment' });
  }
};

/**
 * Update equipment (Admin only)
 * PUT /api/equipment/:id
 */
export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_name,
      tracking_number,
      description,
      image_url,
      category,
      department,
      status,
      qr_code
    } = req.body;

    // Check if equipment exists
    const existing = await query('SELECT * FROM equipment WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // If updating tracking number, check for duplicates
    if (tracking_number && tracking_number !== existing.rows[0].tracking_number) {
      const duplicate = await query(
        'SELECT id FROM equipment WHERE tracking_number = $1 AND id != $2',
        [tracking_number, id]
      );
      if (duplicate.rows.length > 0) {
        return res.status(409).json({ error: 'Tracking number already exists' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (product_name !== undefined) {
      updates.push(`product_name = $${paramCount}`);
      values.push(product_name);
      paramCount++;
    }
    if (tracking_number !== undefined) {
      updates.push(`tracking_number = $${paramCount}`);
      values.push(tracking_number);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount}`);
      values.push(image_url);
      paramCount++;
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount}`);
      values.push(category);
      paramCount++;
    }
    if (department !== undefined) {
      updates.push(`department = $${paramCount}`);
      values.push(department);
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }
    if (qr_code !== undefined) {
      updates.push(`qr_code = $${paramCount}`);
      values.push(qr_code);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    const result = await query(`
      UPDATE equipment
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'update',
      'equipment',
      id,
      JSON.stringify({ changes: req.body })
    ]);

    res.json({
      message: 'Equipment updated successfully',
      equipment: result.rows[0]
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
};

/**
 * Delete equipment (Master Admin only)
 * DELETE /api/equipment/:id
 */
export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if equipment exists
    const existing = await query('SELECT * FROM equipment WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Check if equipment has active bookings
    const activeBookings = await query(`
      SELECT COUNT(*) FROM bookings
      WHERE equipment_id = $1
      AND status IN ('pending', 'approved')
      AND end_date >= CURRENT_DATE
    `, [id]);

    if (parseInt(activeBookings.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete equipment with active bookings'
      });
    }

    // Log admin action before deletion
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'delete',
      'equipment',
      id,
      JSON.stringify({ equipment: existing.rows[0] })
    ]);

    // Delete equipment (cascade will delete notes)
    await query('DELETE FROM equipment WHERE id = $1', [id]);

    res.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
};

/**
 * Get equipment availability
 * GET /api/equipment/:id/availability
 */
export const getEquipmentAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'start_date and end_date required' });
    }

    // Get bookings for this equipment in the date range
    const result = await query(`
      SELECT b.id, b.start_date, b.end_date, b.status,
             u.full_name as booked_by
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.equipment_id = $1
      AND b.status IN ('pending', 'approved')
      AND b.start_date <= $3
      AND b.end_date >= $2
      ORDER BY b.start_date
    `, [id, start_date, end_date]);

    res.json({
      equipment_id: parseInt(id),
      date_range: { start_date, end_date },
      bookings: result.rows,
      available: result.rows.length === 0
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};

/**
 * Get equipment notes
 * GET /api/equipment/:id/notes
 */
export const getEquipmentNotes = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admins can view notes
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(`
      SELECT en.id, en.note_type, en.note_content, en.created_at, en.updated_at,
             u.full_name as created_by_name, en.created_by
      FROM equipment_notes en
      JOIN users u ON en.created_by = u.id
      WHERE en.equipment_id = $1
      ORDER BY en.created_at DESC
    `, [id]);

    res.json({ notes: result.rows });
  } catch (error) {
    console.error('Get equipment notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

/**
 * Add equipment note
 * POST /api/equipment/:id/notes
 */
export const addEquipmentNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note_type, note_content } = req.body;

    // Only admins can add notes
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate
    if (!note_type || !note_content || !note_content.trim()) {
      return res.status(400).json({ error: 'note_type and note_content required' });
    }

    // Valid note types
    const validTypes = ['maintenance', 'damage', 'usage', 'general'];
    if (!validTypes.includes(note_type)) {
      return res.status(400).json({ error: 'Invalid note_type. Must be: maintenance, damage, usage, or general' });
    }

    // Add note
    const result = await query(`
      INSERT INTO equipment_notes (equipment_id, note_type, note_content, created_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, equipment_id, note_type, note_content, created_by, created_at
    `, [id, note_type, note_content, req.user.id]);

    // Get creator name
    const noteWithCreator = {
      ...result.rows[0],
      created_by_name: req.user.full_name
    };

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'create',
      'equipment_note',
      result.rows[0].id,
      JSON.stringify({ equipment_id: id, note_type })
    ]);

    res.status(201).json({
      message: 'Note added successfully',
      note: noteWithCreator
    });
  } catch (error) {
    console.error('Add equipment note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

/**
 * Delete equipment note
 * DELETE /api/equipment/:id/notes/:noteId
 */
export const deleteEquipmentNote = async (req, res) => {
  try {
    const { id, noteId } = req.params;

    // Only admins can delete notes
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get note to verify it exists and belongs to this equipment
    const noteResult = await query(
      'SELECT * FROM equipment_notes WHERE id = $1 AND equipment_id = $2',
      [noteId, id]
    );

    if (noteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Delete note
    await query('DELETE FROM equipment_notes WHERE id = $1', [noteId]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'delete',
      'equipment_note',
      noteId,
      JSON.stringify({ equipment_id: id })
    ]);

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete equipment note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};
