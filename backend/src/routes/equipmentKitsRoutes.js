import express from 'express';
import {
  getAllKits,
  getKitById,
  createKit,
  updateKit,
  deleteKit
} from '../controllers/equipmentKitsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/kits
 * @desc    Get all equipment kits
 * @access  Authenticated users can read
 */
router.get('/', authenticate, getAllKits);

/**
 * @route   GET /api/kits/:id
 * @desc    Get single kit by ID with equipment details
 * @access  Authenticated users can read
 */
router.get('/:id', authenticate, getKitById);

/**
 * @route   POST /api/kits
 * @desc    Create new equipment kit
 * @access  Admin only
 */
router.post('/', authenticate, requireAdmin, createKit);

/**
 * @route   PUT /api/kits/:id
 * @desc    Update equipment kit
 * @access  Admin only (dept admin limited to their dept)
 */
router.put('/:id', authenticate, requireAdmin, updateKit);

/**
 * @route   DELETE /api/kits/:id
 * @desc    Delete equipment kit
 * @access  Admin only (dept admin limited to their dept)
 */
router.delete('/:id', authenticate, requireAdmin, deleteKit);

export default router;
