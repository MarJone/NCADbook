import { query } from '../config/database.js';

/**
 * Get all bookings with optional filters
 * GET /api/bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const { user_id, equipment_id, status, department, start_date, end_date, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT
        b.id, b.user_id, b.equipment_id, b.start_date, b.end_date,
        b.status, b.purpose, b.created_at,
        u.full_name as user_name, u.email as user_email, u.department as user_department,
        e.product_name as equipment_name, e.category as equipment_category,
        e.department as equipment_department, e.tracking_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Apply filters based on user role
    if (req.user.role === 'student') {
      // Students only see their own bookings
      queryText += ` AND b.user_id = $${paramCount}`;
      params.push(req.user.id);
      paramCount++;
    } else if (req.user.role === 'staff' || req.user.role === 'department_admin') {
      // Staff/Dept Admins see bookings for their department's equipment
      if (!department) {
        queryText += ` AND e.department = $${paramCount}`;
        params.push(req.user.department);
        paramCount++;
      }
    }
    // Master admins see all bookings (no filter needed)

    // Additional filters
    if (user_id) {
      queryText += ` AND b.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    if (equipment_id) {
      queryText += ` AND b.equipment_id = $${paramCount}`;
      params.push(equipment_id);
      paramCount++;
    }

    if (status) {
      queryText += ` AND b.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (department) {
      queryText += ` AND e.department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    if (start_date) {
      queryText += ` AND b.start_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      queryText += ` AND b.end_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    // Add ordering and pagination
    queryText += ` ORDER BY b.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1
    `;
    const countParams = [];
    let countParamCount = 1;

    if (req.user.role === 'student') {
      countQuery += ` AND b.user_id = $${countParamCount}`;
      countParams.push(req.user.id);
      countParamCount++;
    } else if (req.user.role === 'staff' || req.user.role === 'department_admin') {
      if (!department) {
        countQuery += ` AND e.department = $${countParamCount}`;
        countParams.push(req.user.department);
        countParamCount++;
      }
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Hide tracking_number from students
    const bookings = result.rows.map(booking => {
      if (req.user.role === 'student') {
        delete booking.tracking_number;
      }
      return booking;
    });

    res.json({
      bookings,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

/**
 * Get single booking by ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT
        b.id, b.user_id, b.equipment_id, b.start_date, b.end_date,
        b.status, b.purpose, b.created_at,
        u.full_name as user_name, u.email as user_email, u.department as user_department,
        e.product_name as equipment_name, e.category as equipment_category,
        e.department as equipment_department, e.tracking_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Check permissions
    if (req.user.role === 'student' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if ((req.user.role === 'staff' || req.user.role === 'department_admin') &&
        booking.equipment_department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Hide tracking_number from students
    if (req.user.role === 'student') {
      delete booking.tracking_number;
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

/**
 * Create new booking
 * POST /api/bookings
 */
export const createBooking = async (req, res) => {
  try {
    const { equipment_id, start_date, end_date, purpose } = req.body;

    // Validate required fields
    if (!equipment_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(start_date);
    const end = new Date(end_date);
    const now = new Date();

    if (start < now) {
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }

    if (end < start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    // Check if equipment exists and is available
    const equipmentResult = await query(
      'SELECT id, product_name, status, department FROM equipment WHERE id = $1',
      [equipment_id]
    );

    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const equipment = equipmentResult.rows[0];

    if (equipment.status !== 'available') {
      return res.status(400).json({ error: 'Equipment is not available' });
    }

    // Check for booking conflicts
    const conflictResult = await query(`
      SELECT id FROM bookings
      WHERE equipment_id = $1
        AND status IN ('pending', 'approved')
        AND (
          (start_date <= $2 AND end_date >= $2) OR
          (start_date <= $3 AND end_date >= $3) OR
          (start_date >= $2 AND end_date <= $3)
        )
    `, [equipment_id, start_date, end_date]);

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({ error: 'Equipment is already booked for this time period' });
    }

    // Create booking
    const result = await query(`
      INSERT INTO bookings (
        user_id, equipment_id, start_date, end_date,
        status, purpose
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, equipment_id, start_date, end_date, status, purpose, created_at
    `, [
      req.user.id,
      equipment_id,
      start_date,
      end_date,
      'pending',
      purpose || null
    ]);

    const booking = result.rows[0];

    // Log admin action if done by admin
    if (req.user.role !== 'student') {
      await query(`
        INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        req.user.id,
        'create',
        'booking',
        booking.id,
        JSON.stringify({ equipment_id, start_date, end_date })
      ]);
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        ...booking,
        equipment_name: equipment.product_name
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

/**
 * Approve booking (Admin only)
 * PUT /api/bookings/:id/approve
 */
export const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admins can approve
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get booking details
    const bookingResult = await query(`
      SELECT b.*, e.department as equipment_department
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = $1
    `, [id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check if dept admin has permission for this equipment
    if (req.user.role === 'department_admin' && booking.equipment_department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not pending' });
    }

    // Approve booking
    const result = await query(`
      UPDATE bookings
      SET status = 'approved'
      WHERE id = $1
      RETURNING *
    `, [id]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'approve',
      'booking',
      id,
      JSON.stringify({ previous_status: 'pending' })
    ]);

    res.json({
      message: 'Booking approved successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ error: 'Failed to approve booking' });
  }
};

/**
 * Deny booking (Admin only)
 * PUT /api/bookings/:id/deny
 */
export const denyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Only admins can deny
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get booking details
    const bookingResult = await query(`
      SELECT b.*, e.department as equipment_department
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = $1
    `, [id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check if dept admin has permission for this equipment
    if (req.user.role === 'department_admin' && booking.equipment_department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not pending' });
    }

    // Deny booking
    const result = await query(`
      UPDATE bookings
      SET status = 'denied'
      WHERE id = $1
      RETURNING *
    `, [id]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'deny',
      'booking',
      id,
      JSON.stringify({ reason, previous_status: 'pending' })
    ]);

    res.json({
      message: 'Booking denied',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Deny booking error:', error);
    res.status(500).json({ error: 'Failed to deny booking' });
  }
};

/**
 * Mark booking as returned (Admin only)
 * PUT /api/bookings/:id/return
 */
export const returnBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Only admins can mark as returned
    if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get booking details
    const bookingResult = await query(`
      SELECT b.*, e.department as equipment_department
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = $1
    `, [id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check if dept admin has permission for this equipment
    if (req.user.role === 'department_admin' && booking.equipment_department !== req.user.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved bookings can be returned' });
    }

    // Mark as completed
    const result = await query(`
      UPDATE bookings
      SET status = 'completed'
      WHERE id = $1
      RETURNING *
    `, [id]);

    // Log admin action
    await query(`
      INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      req.user.id,
      'return',
      'booking',
      id,
      JSON.stringify({ previous_status: 'approved' })
    ]);

    res.json({
      message: 'Booking marked as completed',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Return booking error:', error);
    res.status(500).json({ error: 'Failed to mark booking as returned' });
  }
};

/**
 * Delete booking (Admin only or own pending bookings for students)
 * DELETE /api/bookings/:id
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Get booking details
    const bookingResult = await query(`
      SELECT b.*, e.department as equipment_department
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.id = $1
    `, [id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Check permissions
    if (req.user.role === 'student') {
      // Students can only delete their own pending bookings
      if (booking.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (booking.status !== 'pending') {
        return res.status(403).json({ error: 'Can only delete pending bookings' });
      }
    } else if (req.user.role === 'department_admin') {
      // Dept admins can only delete bookings for their department's equipment
      if (booking.equipment_department !== req.user.department) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    // Master admins can delete any booking

    // Delete booking
    await query('DELETE FROM bookings WHERE id = $1', [id]);

    // Log admin action
    if (req.user.role !== 'student') {
      await query(`
        INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        req.user.id,
        'delete',
        'booking',
        id,
        JSON.stringify({ status: booking.status })
      ]);
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};
