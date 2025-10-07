import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  addStrike,
  getUserStrikes
} from '../controllers/userController.js';
import { authenticate, requireAdmin, requireMasterAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users with filters
 * @access  Admin only (dept admin sees their dept, master admin sees all)
 */
router.get('/', requireAdmin, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Admin only
 */
router.get('/:id', requireAdmin, getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Master Admin only
 */
router.post('/', requireMasterAdmin, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin only (dept admin limited to their dept)
 */
router.put('/:id', requireAdmin, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Master Admin only
 */
router.delete('/:id', requireMasterAdmin, deleteUser);

/**
 * @route   POST /api/users/:id/strike
 * @desc    Add strike to user
 * @access  Admin only
 */
router.post('/:id/strike', requireAdmin, addStrike);

/**
 * @route   GET /api/users/:id/strikes
 * @desc    Get user strike history
 * @access  Admin only
 */
router.get('/:id/strikes', requireAdmin, getUserStrikes);

export default router;
