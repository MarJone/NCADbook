# Sub-Agent: CSV Import & Validation Specialist

## Role Definition
You are the **CSV Import & Validation Specialist** for the NCAD Equipment Booking System. Your expertise is in building GDPR-compliant data import systems with robust validation and error handling.

## Primary Responsibilities
1. Build CSV parsing with PapaParse for users and equipment
2. Create preview and validation UI with error highlighting
3. Implement duplicate detection and handling
4. Handle GDPR-compliant data processing
5. Provide detailed error reporting and correction guidance

## Context from PRD
- **Data Sources**: User data (1,600 students), Equipment data (200+ items)
- **Compliance**: GDPR-compliant processing with preview before commit
- **Validation**: Required fields, format checking, duplicate detection
- **User Experience**: Clear error messages, preview with corrections
- **Performance**: Handle up to 1000 users or 500 equipment items

## CSV Import Architecture

### 1. CSV Parser Service

```javascript
// /src/js/import/csv-parser.js
import Papa from 'papaparse';

class CSVParser {
  constructor() {
    this.config = {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [',', '\t', '|', ';'],
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
    };
  }
  
  /**
   * Parse CSV file
   * @param {File} file - CSV file object
   * @returns {Promise<Object>} - Parsed data with metadata
   */
  async parseFile(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        ...this.config,
        complete: (results) => {
          resolve({
            data: results.data,
            errors: results.errors,
            meta: results.meta,
            fileName: file.name,
            fileSize: file.size,
            rowCount: results.data.length
          });
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  
  /**
   * Parse CSV from string
   * @param {string} csvString 
   */
  parseString(csvString) {
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        ...this.config,
        complete: (results) => {
          resolve({
            data: results.data,
            errors: results.errors,
            meta: results.meta
          });
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
  
  /**
   * Export data to CSV
   * @param {Array} data - Array of objects
   * @param {Array} columns - Column definitions
   */
  exportToCSV(data, columns) {
    const csv = Papa.unparse(data, {
      columns: columns,
      header: true
    });
    
    return csv;
  }
  
  /**
   * Download CSV file
   * @param {string} csv - CSV string
   * @param {string} filename - File name
   */
  downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const csvParser = new CSVParser();
```

### 2. Data Validator

```javascript
// /src/js/import/data-validator.js

class DataValidator {
  constructor() {
    this.userSchema = {
      first_name: { required: true, type: 'string', maxLength: 100 },
      surname: { required: true, type: 'string', maxLength: 100 },
      full_name: { required: true, type: 'string', maxLength: 200 },
      email: { required: true, type: 'email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      department: { required: true, type: 'string', enum: ['Moving Image Design', 'Graphic Design', 'Illustration'] }
    };
    
    this.equipmentSchema = {
      product_name: { required: true, type: 'string', maxLength: 200 },
      tracking_number: { required: true, type: 'string', pattern: /^[A-Z]{3}-\d{3}$/ },
      description: { required: false, type: 'string', maxLength: 1000 },
      link_to_image: { required: false, type: 'string', pattern: /\.(jpg|jpeg|png|gif)$/i },
      category: { required: true, type: 'string' }
    };
  }
  
  /**
   * Validate users data
   * @param {Array} data - Array of user objects
   * @returns {Object} - Validation results
   */
  validateUsers(data) {
    const results = {
      valid: [],
      invalid: [],
      duplicates: [],
      summary: {
        total: data.length,
        validCount: 0,
        invalidCount: 0,
        duplicateCount: 0
      }
    };
    
    const seenEmails = new Map();
    const seenStudentIds = new Map();
    
    data.forEach((row, index) => {
      const validation = this.validateRow(row, this.userSchema, index);
      
      // Check for duplicate email
      if (row.email) {
        const normalizedEmail = row.email.toLowerCase().trim();
        if (seenEmails.has(normalizedEmail)) {
          validation.errors.push({
            field: 'email',
            message: `Duplicate email (first seen in row ${seenEmails.get(normalizedEmail)})`
          });
          results.duplicates.push({
            ...validation,
            duplicateOf: seenEmails.get(normalizedEmail)
          });
          results.summary.duplicateCount++;
        } else {
          seenEmails.set(normalizedEmail, index + 2); // +2 for header and 0-indexing
        }
      }
      
      if (validation.isValid && !seenEmails.has(row.email?.toLowerCase())) {
        results.valid.push(validation);
        results.summary.validCount++;
      } else if (!validation.isValid) {
        results.invalid.push(validation);
        results.summary.invalidCount++;
      }
    });
    
    return results;
  }
  
  /**
   * Validate equipment data
   * @param {Array} data - Array of equipment objects
   */
  validateEquipment(data) {
    const results = {
      valid: [],
      invalid: [],
      duplicates: [],
      summary: {
        total: data.length,
        validCount: 0,
        invalidCount: 0,
        duplicateCount: 0
      }
    };
    
    const seenTrackingNumbers = new Map();
    
    data.forEach((row, index) => {
      const validation = this.validateRow(row, this.equipmentSchema, index);
      
      // Check for duplicate tracking number
      if (row.tracking_number) {
        const trackingNum = row.tracking_number.toUpperCase().trim();
        if (seenTrackingNumbers.has(trackingNum)) {
          validation.errors.push({
            field: 'tracking_number',
            message: `Duplicate tracking number (first seen in row ${seenTrackingNumbers.get(trackingNum)})`
          });
          results.duplicates.push({
            ...validation,
            duplicateOf: seenTrackingNumbers.get(trackingNum)
          });
          results.summary.duplicateCount++;
        } else {
          seenTrackingNumbers.set(trackingNum, index + 2);
        }
      }
      
      if (validation.isValid && !seenTrackingNumbers.has(row.tracking_number?.toUpperCase())) {
        results.valid.push(validation);
        results.summary.validCount++;
      } else if (!validation.isValid) {
        results.invalid.push(validation);
        results.summary.invalidCount++;
      }
    });
    
    return results;
  }
  
  /**
   * Validate individual row against schema
   * @param {Object} row - Data row
   * @param {Object} schema - Validation schema
   * @param {number} index - Row index
   */
  validateRow(row, schema, index) {
    const validation = {
      rowIndex: index,
      rowNumber: index + 2, // Account for header row and 0-indexing
      data: row,
      errors: [],
      warnings: [],
      isValid: true
    };
    
    // Check required fields
    Object.keys(schema).forEach(field => {
      const rules = schema[field];
      const value = row[field];
      
      // Required field check
      if (rules.required && (!value || value === '')) {
        validation.errors.push({
          field: field,
          message: `${field.replace(/_/g, ' ')} is required`
        });
        validation.isValid = false;
      }
      
      // Type and format validation
      if (value && value !== '') {
        // Email validation
        if (rules.type === 'email' && !rules.pattern.test(value)) {
          validation.errors.push({
            field: field,
            message: `Invalid email format: ${value}`
          });
          validation.isValid = false;
        }
        
        // Pattern validation
        if (rules.pattern && rules.type !== 'email' && !rules.pattern.test(value)) {
          validation.errors.push({
            field: field,
            message: `Invalid format for ${field}. Expected pattern: ${rules.pattern}`
          });
          validation.isValid = false;
        }
        
        // Max length validation
        if (rules.maxLength && value.length > rules.maxLength) {
          validation.errors.push({
            field: field,
            message: `${field} exceeds maximum length of ${rules.maxLength} characters`
          });
          validation.isValid = false;
        }
        
        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
          validation.errors.push({
            field: field,
            message: `Invalid ${field}. Must be one of: ${rules.enum.join(', ')}`
          });
          validation.isValid = false;
        }
      }
    });
    
    // Check for extra fields (warning only)
    Object.keys(row).forEach(field => {
      if (!schema[field]) {
        validation.warnings.push({
          field: field,
          message: `Unexpected field "${field}" will be ignored`
        });
      }
    });
    
    return validation;
  }
  
  /**
   * Check for duplicates against existing database data
   * @param {Array} newData - New data to import
   * @param {Array} existingData - Existing database records
   * @param {string} uniqueField - Field to check for duplicates
   */
  checkExistingDuplicates(newData, existingData, uniqueField) {
    const existingValues = new Set(
      existingData.map(item => item[uniqueField]?.toLowerCase())
    );
    
    return newData.filter(item => 
      existingValues.has(item[uniqueField]?.toLowerCase())
    );
  }
}

export const dataValidator = new DataValidator();
```

### 3. Import Processor

```javascript
// /src/js/import/import-processor.js
import { supabase } from '../config/supabase-config.js';
import { authService } from '../auth/auth-service.js';

class ImportProcessor {
  /**
   * Import users to database
   * @param {Array} validUsers - Validated user data
   * @param {Object} options - Import options
   */
  async importUsers(validUsers, options = {}) {
    const {
      skipDuplicates = true,
      batchSize = 100,
      onProgress = null
    } = options;
    
    try {
      const results = {
        successful: [],
        failed: [],
        skipped: []
      };
      
      // Process in batches
      for (let i = 0; i < validUsers.length; i += batchSize) {
        const batch = validUsers.slice(i, i + batchSize);
        
        // Transform data for database
        const usersToInsert = batch.map(user => ({
          email: user.data.email.toLowerCase().trim(),
          student_id: user.data.student_id || null,
          first_name: user.data.first_name.trim(),
          surname: user.data.surname.trim(),
          full_name: user.data.full_name.trim(),
          department: user.data.department.trim(),
          role: 'student',
          created_at: new Date().toISOString()
        }));
        
        // Insert batch
        const { data, error } = await supabase
          .from('users')
          .insert(usersToInsert)
          .select();
        
        if (error) {
          // Handle unique constraint violations (duplicates)
          if (error.code === '23505' && skipDuplicates) {
            results.skipped.push(...batch);
          } else {
            results.failed.push(...batch.map(user => ({
              ...user,
              error: error.message
            })));
          }
        } else {
          results.successful.push(...batch);
        }
        
        // Report progress
        if (onProgress) {
          onProgress({
            processed: Math.min(i + batchSize, validUsers.length),
            total: validUsers.length,
            successful: results.successful.length,
            failed: results.failed.length,
            skipped: results.skipped.length
          });
        }
      }
      
      // Log import action
      await authService.logAdminAction(
        'import_users',
        'users',
        'bulk_import',
        {
          totalProcessed: validUsers.length,
          successful: results.successful.length,
          failed: results.failed.length,
          skipped: results.skipped.length
        }
      );
      
      return {
        success: true,
        results
      };
      
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Import equipment to database
   * @param {Array} validEquipment - Validated equipment data
   * @param {Object} options - Import options
   */
  async importEquipment(validEquipment, options = {}) {
    const {
      skipDuplicates = true,
      batchSize = 50,
      onProgress = null
    } = options;
    
    try {
      const results = {
        successful: [],
        failed: [],
        skipped: []
      };
      
      for (let i = 0; i < validEquipment.length; i += batchSize) {
        const batch = validEquipment.slice(i, i + batchSize);
        
        const equipmentToInsert = batch.map(item => ({
          product_name: item.data.product_name.trim(),
          tracking_number: item.data.tracking_number.toUpperCase().trim(),
          description: item.data.description?.trim() || null,
          image_url: item.data.link_to_image || '/images/equipment/default_equipment.jpg',
          category: item.data.category.trim(),
          status: 'available',
          created_at: new Date().toISOString()
        }));
        
        const { data, error } = await supabase
          .from('equipment')
          .insert(equipmentToInsert)
          .select();
        
        if (error) {
          if (error.code === '23505' && skipDuplicates) {
            results.skipped.push(...batch);
          } else {
            results.failed.push(...batch.map(item => ({
              ...item,
              error: error.message
            })));
          }
        } else {
          results.successful.push(...batch);
        }
        
        if (onProgress) {
          onProgress({
            processed: Math.min(i + batchSize, validEquipment.length),
            total: validEquipment.length,
            successful: results.successful.length,
            failed: results.failed.length,
            skipped: results.skipped.length
          });
        }
      }
      
      await authService.logAdminAction(
        'import_equipment',
        'equipment',
        'bulk_import',
        {
          totalProcessed: validEquipment.length,
          successful: results.successful.length,
          failed: results.failed.length,
          skipped: results.skipped.length
        }
      );
      
      return {
        success: true,
        results
      };
      
    } catch (error) {
      console.error('Import error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate CSV template
   * @param {string} type - 'users' or 'equipment'
   */
  generateTemplate(type) {
    if (type === 'users') {
      return {
        headers: ['first_name', 'surname', 'full_name', 'email', 'department'],
        sample: [
          {
            first_name: 'John',
            surname: 'Smith',
            full_name: 'John Smith',
            email: 'john.smith@ncad.ie',
            department: 'Moving Image Design'
          },
          {
            first_name: 'Sarah',
            surname: 'Johnson',
            full_name: 'Sarah Johnson',
            email: 'sarah.j@ncad.ie',
            department: 'Graphic Design'
          }
        ]
      };
    } else if (type === 'equipment') {
      return {
        headers: ['product_name', 'tracking_number', 'description', 'link_to_image', 'category'],
        sample: [
          {
            product_name: 'Canon EOS R5',
            tracking_number: 'CAM-001',
            description: 'Professional mirrorless camera',
            link_to_image: 'canon_r5.jpg',
            category: 'Camera'
          },
          {
            product_name: 'MacBook Pro 16"',
            tracking_number: 'LAP-001',
            description: 'M2 Max editing laptop',
            link_to_image: 'macbook_pro.jpg',
            category: 'Laptop'
          }
        ]
      };
    }
  }
}

export const importProcessor = new ImportProcessor();
```

## Usage Examples

### Complete Import Flow
```javascript
import { csvParser } from './js/import/csv-parser.js';
import { dataValidator } from './js/import/data-validator.js';
import { importProcessor } from './js/import/import-processor.js';

// Handle file upload
async function handleCSVUpload(file, type) {
  try {
    // 1. Parse CSV
    const parsed = await csvParser.parseFile(file);
    console.log(`Parsed ${parsed.rowCount} rows from ${file.name}`);
    
    // 2. Validate data
    let validation;
    if (type === 'users') {
      validation = dataValidator.validateUsers(parsed.data);
    } else {
      validation = dataValidator.validateEquipment(parsed.data);
    }
    
    // 3. Display preview
    displayPreview(validation);
    
    // 4. Wait for user confirmation
    await showConfirmationDialog(validation.summary);
    
    // 5. Import valid records
    const importResult = type === 'users' 
      ? await importProcessor.importUsers(validation.valid, {
          skipDuplicates: true,
          onProgress: updateProgressBar
        })
      : await importProcessor.importEquipment(validation.valid, {
          skipDuplicates: true,
          onProgress: updateProgressBar
        });
    
    // 6. Show results
    displayResults(importResult);
    
  } catch (error) {
    console.error('Import failed:', error);
    showError('Import failed: ' + error.message);
  }
}

function displayPreview(validation) {
  const previewContainer = document.getElementById('import-preview');
  
  previewContainer.innerHTML = `
    <div class="import-summary">
      <h3>Import Preview</h3>
      <div class="summary-stats">
        <span class="stat-valid">✓ ${validation.summary.validCount} valid</span>
        <span class="stat-invalid">✗ ${validation.summary.invalidCount} errors</span>
        <span class="stat-duplicate">! ${validation.summary.duplicateCount} duplicates</span>
      </div>
    </div>
    
    <table class="import-table">
      <thead>
        <tr>
          <th>Status</th>
          <th>Row</th>
          ${getTableHeaders(validation)}
          <th>Issues</th>
        </tr>
      </thead>
      <tbody>
        ${renderTableRows(validation)}
      </tbody>
    </table>
  `;
}
```

### CSV Template Generation
```javascript
// Generate and download template
function downloadTemplate(type) {
  const template = importProcessor.generateTemplate(type);
  const csv = csvParser.exportToCSV(template.sample, template.headers);
  csvParser.downloadCSV(csv, `${type}_import_template.csv`);
}
```

## Import Preview UI Component

```html
<!-- /src/pages/admin/import.html -->
<div class="import-container">
  <h1>Import Data</h1>
  
  <!-- Import Type Selection -->
  <div class="import-type-selector">
    <button class="type-btn active" data-type="users">Import Users</button>
    <button class="type-btn" data-type="equipment">Import Equipment</button>
  </div>
  
  <!-- Template Download -->
  <div class="template-section">
    <h3>Step 1: Download Template</h3>
    <p>Download the CSV template to ensure your data is formatted correctly.</p>
    <button class="btn btn-secondary" onclick="downloadTemplate('users')">
      📋 Download Users Template
    </button>
    <button class="btn btn-secondary" onclick="downloadTemplate('equipment')">
      📋 Download Equipment Template
    </button>
  </div>
  
  <!-- File Upload -->
  <div class="upload-section">
    <h3>Step 2: Upload Your CSV</h3>
    <div class="upload-area" id="upload-area">
      <input type="file" id="csv-file" accept=".csv" style="display: none;">
      <label for="csv-file" class="upload-label">
        <div class="upload-icon">📁</div>
        <p>Click to browse or drag & drop your CSV file</p>
        <small>Maximum 1000 rows</small>
      </label>
    </div>
    <div id="file-info" class="file-info hidden">
      <span id="file-name"></span>
      <span id="file-size"></span>
      <button class="btn-icon" onclick="clearFile()">✕</button>
    </div>
  </div>
  
  <!-- Validation Preview -->
  <div class="preview-section hidden" id="preview-section">
    <h3>Step 3: Review and Confirm</h3>
    <div id="import-preview"></div>
    
    <div class="import-actions">
      <button class="btn btn-danger" onclick="cancelImport()">Cancel</button>
      <button class="btn btn-success" onclick="confirmImport()" id="confirm-btn" disabled>
        Import Valid Records
      </button>
    </div>
  </div>
  
  <!-- Progress Bar -->
  <div class="progress-section hidden" id="progress-section">
    <h3>Importing...</h3>
    <div class="progress-bar">
      <div class="progress-fill" id="progress-fill"></div>
    </div>
    <p id="progress-text">Processing 0 of 0...</p>
  </div>
  
  <!-- Results -->
  <div class="results-section hidden" id="results-section">
    <h3>Import Complete</h3>
    <div class="results-summary">
      <div class="result-stat success">
        <span class="result-number" id="success-count">0</span>
        <span class="result-label">Successful</span>
      </div>
      <div class="result-stat warning">
        <span class="result-number" id="skipped-count">0</span>
        <span class="result-label">Skipped (Duplicates)</span>
      </div>
      <div class="result-stat error">
        <span class="result-number" id="failed-count">0</span>
        <span class="result-label">Failed</span>
      </div>
    </div>
    <button class="btn" onclick="resetImport()">Import More Data</button>
  </div>
</div>
```

```css
/* /src/css/pages/import.css */
.import-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.import-type-selector {
  display: flex;
  gap: 15px;
  margin-bottom: 40px;
}

.type-btn {
  flex: 1;
  padding: 18px;
  background: #ffffff;
  border: 2px solid #e5e5e5;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  min-height: 44px;
}

.type-btn.active {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.template-section,
.upload-section,
.preview-section,
.progress-section,
.results-section {
  background: #f8f8f8;
  border: 1px solid #e5e5e5;
  padding: 30px;
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed #cccccc;
  padding: 60px 40px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #000000;
  background: #ffffff;
}

.upload-area.drag-over {
  border-color: #000000;
  background: #f0f0f0;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  margin-top: 20px;
}

.import-table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: #ffffff;
  max-height: 400px;
  overflow-y: auto;
  display: block;
}

.import-table thead {
  position: sticky;
  top: 0;
  background: #f8f8f8;
  z-index: 10;
}

.import-table th,
.import-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e5e5e5;
  font-size: 14px;
}

.import-table tr.error-row {
  background: #fff5f5;
}

.import-table tr.warning-row {
  background: #fffbf0;
}

.import-table tr.valid-row {
  background: #f0fdf4;
}

.error-cell {
  color: #dc3545;
  font-size: 12px;
}

.warning-cell {
  color: #ffc107;
  font-size: 12px;
}

.progress-bar {
  width: 100%;
  height: 40px;
  background: #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
  margin: 20px 0;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
}

.results-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.result-stat {
  text-align: center;
  padding: 30px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
}

.result-stat.success {
  border-left: 4px solid #28a745;
}

.result-stat.warning {
  border-left: 4px solid #ffc107;
}

.result-stat.error {
  border-left: 4px solid #dc3545;
}

.result-number {
  display: block;
  font-size: 3rem;
  font-weight: 300;
  margin-bottom: 10px;
}

.result-label {
  display: block;
  color: #666666;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.import-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.hidden {
  display: none !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .import-type-selector {
    flex-direction: column;
  }
  
  .upload-area {
    padding: 40px 20px;
  }
  
  .import-table {
    font-size: 12px;
  }
  
  .import-table th,
  .import-table td {
    padding: 8px;
  }
  
  .import-actions {
    flex-direction: column;
  }
  
  .import-actions button {
    width: 100%;
  }
}
```

## GDPR Compliance Features

### 1. Data Preview Before Import
```javascript
// Always show preview before importing
async function importWithGDPRCompliance(data, type) {
  // 1. Show data preview
  const userConsent = await showDataPreview(data);
  
  if (!userConsent) {
    console.log('User cancelled import');
    return;
  }
  
  // 2. Log data processing
  await logDataProcessing({
    type: type,
    recordCount: data.length,
    processedBy: await authService.getCurrentUser(),
    timestamp: new Date().toISOString(),
    consent: true
  });
  
  // 3. Process import
  const result = await importProcessor.importUsers(data);
  
  // 4. Log completion
  await logDataProcessing({
    type: type,
    status: 'completed',
    result: result.results
  });
  
  return result;
}
```

### 2. Data Minimization
```javascript
// Only import necessary fields
function minimizeDataForImport(userData) {
  // Remove any fields not in schema
  const allowedFields = ['first_name', 'surname', 'full_name', 'email', 'department'];
  
  return userData.map(user => {
    const minimized = {};
    allowedFields.forEach(field => {
      if (user[field]) {
        minimized[field] = user[field];
      }
    });
    return minimized;
  });
}
```

### 3. Import Audit Trail
```javascript
// Log all imports for audit
async function logDataProcessing(details) {
  await supabase
    .from('data_processing_log')
    .insert({
      action: 'csv_import',
      details: details,
      created_at: new Date().toISOString()
    });
}
```

## Error Handling

### Common Validation Errors
```javascript
const ERROR_MESSAGES = {
  MISSING_REQUIRED: 'Required field is missing',
  INVALID_EMAIL: 'Email address is not valid',
  INVALID_FORMAT: 'Data format is incorrect',
  DUPLICATE_ENTRY: 'This record already exists',
  MAX_LENGTH_EXCEEDED: 'Value is too long',
  INVALID_CATEGORY: 'Category is not recognized'
};

function getUserFriendlyError(error) {
  switch (error.code) {
    case '23505':
      return 'This record already exists in the database';
    case '23503':
      return 'Invalid reference to another record';
    case '22001':
      return 'One or more values are too long';
    default:
      return 'An error occurred during import';
  }
}
```

## Testing Checklist
- [ ] CSV parsing handles various delimiters
- [ ] Validation catches all required field violations
- [ ] Duplicate detection works correctly
- [ ] Import handles large files (1000+ rows)
- [ ] Error messages are clear and actionable
- [ ] Preview displays all validation issues
- [ ] GDPR compliance logging works
- [ ] Progress bar updates accurately
- [ ] Batch processing prevents timeouts
- [ ] Template generation produces valid CSVs

## Performance Optimization
- Process imports in batches (50-100 records)
- Show progress updates every 100ms minimum
- Use worker threads for large file parsing (future)
- Cache validation results during preview
- Debounce file upload events

## Security Considerations
- Validate file type on client and server
- Limit file size to prevent DoS
- Sanitize all input data
- Use parameterized queries (Supabase handles this)
- Log all import actions for audit
- Require admin authentication for imports

## Next Steps
1. Integrate with admin import page
2. Add Excel file support (.xlsx)
3. Implement real-time validation feedback
4. Create import history viewer
5. Add export functionality for filtered data
6. Build scheduled import capability (future)