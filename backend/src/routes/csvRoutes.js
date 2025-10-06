import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  importUsers,
  importEquipment,
  previewCSV,
  downloadTemplate
} from '../controllers/csvImportController.js';

const router = express.Router();

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/csv'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'import-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only accept CSV files
    if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

/**
 * CSV Import Routes
 */

// Download CSV templates
router.get('/template/:type', downloadTemplate);

// Preview CSV before import
router.post('/preview', upload.single('file'), previewCSV);

// Import users from CSV
router.post('/import/users', upload.single('file'), importUsers);

// Import equipment from CSV
router.post('/import/equipment', upload.single('file'), importEquipment);

export default router;
