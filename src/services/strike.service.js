import { supabase } from '../config/supabase';

/**
 * Strike Service - Manages student strike system
 */

/**
 * Check if student can make a booking
 * @param {string} studentId - Student UUID
 * @returns {Promise<Object>} { canBook: boolean, reason: string, strikeCount: number }
 */
export async function canStudentBook(studentId) {
  try {
    const { data, error } = await supabase.rpc('can_student_book', {
      p_student_id: studentId
    });

    if (error) throw error;

    return {
      canBook: data.can_book,
      reason: data.reason,
      strikeCount: data.strike_count,
      blacklistUntil: data.blacklist_until
    };
  } catch (error) {
    console.error('Error checking booking eligibility:', error);
    throw error;
  }
}

/**
 * Get student's current strike status
 * @param {string} studentId - Student UUID
 * @returns {Promise<Object>} Strike status with count and history
 */
export async function getStrikeStatus(studentId) {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('strike_count, blacklist_until')
      .eq('id', studentId)
      .single();

    if (userError) throw userError;

    const { data: historyData, error: historyError } = await supabase
      .from('strike_history')
      .select('*')
      .eq('student_id', studentId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });

    if (historyError) throw historyError;

    return {
      strikeCount: userData.strike_count,
      blacklistUntil: userData.blacklist_until,
      history: historyData || [],
      isRestricted: userData.blacklist_until && new Date(userData.blacklist_until) > new Date()
    };
  } catch (error) {
    console.error('Error getting strike status:', error);
    throw error;
  }
}

/**
 * Manually issue a strike (admin only)
 * @param {string} studentId - Student UUID
 * @param {string} bookingId - Booking UUID
 * @param {number} daysOverdue - Number of days overdue
 * @param {string} adminId - Admin UUID
 * @returns {Promise<Object>} Result of strike increment
 */
export async function issueStrike(studentId, bookingId, daysOverdue, adminId) {
  try {
    const { data, error } = await supabase.rpc('increment_student_strike', {
      p_student_id: studentId,
      p_booking_id: bookingId,
      p_days_overdue: daysOverdue,
      p_issued_by: adminId
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error issuing strike:', error);
    throw error;
  }
}

/**
 * Revoke a strike (admin only)
 * @param {string} strikeId - Strike UUID
 * @param {string} adminId - Admin UUID
 * @param {string} reason - Reason for revocation
 * @returns {Promise<Object>} Result of revocation
 */
export async function revokeStrike(strikeId, adminId, reason) {
  try {
    const { data, error } = await supabase.rpc('revoke_strike', {
      p_strike_id: strikeId,
      p_admin_id: adminId,
      p_reason: reason
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error revoking strike:', error);
    throw error;
  }
}

/**
 * Reset all strikes (admin only - typically at start of semester)
 * @param {string} adminId - Admin UUID
 * @param {string} reason - Reason for reset (e.g., "New semester")
 * @returns {Promise<Object>} Result with number of affected students
 */
export async function resetAllStrikes(adminId, reason) {
  try {
    const { data, error } = await supabase.rpc('reset_all_strikes', {
      p_admin_id: adminId,
      p_reason: reason
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error resetting strikes:', error);
    throw error;
  }
}

/**
 * Get notification data for email/notification
 * @param {string} studentId - Student UUID
 * @returns {Promise<Object>} Formatted notification data
 */
export async function getStrikeNotificationData(studentId) {
  try {
    const { data, error } = await supabase.rpc('get_strike_notification_data', {
      p_student_id: studentId
    });

    if (error) throw error;

    return data;
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
    const { data, error } = await supabase
      .from('student_strike_summary')
      .select('*')
      .order('strike_count', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting students with strikes:', error);
    throw error;
  }
}

/**
 * Get strike history for a student
 * @param {string} studentId - Student UUID
 * @param {boolean} includeRevoked - Include revoked strikes
 * @returns {Promise<Array>} Array of strike records
 */
export async function getStrikeHistory(studentId, includeRevoked = false) {
  try {
    let query = supabase
      .from('strike_history')
      .select(`
        *,
        booking:bookings(id, equipment_ids, start_date, end_date),
        issued_by_user:users!strike_history_issued_by_fkey(full_name),
        revoked_by_user:users!strike_history_revoked_by_fkey(full_name)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (!includeRevoked) {
      query = query.is('revoked_at', null);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
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
