import pool from '../db/index.js';

/**
 * Middleware to validate booking policies before creation
 * Checks weekly limits, concurrent limits, and training requirements
 */
export const validateBookingPolicies = async (req, res, next) => {
  try {
    const { userId, equipmentId, pickupDate, returnDate } = req.body;

    // Skip validation if no userId (shouldn't happen, but safety check)
    if (!userId || !equipmentId) {
      return next();
    }

    // Call database validation function
    const result = await pool.query(
      'SELECT * FROM validate_booking_policies($1, $2, $3, $4)',
      [userId, equipmentId, pickupDate, returnDate]
    );

    const validation = result.rows[0];

    // If validation fails, log violation and return error
    if (!validation.is_valid) {
      // Log the violation
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

      // Return user-friendly error
      return res.status(403).json({
        error: 'Policy Violation',
        message: validation.violation_message,
        details: validation.violation_details,
        type: validation.violation_type
      });
    }

    // Validation passed, continue to booking creation
    next();
  } catch (error) {
    console.error('Policy validation error:', error);
    // Log error but don't block booking (fail open for safety)
    next();
  }
};

/**
 * Middleware to check if user has outstanding fines that should block booking
 */
export const checkFineStatus = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return next();
    }

    // Check user's account hold status
    const result = await pool.query(
      'SELECT account_hold, hold_reason, total_fines_owed FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (user && user.account_hold) {
      return res.status(403).json({
        error: 'Account Hold',
        message: user.hold_reason || 'Your account has a hold. Please resolve outstanding issues.',
        finesOwed: user.total_fines_owed
      });
    }

    next();
  } catch (error) {
    console.error('Fine status check error:', error);
    // Fail open for safety
    next();
  }
};

/**
 * Middleware to get policy status for user (non-blocking, adds info to request)
 */
export const getPolicyStatus = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId || req.query.userId;

    if (!userId) {
      return next();
    }

    // Get weekly limit status
    const weeklyResult = await pool.query(
      'SELECT * FROM check_weekly_limit($1, NULL, NULL)',
      [userId]
    );

    // Get concurrent limit status
    const concurrentResult = await pool.query(
      'SELECT * FROM check_concurrent_limit($1, NULL, NULL)',
      [userId]
    );

    // Attach policy status to request
    req.policyStatus = {
      weekly: weeklyResult.rows[0],
      concurrent: concurrentResult.rows[0]
    };

    next();
  } catch (error) {
    console.error('Policy status error:', error);
    // Don't block request if policy status fails
    next();
  }
};

/**
 * Admin override middleware - allows admins to bypass policy checks
 */
export const allowAdminOverride = (req, res, next) => {
  const { adminOverride, adminId, overrideReason } = req.body;

  if (adminOverride && adminId) {
    // Validate admin has permission (you may want to check role here)
    req.skipPolicyValidation = true;
    req.overrideDetails = {
      adminId,
      reason: overrideReason || 'Admin override'
    };
  }

  next();
};

export default {
  validateBookingPolicies,
  checkFineStatus,
  getPolicyStatus,
  allowAdminOverride
};
