import csv from 'csv-parser';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { query, getClient } from '../config/database.js';

/**
 * CSV Import Controller
 * Handles bulk import of users and equipment from CSV files
 */

// Import Users from CSV
export const importUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  let successCount = 0;
  let skipCount = 0;

  try {
    // Parse CSV file
    const stream = fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`📊 Parsed ${results.length} rows from CSV`);

        // Validate and import each user
        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const rowNum = i + 2; // +2 because CSV has header row and arrays are 0-indexed

          try {
            // Validate required fields
            if (!row.email || !row.first_name || !row.surname || !row.department) {
              errors.push({
                row: rowNum,
                data: row,
                error: 'Missing required fields: email, first_name, surname, department'
              });
              skipCount++;
              continue;
            }

            // Check if user already exists
            const existingUser = await query(
              'SELECT id FROM users WHERE email = $1',
              [row.email.toLowerCase().trim()]
            );

            if (existingUser.rows.length > 0) {
              errors.push({
                row: rowNum,
                data: row,
                error: 'User with this email already exists'
              });
              skipCount++;
              continue;
            }

            // Generate default password (password123 hashed)
            const defaultPassword = await bcrypt.hash('password123', 10);

            // Prepare user data
            const fullName = `${row.first_name.trim()} ${row.surname.trim()}`;
            const role = row.role ? row.role.toLowerCase().trim() : 'student';
            const department = row.department.trim();

            // Insert user
            await query(`
              INSERT INTO users (
                email, password, first_name, surname, full_name,
                role, department, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            `, [
              row.email.toLowerCase().trim(),
              defaultPassword,
              row.first_name.trim(),
              row.surname.trim(),
              fullName,
              role,
              department
            ]);

            successCount++;
            console.log(`✅ Row ${rowNum}: Imported user ${row.email}`);

          } catch (error) {
            errors.push({
              row: rowNum,
              data: row,
              error: error.message
            });
            skipCount++;
            console.error(`❌ Row ${rowNum}: ${error.message}`);
          }
        }

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        // Return summary
        res.json({
          success: true,
          message: 'CSV import completed',
          summary: {
            totalRows: results.length,
            successCount,
            skipCount,
            errors: errors.length > 0 ? errors : null
          }
        });
      })
      .on('error', (error) => {
        console.error('❌ CSV parsing error:', error);
        // Clean up file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to parse CSV file', details: error.message });
      });

  } catch (error) {
    console.error('❌ Import error:', error);
    // Clean up file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to import users', details: error.message });
  }
};

// Import Equipment from CSV
export const importEquipment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const errors = [];
  let successCount = 0;
  let skipCount = 0;

  try {
    // Parse CSV file
    const stream = fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`📊 Parsed ${results.length} rows from CSV`);

        // Validate and import each equipment item
        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const rowNum = i + 2;

          try {
            // Validate required fields (only product_name, tracking_number, description are required)
            if (!row.product_name || !row.tracking_number) {
              errors.push({
                row: rowNum,
                data: row,
                error: 'Missing required fields: product_name, tracking_number'
              });
              skipCount++;
              continue;
            }

            // Check if equipment with this tracking number already exists
            const existing = await query(
              'SELECT id FROM equipment WHERE tracking_number = $1',
              [row.tracking_number.trim()]
            );

            if (existing.rows.length > 0) {
              errors.push({
                row: rowNum,
                data: row,
                error: 'Equipment with this tracking number already exists'
              });
              skipCount++;
              continue;
            }

            // Prepare equipment data
            const status = row.status ? row.status.toLowerCase().trim() : 'available';
            const category = row.category ? row.category.trim() : 'Other';
            const department = row.department ? row.department.trim() : 'Moving Image Design';
            const linkToImage = row.link_to_image || row.image_url || null;

            // Insert equipment
            await query(`
              INSERT INTO equipment (
                product_name, tracking_number, description, image_url,
                category, department, status, created_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            `, [
              row.product_name.trim(),
              row.tracking_number.trim(),
              row.description ? row.description.trim() : '',
              linkToImage ? linkToImage.trim() : null,
              category,
              department,
              status
            ]);

            successCount++;
            console.log(`✅ Row ${rowNum}: Imported equipment ${row.product_name}`);

          } catch (error) {
            errors.push({
              row: rowNum,
              data: row,
              error: error.message
            });
            skipCount++;
            console.error(`❌ Row ${rowNum}: ${error.message}`);
          }
        }

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        // Return summary
        res.json({
          success: true,
          message: 'CSV import completed',
          summary: {
            totalRows: results.length,
            successCount,
            skipCount,
            errors: errors.length > 0 ? errors : null
          }
        });
      })
      .on('error', (error) => {
        console.error('❌ CSV parsing error:', error);
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to parse CSV file', details: error.message });
      });

  } catch (error) {
    console.error('❌ Import error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to import equipment', details: error.message });
  }
};

// Preview CSV before import (validation only, no database changes)
export const previewCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const validationErrors = [];
  const importType = req.query.type; // 'users' or 'equipment'

  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Validate based on import type
        for (let i = 0; i < results.length; i++) {
          const row = results[i];
          const rowNum = i + 2;

          if (importType === 'users') {
            if (!row.email || !row.first_name || !row.surname || !row.department) {
              validationErrors.push({
                row: rowNum,
                error: 'Missing required fields'
              });
            }
          } else if (importType === 'equipment') {
            if (!row.product_name || !row.tracking_number || !row.category || !row.department) {
              validationErrors.push({
                row: rowNum,
                error: 'Missing required fields'
              });
            }
          }
        }

        // Delete uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          success: true,
          preview: results.slice(0, 10), // Show first 10 rows
          totalRows: results.length,
          validRows: results.length - validationErrors.length,
          invalidRows: validationErrors.length,
          errors: validationErrors
        });
      })
      .on('error', (error) => {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to parse CSV', details: error.message });
      });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to preview CSV', details: error.message });
  }
};

// Download CSV templates
export const downloadTemplate = (req, res) => {
  const { type } = req.params; // 'users' or 'equipment'

  if (type === 'users') {
    const csvContent = `email,first_name,surname,department,role
student1@student.ncad.ie,John,Doe,COMMUNICATION_DESIGN,student
admin@ncad.ie,Jane,Smith,COMMUNICATION_DESIGN,department_admin
staff@ncad.ie,Mike,Johnson,PRODUCT_DESIGN,staff`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_template.csv');
    res.send(csvContent);

  } else if (type === 'equipment') {
    const csvContent = `product_name,tracking_number,description,category,department,image_url,status
Canon EOS R5,CAM-001,"Professional mirrorless camera",Cameras,COMMUNICATION_DESIGN,https://example.com/image.jpg,available
Sony A7III,CAM-002,"Full-frame camera",Cameras,MEDIA,,available
MacBook Pro 16,LAP-001,"M1 Max laptop for editing",Computing,PRODUCT_DESIGN,,maintenance`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=equipment_template.csv');
    res.send(csvContent);

  } else {
    res.status(400).json({ error: 'Invalid template type. Use "users" or "equipment"' });
  }
};
