import express from 'express';
import {
  getDashboardAnalytics,
  exportCSV,
  getEquipmentUtilization
} from '../controllers/analyticsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get comprehensive analytics dashboard data
 * @access  Admin only
 * @query   start_date, end_date, department (optional filters)
 */
router.get('/dashboard', getDashboardAnalytics);

/**
 * @route   GET /api/analytics/export/csv
 * @desc    Export analytics data to CSV
 * @access  Admin only
 * @query   start_date, end_date, department, type (bookings|equipment)
 */
router.get('/export/csv', exportCSV);

/**
 * @route   GET /api/analytics/utilization
 * @desc    Get equipment utilization report
 * @access  Admin only
 * @query   start_date, end_date, department (optional filters)
 */
router.get('/utilization', getEquipmentUtilization);

export default router;
