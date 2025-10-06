import express from 'express';
import {
  register,
  login,
  demoLogin,
  getCurrentUser,
  updatePassword
} from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (Master Admin only)
 * @access  Protected (Master Admin)
 */
router.post('/register', authenticate, authorize(['master_admin']), register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/demo-login
 * @desc    Demo login without password (development only)
 * @access  Public
 */
router.post('/demo-login', demoLogin);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Protected
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route   PUT /api/auth/password
 * @desc    Update user password
 * @access  Protected
 */
router.put('/password', authenticate, updatePassword);

export default router;
