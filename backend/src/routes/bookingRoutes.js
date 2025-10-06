import express from 'express';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  approveBooking,
  denyBooking,
  returnBooking,
  deleteBooking
} from '../controllers/bookingController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings (filtered by role)
 * @access  Private
 */
router.get('/', getAllBookings);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private
 */
router.get('/:id', getBookingById);

/**
 * @route   POST /api/bookings
 * @desc    Create new booking
 * @access  Private
 */
router.post('/', createBooking);

/**
 * @route   PUT /api/bookings/:id/approve
 * @desc    Approve booking
 * @access  Admin only
 */
router.put('/:id/approve', requireAdmin, approveBooking);

/**
 * @route   PUT /api/bookings/:id/deny
 * @desc    Deny booking
 * @access  Admin only
 */
router.put('/:id/deny', requireAdmin, denyBooking);

/**
 * @route   PUT /api/bookings/:id/return
 * @desc    Mark booking as returned/completed
 * @access  Admin only
 */
router.put('/:id/return', requireAdmin, returnBooking);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete booking
 * @access  Private (own pending bookings for students, any for admins)
 */
router.delete('/:id', deleteBooking);

export default router;
