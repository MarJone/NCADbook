/**
 * CSV Import Service
 *
 * Handles GDPR-compliant CSV imports for users and equipment.
 * Features: validation, duplicate detection, preview before import
 */

import { demoMode } from '../mocks/demo-mode';

class CSVImportService {
  /**
   * Parse CSV text into array of objects
   * @param {string} csvText - Raw CSV text
   * @returns {Array} Array of objects with headers as keys
   */
  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = this.parseCSVLine(line);
      if (values.length !== headers.length) {
        console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}. Skipping.`);
        continue;
      }

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index].trim();
      });
      data.push(row);
    }

    return data;
  }

  /**
   * Parse a single CSV line, handling quoted values with commas
   * @param {string} line - CSV line to parse
   * @returns {Array} Array of values
   */
  parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' || char === "'") {
        if (inQuotes && nextChar === char) {
          current += char;
          i++; // Skip next quote (escaped quote)
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    return values.map(v => v.replace(/^["']|["']$/g, '')); // Remove surrounding quotes
  }

  /**
   * Validate user CSV data
   * @param {Array} data - Parsed CSV data
   * @returns {Object} { valid: boolean, errors: Array, warnings: Array }
   */
  validateUsers(data) {
    const errors = [];
    const warnings = [];
    const requiredFields = ['first_name', 'surname', 'full_name', 'email', 'department'];
    const validRoles = ['student', 'staff', 'admin', 'master_admin'];
    const validDepartments = ['Moving Image Design', 'Graphic Design', 'Illustration'];

    // Check for required columns
    const headers = Object.keys(data[0] || {});
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      errors.push(`Missing required columns: ${missingFields.join(', ')}`);
      return { valid: false, errors, warnings };
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because: 0-indexed + 1 header row

      // Required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push(`Row ${rowNum}: Missing required field '${field}'`);
        }
      });

      // Email validation
      if (row.email && !this.isValidEmail(row.email)) {
        errors.push(`Row ${rowNum}: Invalid email format '${row.email}'`);
      }

      // Role validation (if provided)
      if (row.role && !validRoles.includes(row.role)) {
        warnings.push(`Row ${rowNum}: Invalid role '${row.role}', will default to 'student'`);
      }

      // Department validation
      if (row.department && !validDepartments.includes(row.department)) {
        warnings.push(`Row ${rowNum}: Department '${row.department}' not in standard list`);
      }

      // Full name should match first_name + surname
      if (row.first_name && row.surname && row.full_name) {
        const expectedFullName = `${row.first_name} ${row.surname}`;
        if (row.full_name !== expectedFullName) {
          warnings.push(`Row ${rowNum}: full_name '${row.full_name}' doesn't match '${expectedFullName}'`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate equipment CSV data
   * @param {Array} data - Parsed CSV data
   * @returns {Object} { valid: boolean, errors: Array, warnings: Array }
   */
  validateEquipment(data) {
    const errors = [];
    const warnings = [];
    const requiredFields = ['product_name', 'tracking_number', 'description'];
    const optionalFields = ['link_to_image', 'category', 'department', 'status', 'requires_justification'];
    const validCategories = [
      'Camera', 'Lens', 'Lighting', 'Audio', 'Tripod & Support', 'Tripod',
      'Computer', 'Printer', 'Scanner', 'Projector', 'Other', 'Microphone',
      'Audio Recorder', 'Headphones', 'Gimbal', 'Media Player', '3D Printer',
      'Storage', 'Equipment', 'Monitor', 'Audio Equipment'
    ];
    const validDepartments = ['Moving Image Design', 'Graphic Design', 'Illustration', 'Shared'];

    // Check for required columns
    const headers = Object.keys(data[0] || {});
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    if (missingFields.length > 0) {
      errors.push(`Missing required columns: ${missingFields.join(', ')}`);
      return { valid: false, errors, warnings };
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNum = index + 2;

      // Required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].trim() === '') {
          errors.push(`Row ${rowNum}: Missing required field '${field}'`);
        }
      });

      // Tracking number uniqueness (will be checked later)
      if (row.tracking_number && row.tracking_number.length < 3) {
        warnings.push(`Row ${rowNum}: Tracking number '${row.tracking_number}' seems too short`);
      }

      // Category validation
      if (row.category && !validCategories.includes(row.category)) {
        warnings.push(`Row ${rowNum}: Category '${row.category}' not in standard list`);
      }

      // Department validation
      if (row.department && !validDepartments.includes(row.department)) {
        warnings.push(`Row ${rowNum}: Department '${row.department}' not in standard list`);
      }

      // Status validation
      if (row.status && !['available', 'booked', 'maintenance', 'out_of_service'].includes(row.status)) {
        warnings.push(`Row ${rowNum}: Invalid status '${row.status}', will default to 'available'`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Detect duplicate users (by email)
   * @param {Array} newData - New users from CSV
   * @param {Array} existingData - Existing users in database
   * @returns {Object} { duplicates: Array, unique: Array }
   */
  async detectUserDuplicates(newData) {
    const existingUsers = await demoMode.query('users');
    const duplicates = [];
    const unique = [];

    newData.forEach(newUser => {
      const existing = existingUsers.find(u => u.email.toLowerCase() === newUser.email.toLowerCase());
      if (existing) {
        duplicates.push({
          row: newUser,
          existingId: existing.id,
          existingName: existing.full_name,
          action: 'skip' // Options: 'skip', 'update', 'replace'
        });
      } else {
        unique.push(newUser);
      }
    });

    return { duplicates, unique };
  }

  /**
   * Detect duplicate equipment (by tracking_number)
   * @param {Array} newData - New equipment from CSV
   * @returns {Object} { duplicates: Array, unique: Array }
   */
  async detectEquipmentDuplicates(newData) {
    const existingEquipment = await demoMode.query('equipment');
    const duplicates = [];
    const unique = [];

    newData.forEach(newItem => {
      const existing = existingEquipment.find(e =>
        e.tracking_number.toLowerCase() === newItem.tracking_number.toLowerCase()
      );
      if (existing) {
        duplicates.push({
          row: newItem,
          existingId: existing.id,
          existingName: existing.product_name,
          action: 'skip'
        });
      } else {
        unique.push(newItem);
      }
    });

    return { duplicates, unique };
  }

  /**
   * Import users into database
   * @param {Array} users - Array of user objects
   * @param {Object} options - Import options (skipDuplicates, updateDuplicates)
   * @returns {Object} { imported: number, skipped: number, updated: number }
   */
  async importUsers(users, options = { skipDuplicates: true, updateDuplicates: false }) {
    let imported = 0;
    let skipped = 0;
    let updated = 0;

    for (const user of users) {
      try {
        // Check for duplicate
        const existingUsers = await demoMode.query('users');
        const existing = existingUsers.find(u => u.email.toLowerCase() === user.email.toLowerCase());

        if (existing) {
          if (options.updateDuplicates) {
            await demoMode.update('users', { id: existing.id }, {
              first_name: user.first_name,
              surname: user.surname,
              full_name: user.full_name || `${user.first_name} ${user.surname}`,
              department: user.department,
              role: user.role || 'student',
              year: user.year || null
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          // Create new user
          const newUser = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            first_name: user.first_name,
            surname: user.surname,
            full_name: user.full_name || `${user.first_name} ${user.surname}`,
            email: user.email.toLowerCase(),
            department: user.department,
            role: user.role || 'student',
            year: user.year || null,
            created_at: new Date().toISOString().split('T')[0]
          };

          await demoMode.insert('users', newUser);
          imported++;
        }
      } catch (error) {
        console.error(`Failed to import user ${user.email}:`, error);
        skipped++;
      }
    }

    return { imported, skipped, updated };
  }

  /**
   * Import equipment into database via backend API
   * @param {File} file - CSV file object
   * @param {Object} options - Import options
   * @param {Function} onProgress - Progress callback (percentage)
   * @returns {Object} { imported: number, skipped: number, updated: number, errors: Array }
   */
  async importEquipment(file, options = { skipDuplicates: true, updateDuplicates: false }, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      return new Promise((resolve, reject) => {
        // Track upload progress
        if (onProgress) {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              onProgress(percentComplete);
            }
          });
        }

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              imported: response.summary.successCount,
              skipped: response.summary.skipCount,
              updated: 0,
              errors: response.summary.errors || []
            });
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', 'http://localhost:3001/api/csv/import/equipment');

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }

        xhr.send(formData);
      });
    } catch (error) {
      console.error('Failed to import equipment:', error);
      throw error;
    }
  }

  /**
   * Generate CSV template for users
   * @returns {string} CSV template text
   */
  generateUserTemplate() {
    const headers = ['first_name', 'surname', 'full_name', 'email', 'department', 'role', 'year'];
    const sampleRows = [
      ['John', 'Doe', 'John Doe', 'john.doe@ncad.ie', 'Moving Image Design', 'student', '2'],
      ['Jane', 'Smith', 'Jane Smith', 'jane.smith@ncad.ie', 'Graphic Design', 'student', '3'],
      ['Bob', 'Admin', 'Bob Admin', 'bob.admin@ncad.ie', 'Moving Image Design', 'admin', '']
    ];

    let csv = headers.join(',') + '\n';
    sampleRows.forEach(row => {
      csv += row.map(v => `"${v}"`).join(',') + '\n';
    });

    return csv;
  }

  /**
   * Generate CSV template for equipment
   * @returns {string} CSV template text
   */
  generateEquipmentTemplate() {
    const headers = ['product_name', 'tracking_number', 'description', 'category', 'department', 'link_to_image', 'status', 'requires_justification'];
    const sampleRows = [
      ['Canon EOS R5', 'CAM001', 'Professional mirrorless camera', 'Camera', 'Moving Image Design', 'https://example.com/camera.jpg', 'available', 'true'],
      ['Rode NTG3', 'AUD050', 'Shotgun microphone', 'Audio', 'Moving Image Design', 'https://example.com/mic.jpg', 'available', 'false'],
      ['MacBook Pro 16"', 'COMP020', 'M1 Max laptop', 'Computer', 'Shared', 'https://example.com/laptop.jpg', 'available', 'true']
    ];

    let csv = headers.join(',') + '\n';
    sampleRows.forEach(row => {
      csv += row.map(v => `"${v}"`).join(',') + '\n';
    });

    return csv;
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}

export const csvImportService = new CSVImportService();
