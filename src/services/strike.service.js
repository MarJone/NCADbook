import { demoMode } from '../mocks/demo-mode.js';

/**
 * Strike Service - Demo Mode Implementation
 * Manages student strike system using local data
 */

console.log('🎭 Strike Service - Running in Demo Mode');

/**
 * Check if student can make a booking
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} { canBook: boolean, reason: string, strikeCount: number }
 */
export async function canStudentBook(studentId) {
  try {
    const user = await demoMode.findOne('users', { id: studentId });

    if (!user) {
      return {
        canBook: false,
        reason: 'User not found',
        strikeCount: 0,
        blacklistUntil: null
      };
    }

    const strikeCount = user.strike_count || 0;
    const blacklistUntil = user.blacklist_until;

    // Check if blacklisted
    if (blacklistUntil && new Date(blacklistUntil) > new Date()) {
      return {
        canBook: false,
        reason: `Blacklisted until ${new Date(blacklistUntil).toLocaleDateString()}`,
        strikeCount,
        blacklistUntil
      };
    }

    return {
      canBook: strikeCount < 3,
      reason: strikeCount >= 3 ? 'Maximum strikes reached' : 'Eligible to book',
      strikeCount,
      blacklistUntil
    };
  } catch (error) {
    console.error('Error checking booking eligibility:', error);
    throw error;
  }
}

/**
 * Get student's current strike status
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Strike status with count and history
 */
export async function getStrikeStatus(studentId) {
  try {
    const user = await demoMode.findOne('users', { id: studentId });

    if (!user) {
      throw new Error('User not found');
    }

    const history = await demoMode.query('strike_history', {
      student_id: studentId,
      revoked_at: null
    });

    return {
      strikeCount: user.strike_count || 0,
      blacklistUntil: user.blacklist_until || null,
      history: history || [],
      isRestricted: user.blacklist_until && new Date(user.blacklist_until) > new Date()
    };
  } catch (error) {
    console.error('Error getting strike status:', error);
    throw error;
  }
}

/**
 * Manually issue a strike (admin only)
 * @param {string} studentId - Student ID
 * @param {string} bookingId - Booking ID
 * @param {number} daysOverdue - Number of days overdue
 * @param {string} adminId - Admin ID
 * @returns {Promise<Object>} Result of strike increment
 */
export async function issueStrike(studentId, bookingId, daysOverdue, adminId) {
  try {
    const user = await demoMode.findOne('users', { id: studentId });

    if (!user) {
      throw new Error('User not found');
    }

    const newStrikeCount = (user.strike_count || 0) + 1;

    // Update user's strike count
    await demoMode.update('users', { id: studentId }, {
      strike_count: newStrikeCount,
      blacklist_until: newStrikeCount >= 3 ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null
    });

    // Add strike history record
    await demoMode.insert('strike_history', {
      id: `strike-${Date.now()}`,
      student_id: studentId,
      booking_id: bookingId,
      days_overdue: daysOverdue,
      issued_by: adminId,
      created_at: new Date().toISOString(),
      revoked_at: null
    });

    return {
      success: true,
      strikeCount: newStrikeCount,
      blacklisted: newStrikeCount >= 3
    };
  } catch (error) {
    console.error('Error issuing strike:', error);
    throw error;
  }
}

/**
 * Revoke a strike (admin only)
 * @param {string} strikeId - Strike ID
 * @param {string} adminId - Admin ID
 * @param {string} reason - Reason for revocation
 * @returns {Promise<Object>} Result of revocation
 */
export async function revokeStrike(strikeId, adminId, reason) {
  try {
    const strike = await demoMode.findOne('strike_history', { id: strikeId });

    if (!strike) {
      throw new Error('Strike not found');
    }

    // Update strike record
    await demoMode.update('strike_history', { id: strikeId }, {
      revoked_at: new Date().toISOString(),
      revoked_by: adminId,
      revocation_reason: reason
    });

    // Decrement user's strike count
    const user = await demoMode.findOne('users', { id: strike.student_id });
    const newStrikeCount = Math.max(0, (user.strike_count || 0) - 1);

    await demoMode.update('users', { id: strike.student_id }, {
      strike_count: newStrikeCount,
      blacklist_until: newStrikeCount < 3 ? null : user.blacklist_until
    });

    return {
      success: true,
      strikeCount: newStrikeCount
    };
  } catch (error) {
    console.error('Error revoking strike:', error);
    throw error;
  }
}

/**
 * Reset all strikes (admin only - typically at start of semester)
 * @param {string} adminId - Admin ID
 * @param {string} reason - Reason for reset (e.g., "New semester")
 * @returns {Promise<Object>} Result with number of affected students
 */
export async function resetAllStrikes(adminId, reason) {
  try {
    const allUsers = await demoMode.query('users');
    let affectedCount = 0;

    for (const user of allUsers) {
      if (user.strike_count > 0) {
        await demoMode.update('users', { id: user.id }, {
          strike_count: 0,
          blacklist_until: null
        });
        affectedCount++;
      }
    }

    // Mark all strike history as revoked
    const allStrikes = await demoMode.query('strike_history', { revoked_at: null });
    for (const strike of allStrikes) {
      await demoMode.update('strike_history', { id: strike.id }, {
        revoked_at: new Date().toISOString(),
        revoked_by: adminId,
        revocation_reason: reason
      });
    }

    return {
      success: true,
      affected_students: affectedCount
    };
  } catch (error) {
    console.error('Error resetting strikes:', error);
    throw error;
  }
}

/**
 * Get notification data for email/notification
 * @param {string} studentId - Student ID
 * @returns {Promise<Object>} Formatted notification data
 */
export async function getStrikeNotificationData(studentId) {
  try {
    const status = await getStrikeStatus(studentId);
    const user = await demoMode.findOne('users', { id: studentId });

    return {
      student_name: user.full_name,
      student_email: user.email,
      strike_count: status.strikeCount,
      blacklist_until: status.blacklistUntil,
      is_blacklisted: status.isRestricted
    };
  } catch (error) {
    console.error('Error getting notification data:', error);
    throw error;
  }
}

/**
 * Get all students with strikes (admin view)
 * @returns {Promise<Array>} Array of students with strike information
 */
export async function getStudentsWithStrikes() {
  try {
    const allUsers = await demoMode.query('users');

    const studentsWithStrikes = allUsers
      .filter(user => user.role === 'student' && (user.strike_count || 0) > 0)
      .map(user => ({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        department: user.department,
        strike_count: user.strike_count || 0,
        blacklist_until: user.blacklist_until,
        is_restricted: user.blacklist_until && new Date(user.blacklist_until) > new Date()
      }))
      .sort((a, b) => b.strike_count - a.strike_count);

    return studentsWithStrikes;
  } catch (error) {
    console.error('Error getting students with strikes:', error);
    throw error;
  }
}

/**
 * Get strike history for a student
 * @param {string} studentId - Student ID
 * @param {boolean} includeRevoked - Include revoked strikes
 * @returns {Promise<Array>} Array of strike records
 */
export async function getStrikeHistory(studentId, includeRevoked = false) {
  try {
    let history = await demoMode.query('strike_history', { student_id: studentId });

    if (!includeRevoked) {
      history = history.filter(strike => !strike.revoked_at);
    }

    // Enrich with booking and user data
    const enrichedHistory = await Promise.all(
      history.map(async (strike) => {
        const booking = await demoMode.findOne('bookings', { id: strike.booking_id });
        const issuedBy = await demoMode.findOne('users', { id: strike.issued_by });
        const revokedBy = strike.revoked_by
          ? await demoMode.findOne('users', { id: strike.revoked_by })
          : null;

        return {
          ...strike,
          booking,
          issued_by_user: issuedBy ? { full_name: issuedBy.full_name } : null,
          revoked_by_user: revokedBy ? { full_name: revokedBy.full_name } : null
        };
      })
    );

    return enrichedHistory.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error getting strike history:', error);
    throw error;
  }
}

export default {
  canStudentBook,
  getStrikeStatus,
  issueStrike,
  revokeStrike,
  resetAllStrikes,
  getStrikeNotificationData,
  getStudentsWithStrikes,
  getStrikeHistory
};
