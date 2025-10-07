/**
 * System Settings Service
 * Manages global system configuration (master admin only)
 */

import { systemSettingsAPI } from '../utils/api.js';

/**
 * Get a system setting by key
 * @param {string} key - Setting key
 * @returns {Promise<any>} Setting value
 */
export async function getSystemSetting(key) {
  try {
    const response = await systemSettingsAPI.getByKey(key);
    return response.setting ? response.setting.value : null;
  } catch (error) {
    console.error('Error fetching system setting:', error);
    throw error;
  }
}

/**
 * Get all system settings
 * @returns {Promise<Array>} All system settings
 */
export async function getAllSystemSettings() {
  try {
    const response = await systemSettingsAPI.getAll();
    return response.settings || [];
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
}

/**
 * Update a system setting (master admin only)
 * @param {string} key - Setting key
 * @param {any} value - New value
 * @param {string} description - Description of the setting
 * @returns {Promise<Object>} Updated setting
 */
export async function updateSystemSetting(key, value, description = '') {
  try {
    const response = await systemSettingsAPI.update(key, value, description);
    return response.setting;
  } catch (error) {
    console.error('Error updating system setting:', error);
    throw error;
  }
}

/**
 * Check if cross-department browsing is enabled
 * @returns {Promise<boolean>}
 */
export async function isCrossDepartmentBrowsingEnabled() {
  const value = await getSystemSetting('cross_department_browsing_enabled');
  return value === true || value === 'true';
}

/**
 * Check if staff cross-department requests are enabled
 * @returns {Promise<boolean>}
 */
export async function areStaffRequestsEnabled() {
  const value = await getSystemSetting('staff_cross_department_requests_enabled');
  return value === true || value === 'true';
}

/**
 * Check if equipment kits are enabled
 * @returns {Promise<boolean>}
 */
export async function areEquipmentKitsEnabled() {
  const value = await getSystemSetting('equipment_kits_enabled');
  return value === true || value === 'true';
}

/**
 * Check if cross-department booking is enabled
 * @returns {Promise<boolean>}
 */
export async function isCrossDepartmentBookingEnabled() {
  const value = await getSystemSetting('cross_department_booking_enabled');
  return value === true || value === 'true';
}

/**
 * Check if cross-department approval is required
 * @returns {Promise<boolean>}
 */
export async function isCrossDepartmentApprovalRequired() {
  const value = await getSystemSetting('cross_department_approval_required');
  return value === true || value === 'true';
}

/**
 * Check if room bookings system is enabled globally
 * @returns {Promise<boolean>}
 */
export async function areRoomBookingsEnabled() {
  const value = await getSystemSetting('room_bookings_enabled');
  return value === true || value === 'true';
}

/**
 * Check if room bookings are visible in Staff portal
 * @returns {Promise<boolean>}
 */
export async function areRoomBookingsVisibleForStaff() {
  // Check both master toggle and staff-specific setting
  const systemEnabled = await areRoomBookingsEnabled();
  if (!systemEnabled) return false;

  const value = await getSystemSetting('room_bookings_visible_staff');
  return value === true || value === 'true';
}

/**
 * Check if room bookings are visible in Department Admin portal
 * @returns {Promise<boolean>}
 */
export async function areRoomBookingsVisibleForDeptAdmin() {
  // Check both master toggle and dept admin-specific setting
  const systemEnabled = await areRoomBookingsEnabled();
  if (!systemEnabled) return false;

  const value = await getSystemSetting('room_bookings_visible_dept_admin');
  return value === true || value === 'true';
}
