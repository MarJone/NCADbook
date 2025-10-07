import express from 'express';
import {
  getAllSettings,
  getSettingByKey,
  updateSetting,
  deleteSetting
} from '../controllers/systemSettingsController.js';
import { authenticate, requireMasterAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/settings
 * @desc    Get all system settings
 * @access  Authenticated users can read
 */
router.get('/', authenticate, getAllSettings);

/**
 * @route   GET /api/settings/:key
 * @desc    Get single setting by key
 * @access  Authenticated users can read
 */
router.get('/:key', authenticate, getSettingByKey);

/**
 * @route   PUT /api/settings/:key
 * @desc    Update or create system setting
 * @access  Master Admin only
 */
router.put('/:key', authenticate, requireMasterAdmin, updateSetting);

/**
 * @route   DELETE /api/settings/:key
 * @desc    Delete system setting
 * @access  Master Admin only
 */
router.delete('/:key', authenticate, requireMasterAdmin, deleteSetting);

export default router;
