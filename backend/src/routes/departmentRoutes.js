import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { authenticate, requireMasterAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/departments
 * @desc    Get all departments/sub-areas
 * @access  Public (authenticated)
 */
router.get('/', authenticate, getAllDepartments);

/**
 * @route   GET /api/departments/:id
 * @desc    Get single department by ID
 * @access  Public (authenticated)
 */
router.get('/:id', authenticate, getDepartmentById);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Master Admin only
 */
router.post('/', authenticate, requireMasterAdmin, createDepartment);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Master Admin only
 */
router.put('/:id', authenticate, requireMasterAdmin, updateDepartment);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department
 * @access  Master Admin only
 */
router.delete('/:id', authenticate, requireMasterAdmin, deleteDepartment);

export default router;
