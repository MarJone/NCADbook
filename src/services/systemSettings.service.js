/**
 * System Settings Service
 * Manages global system configuration (master admin only)
 */

import { demoMode } from '../mocks/demo-mode';

/**
 * Get a system setting by key
 * @param {string} key - Setting key
 * @returns {Promise<any>} Setting value
 */
export async function getSystemSetting(key) {
  try {
    const settings = await demoMode.query('system_settings');
    const setting = settings.find(s => s.key === key);
    return setting ? setting.value : null;
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
    return await demoMode.query('system_settings');
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
}

/**
 * Update a system setting (master admin only)
 * @param {string} key - Setting key
 * @param {any} value - New value
 * @param {string} userId - ID of user making the change
 * @returns {Promise<Object>} Updated setting
 */
export async function updateSystemSetting(key, value, userId) {
  try {
    const settings = await demoMode.query('system_settings');
    const settingIndex = settings.findIndex(s => s.key === key);

    if (settingIndex === -1) {
      throw new Error(`Setting with key '${key}' not found`);
    }

    const updatedSetting = {
      ...settings[settingIndex],
      value,
      modified_by: userId,
      modified_at: new Date().toISOString()
    };

    // Update in demo mode storage
    const allSettings = await demoMode.query('system_settings');
    allSettings[settingIndex] = updatedSetting;

    // Save back to localStorage
    const data = demoMode.getData();
    data.system_settings = allSettings;
    demoMode.saveData(data);

    return updatedSetting;
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
