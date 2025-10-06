import express from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipmentAvailability,
  getEquipmentNotes,
  addEquipmentNote,
  deleteEquipmentNote
} from '../controllers/equipmentController.js';
import { authenticate, authorize, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment with optional filters
 * @access  Protected
 */
router.get('/', authenticate, getAllEquipment);

/**
 * @route   GET /api/equipment/:id
 * @desc    Get single equipment by ID
 * @access  Protected
 */
router.get('/:id', authenticate, getEquipmentById);

/**
 * @route   GET /api/equipment/:id/availability
 * @desc    Check equipment availability for date range
 * @access  Protected
 */
router.get('/:id/availability', authenticate, getEquipmentAvailability);

/**
 * @route   GET /api/equipment/:id/notes
 * @desc    Get equipment notes
 * @access  Protected (Admin only)
 */
router.get('/:id/notes', authenticate, requireAdmin, getEquipmentNotes);

/**
 * @route   POST /api/equipment/:id/notes
 * @desc    Add equipment note
 * @access  Protected (Admin only)
 */
router.post('/:id/notes', authenticate, requireAdmin, addEquipmentNote);

/**
 * @route   DELETE /api/equipment/:id/notes/:noteId
 * @desc    Delete equipment note
 * @access  Protected (Admin only)
 */
router.delete('/:id/notes/:noteId', authenticate, requireAdmin, deleteEquipmentNote);

/**
 * @route   POST /api/equipment
 * @desc    Create new equipment
 * @access  Protected (Department Admin, Master Admin)
 */
router.post('/', authenticate, authorize(['department_admin', 'master_admin']), createEquipment);

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment
 * @access  Protected (Department Admin, Master Admin)
 */
router.put('/:id', authenticate, authorize(['department_admin', 'master_admin']), updateEquipment);

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete equipment
 * @access  Protected (Master Admin only)
 */
router.delete('/:id', authenticate, authorize(['master_admin']), deleteEquipment);

export default router;
