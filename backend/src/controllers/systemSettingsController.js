import { query } from '../config/database.js';

/**
 * Get all system settings
 * GET /api/settings
 */
export const getAllSettings = async (req, res) => {
  try {
    const result = await query(`
      SELECT key, value, description, modified_by, modified_at
      FROM system_settings
      ORDER BY key ASC
    `);

    res.json({ settings: result.rows });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
};

/**
 * Get single setting by key
 * GET /api/settings/:key
 */
export const getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const result = await query(
      'SELECT key, value, description, modified_by, modified_at FROM system_settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ setting: result.rows[0] });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
};

/**
 * Update system setting
 * PUT /api/settings/:key
 */
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    // Validate boolean value
    if (typeof value !== 'boolean') {
      return res.status(400).json({ error: 'Value must be a boolean' });
    }

    // Check if setting exists
    const existing = await query('SELECT key FROM system_settings WHERE key = $1', [key]);

    if (existing.rows.length === 0) {
      // Create new setting
      const result = await query(`
        INSERT INTO system_settings (key, value, description, modified_by, modified_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING key, value, description, modified_by, modified_at
      `, [key, value, description || null, req.user.id]);

      const setting = result.rows[0];

      // Log admin action
      await query(`
        INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        req.user.id,
        'create',
        'system_setting',
        key,
        JSON.stringify({ value, description })
      ]);

      return res.status(201).json({ setting, message: 'Setting created successfully' });
    }

    // Update existing setting
    const updates = ['value = $1', 'modified_by = $2', 'modified_at = CURRENT_TIMESTAMP'];
    const params = [value, req.user.id];
    let paramCount = 3;

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    params.push(key);

    const result = await query(`
      UPDATE system_settings
      SET ${updates.join(', ')}
      WHERE key = $${paramCount}
      RETURNING key, value, description, modified_by, modified_at
    `, params);

    const setting = result.rows[0];

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'update',
      'system_setting',
      key,
      JSON.stringify({ value, description })
    ]);

    res.json({ setting, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

/**
 * Delete system setting
 * DELETE /api/settings/:key
 */
export const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const existing = await query('SELECT key FROM system_settings WHERE key = $1', [key]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    await query('DELETE FROM system_settings WHERE key = $1', [key]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'delete',
      'system_setting',
      key,
      JSON.stringify({ key })
    ]);

    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ error: 'Failed to delete setting' });
  }
};
