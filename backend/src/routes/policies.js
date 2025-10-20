import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// ============================================================================
// POLICY RULES MANAGEMENT (Admin Only)
// ============================================================================

// Get all policy rules
router.get('/rules', async (req, res) => {
  try {
    const { rule_type, is_active, applies_to_role } = req.query;

    let query = 'SELECT * FROM policy_rules WHERE 1=1';
    const params = [];

    if (rule_type) {
      params.push(rule_type);
      query += ` AND rule_type = $${params.length}`;
    }

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      query += ` AND is_active = $${params.length}`;
    }

    if (applies_to_role) {
      params.push(applies_to_role);
      query += ` AND (applies_to_role = $${params.length} OR applies_to_role IS NULL)`;
    }

    query += ' ORDER BY priority ASC, rule_type, id DESC';

    const result = await pool.query(query, params);
    res.json({ rules: result.rows });
  } catch (error) {
    console.error('Error fetching policy rules:', error);
    res.status(500).json({ error: 'Failed to fetch policy rules' });
  }
});

// Get single policy rule by ID
router.get('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM policy_rules WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy rule not found' });
    }

    res.json({ rule: result.rows[0] });
  } catch (error) {
    console.error('Error fetching policy rule:', error);
    res.status(500).json({ error: 'Failed to fetch policy rule' });
  }
});

// Create new policy rule (Admin only)
router.post('/rules', async (req, res) => {
  try {
    const {
      rule_type,
      rule_name,
      description,
      applies_to_role,
      applies_to_department,
      applies_to_equipment_category,
      applies_to_equipment_id,
      rule_config,
      is_active = true,
      priority = 100,
      exempted_users = [],
      created_by
    } = req.body;

    // Validate required fields
    if (!rule_type || !rule_name || !rule_config) {
      return res.status(400).json({
        error: 'Missing required fields: rule_type, rule_name, rule_config'
      });
    }

    // Validate rule_type
    const validRuleTypes = ['weekly_limit', 'concurrent_limit', 'training_required', 'blackout_period'];
    if (!validRuleTypes.includes(rule_type)) {
      return res.status(400).json({
        error: `Invalid rule_type. Must be one of: ${validRuleTypes.join(', ')}`
      });
    }

    const result = await pool.query(
      `INSERT INTO policy_rules (
        rule_type, rule_name, description,
        applies_to_role, applies_to_department,
        applies_to_equipment_category, applies_to_equipment_id,
        rule_config, is_active, priority, exempted_users, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        rule_type, rule_name, description,
        applies_to_role, applies_to_department,
        applies_to_equipment_category, applies_to_equipment_id,
        JSON.stringify(rule_config), is_active, priority, exempted_users, created_by
      ]
    );

    res.status(201).json({ rule: result.rows[0] });
  } catch (error) {
    if (error.constraint === 'unique_rule') {
      return res.status(409).json({
        error: 'A rule with this type and name already exists'
      });
    }
    console.error('Error creating policy rule:', error);
    res.status(500).json({ error: 'Failed to create policy rule' });
  }
});

// Update policy rule
router.patch('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rule_name,
      description,
      applies_to_role,
      applies_to_department,
      applies_to_equipment_category,
      applies_to_equipment_id,
      rule_config,
      is_active,
      priority,
      exempted_users
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (rule_name !== undefined) {
      params.push(rule_name);
      updates.push(`rule_name = $${paramCount++}`);
    }
    if (description !== undefined) {
      params.push(description);
      updates.push(`description = $${paramCount++}`);
    }
    if (applies_to_role !== undefined) {
      params.push(applies_to_role);
      updates.push(`applies_to_role = $${paramCount++}`);
    }
    if (applies_to_department !== undefined) {
      params.push(applies_to_department);
      updates.push(`applies_to_department = $${paramCount++}`);
    }
    if (applies_to_equipment_category !== undefined) {
      params.push(applies_to_equipment_category);
      updates.push(`applies_to_equipment_category = $${paramCount++}`);
    }
    if (applies_to_equipment_id !== undefined) {
      params.push(applies_to_equipment_id);
      updates.push(`applies_to_equipment_id = $${paramCount++}`);
    }
    if (rule_config !== undefined) {
      params.push(JSON.stringify(rule_config));
      updates.push(`rule_config = $${paramCount++}`);
    }
    if (is_active !== undefined) {
      params.push(is_active);
      updates.push(`is_active = $${paramCount++}`);
    }
    if (priority !== undefined) {
      params.push(priority);
      updates.push(`priority = $${paramCount++}`);
    }
    if (exempted_users !== undefined) {
      params.push(exempted_users);
      updates.push(`exempted_users = $${paramCount++}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const query = `
      UPDATE policy_rules
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy rule not found' });
    }

    res.json({ rule: result.rows[0] });
  } catch (error) {
    console.error('Error updating policy rule:', error);
    res.status(500).json({ error: 'Failed to update policy rule' });
  }
});

// Delete policy rule
router.delete('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM policy_rules WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy rule not found' });
    }

    res.json({ message: 'Policy rule deleted successfully', rule: result.rows[0] });
  } catch (error) {
    console.error('Error deleting policy rule:', error);
    res.status(500).json({ error: 'Failed to delete policy rule' });
  }
});

// ============================================================================
// POLICY VALIDATION ENDPOINTS
// ============================================================================

// Validate booking against all policies
router.post('/validate-booking', async (req, res) => {
  try {
    const { userId, equipmentId, pickupDate, returnDate } = req.body;

    if (!userId || !equipmentId || !pickupDate || !returnDate) {
      return res.status(400).json({
        error: 'Missing required fields: userId, equipmentId, pickupDate, returnDate'
      });
    }

    const result = await pool.query(
      'SELECT * FROM validate_booking_policies($1, $2, $3, $4)',
      [userId, equipmentId, pickupDate, returnDate]
    );

    const validation = result.rows[0];

    if (!validation.is_valid) {
      // Log violation
      await pool.query(
        `INSERT INTO policy_violations (
          user_id, violation_type, violation_details,
          attempted_booking_details, blocked
        ) VALUES ($1, $2, $3, $4, TRUE)`,
        [
          userId,
          validation.violation_type,
          validation.violation_details,
          JSON.stringify({ equipmentId, pickupDate, returnDate })
        ]
      );
    }

    res.json({
      valid: validation.is_valid,
      violation: validation.is_valid ? null : {
        type: validation.violation_type,
        message: validation.violation_message,
        details: validation.violation_details
      }
    });
  } catch (error) {
    console.error('Error validating booking:', error);
    res.status(500).json({ error: 'Failed to validate booking' });
  }
});

// Check weekly limit for user
router.get('/check-weekly-limit/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { equipmentId, category } = req.query;

    const result = await pool.query(
      'SELECT * FROM check_weekly_limit($1, $2, $3)',
      [userId, equipmentId || null, category || null]
    );

    const check = result.rows[0];

    res.json({
      allowed: check.allowed,
      currentCount: check.current_count,
      limitCount: check.limit_count,
      ruleName: check.rule_name,
      remaining: check.limit_count - check.current_count
    });
  } catch (error) {
    console.error('Error checking weekly limit:', error);
    res.status(500).json({ error: 'Failed to check weekly limit' });
  }
});

// Check concurrent limit for user
router.get('/check-concurrent-limit/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { equipmentId, category } = req.query;

    const result = await pool.query(
      'SELECT * FROM check_concurrent_limit($1, $2, $3)',
      [userId, equipmentId || null, category || null]
    );

    const check = result.rows[0];

    res.json({
      allowed: check.allowed,
      currentCount: check.current_count,
      limitCount: check.limit_count,
      ruleName: check.rule_name,
      remaining: check.limit_count - check.current_count
    });
  } catch (error) {
    console.error('Error checking concurrent limit:', error);
    res.status(500).json({ error: 'Failed to check concurrent limit' });
  }
});

// Check training requirement for user
router.get('/check-training/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { equipmentId, category } = req.query;

    const result = await pool.query(
      'SELECT * FROM check_training_requirement($1, $2, $3)',
      [userId, equipmentId || null, category || null]
    );

    const check = result.rows[0];

    res.json({
      allowed: check.allowed,
      requiredTrainingId: check.required_training_id,
      requiredTrainingName: check.required_training_name,
      hasTraining: check.has_training,
      trainingExpired: check.training_expired
    });
  } catch (error) {
    console.error('Error checking training requirement:', error);
    res.status(500).json({ error: 'Failed to check training requirement' });
  }
});

// ============================================================================
// TRAINING RECORDS MANAGEMENT
// ============================================================================

// Get all training records for a user
router.get('/training/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT tr.*,
              CASE
                WHEN tr.expires_at IS NULL THEN 'never_expires'
                WHEN tr.expires_at > CURRENT_TIMESTAMP THEN 'valid'
                ELSE 'expired'
              END as status
       FROM training_records tr
       WHERE tr.user_id = $1
       ORDER BY tr.completed_at DESC`,
      [userId]
    );

    res.json({ trainings: result.rows });
  } catch (error) {
    console.error('Error fetching training records:', error);
    res.status(500).json({ error: 'Failed to fetch training records' });
  }
});

// Get all training records (Admin only)
router.get('/training', async (req, res) => {
  try {
    const { training_id, status } = req.query;

    let query = `
      SELECT tr.*,
             u.full_name as user_name,
             u.email as user_email,
             u.department,
             CASE
               WHEN tr.expires_at IS NULL THEN 'never_expires'
               WHEN tr.expires_at > CURRENT_TIMESTAMP THEN 'valid'
               ELSE 'expired'
             END as status
      FROM training_records tr
      LEFT JOIN users u ON tr.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (training_id) {
      params.push(training_id);
      query += ` AND tr.training_id = $${params.length}`;
    }

    if (status) {
      if (status === 'valid') {
        query += ` AND (tr.expires_at IS NULL OR tr.expires_at > CURRENT_TIMESTAMP)`;
      } else if (status === 'expired') {
        query += ` AND tr.expires_at < CURRENT_TIMESTAMP`;
      } else if (status === 'never_expires') {
        query += ` AND tr.expires_at IS NULL`;
      }
    }

    query += ' ORDER BY tr.completed_at DESC';

    const result = await pool.query(query, params);
    res.json({ trainings: result.rows });
  } catch (error) {
    console.error('Error fetching all training records:', error);
    res.status(500).json({ error: 'Failed to fetch training records' });
  }
});

// Add training record (Admin only)
router.post('/training', async (req, res) => {
  try {
    const {
      userId,
      trainingId,
      trainingName,
      completedAt,
      expiresAt,
      certificateUrl,
      verifiedBy,
      notes
    } = req.body;

    if (!userId || !trainingId || !trainingName) {
      return res.status(400).json({
        error: 'Missing required fields: userId, trainingId, trainingName'
      });
    }

    const result = await pool.query(
      `INSERT INTO training_records (
        user_id, training_id, training_name,
        completed_at, expires_at, certificate_url,
        verified_by, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id, training_id)
      DO UPDATE SET
        training_name = EXCLUDED.training_name,
        completed_at = EXCLUDED.completed_at,
        expires_at = EXCLUDED.expires_at,
        certificate_url = EXCLUDED.certificate_url,
        verified_by = EXCLUDED.verified_by,
        notes = EXCLUDED.notes
      RETURNING *`,
      [
        userId, trainingId, trainingName,
        completedAt || new Date(), expiresAt, certificateUrl,
        verifiedBy, notes
      ]
    );

    res.status(201).json({ training: result.rows[0] });
  } catch (error) {
    console.error('Error adding training record:', error);
    res.status(500).json({ error: 'Failed to add training record' });
  }
});

// Delete training record
router.delete('/training/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM training_records WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training record not found' });
    }

    res.json({ message: 'Training record deleted successfully', training: result.rows[0] });
  } catch (error) {
    console.error('Error deleting training record:', error);
    res.status(500).json({ error: 'Failed to delete training record' });
  }
});

// ============================================================================
// POLICY VIOLATIONS LOG
// ============================================================================

// Get policy violations for user
router.get('/violations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT pv.*,
              pr.rule_name,
              pr.rule_type
       FROM policy_violations pv
       LEFT JOIN policy_rules pr ON pv.policy_rule_id = pr.id
       WHERE pv.user_id = $1
       ORDER BY pv.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ violations: result.rows });
  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
});

// Get all policy violations (Admin only)
router.get('/violations', async (req, res) => {
  try {
    const { blocked, violation_type, limit = 100 } = req.query;

    let query = `
      SELECT pv.*,
             u.full_name as user_name,
             u.email as user_email,
             pr.rule_name,
             pr.rule_type
      FROM policy_violations pv
      LEFT JOIN users u ON pv.user_id = u.id
      LEFT JOIN policy_rules pr ON pv.policy_rule_id = pr.id
      WHERE 1=1
    `;
    const params = [];

    if (blocked !== undefined) {
      params.push(blocked === 'true');
      query += ` AND pv.blocked = $${params.length}`;
    }

    if (violation_type) {
      params.push(violation_type);
      query += ` AND pv.violation_type = $${params.length}`;
    }

    query += ` ORDER BY pv.created_at DESC LIMIT ${parseInt(limit)}`;

    const result = await pool.query(query, params);
    res.json({ violations: result.rows });
  } catch (error) {
    console.error('Error fetching all violations:', error);
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
});

// Override policy violation (Admin only)
router.patch('/violations/:id/override', async (req, res) => {
  try {
    const { id } = req.params;
    const { overrideBy, overrideReason } = req.body;

    if (!overrideBy || !overrideReason) {
      return res.status(400).json({
        error: 'Missing required fields: overrideBy, overrideReason'
      });
    }

    const result = await pool.query(
      `UPDATE policy_violations
       SET blocked = FALSE,
           override_by = $1,
           override_reason = $2
       WHERE id = $3
       RETURNING *`,
      [overrideBy, overrideReason, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Violation not found' });
    }

    res.json({ violation: result.rows[0] });
  } catch (error) {
    console.error('Error overriding violation:', error);
    res.status(500).json({ error: 'Failed to override violation' });
  }
});

export default router;
