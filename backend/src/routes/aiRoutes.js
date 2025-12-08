/**
 * AI Routes - API endpoints for AI features
 *
 * All routes require authentication.
 * Most routes require master_admin role.
 */

import express from 'express';
import {
  getStatus,
  chat,
  generate,
  assessCondition,
  naturalLanguageQuery,
  listModels,
  pullModel,
  deleteModel,
  getSettings,
  updateSettings
} from '../controllers/aiController.js';
import { authenticate, requireMasterAdmin } from '../middleware/auth.js';

const router = express.Router();

// All AI routes require authentication
router.use(authenticate);

// Status endpoint - available to all authenticated users
router.get('/status', getStatus);

// Chat and generation - Master Admin only
router.post('/chat', requireMasterAdmin, chat);
router.post('/generate', requireMasterAdmin, generate);

// Vision/condition assessment - Master Admin only
router.post('/assess-condition', requireMasterAdmin, assessCondition);

// Natural language database query - Master Admin only
router.post('/query', requireMasterAdmin, naturalLanguageQuery);

// Model management - Master Admin only
router.get('/models', requireMasterAdmin, listModels);
router.post('/models/pull', requireMasterAdmin, pullModel);
router.delete('/models/:name', requireMasterAdmin, deleteModel);

// Settings - Master Admin only
router.get('/settings', requireMasterAdmin, getSettings);
router.put('/settings', requireMasterAdmin, updateSettings);

export default router;
