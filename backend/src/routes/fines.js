import express from 'express';
import pool from '../db/index.js';

const router = express.Router();

// Get all fines for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT f.*,
              b.equipment_id,
              e.product_name,
              u.full_name as user_name
       FROM fines f
       LEFT JOIN bookings b ON f.booking_id = b.id
       LEFT JOIN equipment e ON b.equipment_id = e.id
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({ fines: result.rows });
  } catch (error) {
    console.error('Error fetching fines:', error);
    res.status(500).json({ error: 'Failed to fetch fines' });
  }
});

// Get all fines (admin only)
router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query;

    let query = `
      SELECT f.*,
             b.equipment_id,
             e.product_name,
             u.full_name as user_name,
             u.email as user_email,
             u.department
      FROM fines f
      LEFT JOIN bookings b ON f.booking_id = b.id
      LEFT JOIN equipment e ON b.equipment_id = e.id
      LEFT JOIN users u ON f.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      params.push(status);
      query += ` AND f.status = $${params.length}`;
    }

    if (userId) {
      params.push(userId);
      query += ` AND f.user_id = $${params.length}`;
    }

    query += ' ORDER BY f.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ fines: result.rows });
  } catch (error) {
    console.error('Error fetching all fines:', error);
    res.status(500).json({ error: 'Failed to fetch fines' });
  }
});

// Create manual fine (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      bookingId,
      amount,
      fineType,
      description,
      daysLate,
      dailyRate
    } = req.body;

    const result = await pool.query(
      `INSERT INTO fines (
        user_id, booking_id, amount, fine_type, description,
        days_late, daily_rate, due_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP + INTERVAL '14 days', 'pending')
      RETURNING *`,
      [userId, bookingId, amount, fineType, description, daysLate || 0, dailyRate || 5.00]
    );

    res.status(201).json({ fine: result.rows[0] });
  } catch (error) {
    console.error('Error creating fine:', error);
    res.status(500).json({ error: 'Failed to create fine' });
  }
});

// Update fine status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod, waivedBy, waivedReason } = req.body;

    let query = 'UPDATE fines SET status = $1, updated_at = CURRENT_TIMESTAMP';
    const params = [status, id];
    let paramCount = 2;

    if (status === 'paid') {
      query += ', paid_at = CURRENT_TIMESTAMP';
      if (paymentMethod) {
        paramCount++;
        query += `, payment_method = $${paramCount}`;
        params.splice(paramCount - 1, 0, paymentMethod);
      }
    }

    if (status === 'waived') {
      if (waivedBy) {
        paramCount++;
        query += `, waived_by = $${paramCount}`;
        params.splice(paramCount - 1, 0, waivedBy);
      }
      if (waivedReason) {
        paramCount++;
        query += `, waived_reason = $${paramCount}`;
        params.splice(paramCount - 1, 0, waivedReason);
      }
    }

    query += ` WHERE id = $${paramCount + 1} RETURNING *`;
    params[paramCount] = id;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    res.json({ fine: result.rows[0] });
  } catch (error) {
    console.error('Error updating fine:', error);
    res.status(500).json({ error: 'Failed to update fine' });
  }
});

// Calculate late fine for booking
router.post('/calculate/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { dailyRate = 5.00 } = req.body;

    const result = await pool.query(
      'SELECT calculate_late_fine($1, $2) as fine_amount',
      [bookingId, dailyRate]
    );

    const fineAmount = parseFloat(result.rows[0].fine_amount);

    if (fineAmount > 0) {
      // Get the created fine
      const fineResult = await pool.query(
        'SELECT * FROM fines WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1',
        [bookingId]
      );

      res.json({
        message: 'Fine calculated successfully',
        fineAmount,
        fine: fineResult.rows[0]
      });
    } else {
      res.json({
        message: 'No fine applicable',
        fineAmount: 0
      });
    }
  } catch (error) {
    console.error('Error calculating fine:', error);
    res.status(500).json({ error: 'Failed to calculate fine' });
  }
});

// Get user's total fines
router.get('/user/:userId/total', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN status IN ('pending', 'overdue') THEN amount ELSE 0 END), 0) as total_owed,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status = 'waived' THEN amount ELSE 0 END), 0) as total_waived,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_count,
        u.account_hold,
        u.hold_reason
      FROM fines f
      RIGHT JOIN users u ON f.user_id = u.id
      WHERE u.id = $1
      GROUP BY u.id, u.account_hold, u.hold_reason`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user total fines:', error);
    res.status(500).json({ error: 'Failed to fetch fine totals' });
  }
});

// Mark overdue fines (scheduled job endpoint)
router.post('/mark-overdue', async (req, res) => {
  try {
    await pool.query('SELECT mark_overdue_fines()');
    res.json({ message: 'Overdue fines marked successfully' });
  } catch (error) {
    console.error('Error marking overdue fines:', error);
    res.status(500).json({ error: 'Failed to mark overdue fines' });
  }
});

export default router;
