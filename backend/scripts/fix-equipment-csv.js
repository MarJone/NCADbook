/**
 * Fix Equipment CSV Script
 * Adds tracking numbers and fixes column names
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputFile = path.join(__dirname, '../MID_Equipment_Import.csv');
const outputFile = path.join(__dirname, '../MID_Equipment_Import_Fixed.csv');

console.log('🔧 Fixing Equipment CSV...\n');

// Read the CSV file
const csvContent = fs.readFileSync(inputFile, 'utf-8');
const lines = csvContent.split('\n');

// Parse header
const oldHeader = lines[0];
console.log('Old Header:', oldHeader);

// New header with tracking_number and link_to_image
const newHeader = 'product_name,tracking_number,description,category,department,status,requires_justification,link_to_image';
console.log('New Header:', newHeader, '\n');

// Process data rows
const newLines = [newHeader];
let trackingCounter = 1;

const categoryPrefixes = {
  'Camera': 'CAM',
  'Lens': 'LENS',
  'Tripod': 'TRIPOD',
  'Microphone': 'MIC',
  'Audio Recorder': 'AUDIO',
  'Lighting': 'LIGHT',
  'Projector': 'PROJ',
  'Headphones': 'HP',
  'Gimbal': 'GIMBAL',
  'Media Player': 'MEDIA',
  '3D Printer': '3DP',
  'Storage': 'STORAGE',
  'Equipment': 'EQUIP',
  'Monitor': 'MON',
  'Audio Equipment': 'AUDIO'
};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Parse CSV line (handle quoted fields)
  const values = parseCSVLine(line);

  if (values.length < 7) {
    console.warn(`Skipping row ${i}: Not enough columns`);
    continue;
  }

  const product_name = values[0];
  const description = values[1];
  const category = values[2];
  const department = values[3];
  const status = values[4];
  const requires_justification = values[5];
  const image_url = values[6]; // Old column (will be link_to_image)

  // Generate tracking number based on category
  const prefix = categoryPrefixes[category] || 'EQUIP';
  const trackingNumber = `MID-${prefix}-${String(trackingCounter).padStart(3, '0')}`;
  trackingCounter++;

  // Create new row
  const newRow = [
    escapeCSV(product_name),
    escapeCSV(trackingNumber),
    escapeCSV(description),
    escapeCSV(category),
    escapeCSV(department),
    escapeCSV(status),
    escapeCSV(requires_justification),
    escapeCSV(image_url)
  ].join(',');

  newLines.push(newRow);
}

// Write fixed CSV
fs.writeFileSync(outputFile, newLines.join('\n'));

console.log(`✅ Fixed CSV written to: ${outputFile}`);
console.log(`📊 Total equipment: ${newLines.length - 1}`);
console.log(`🎯 Tracking numbers: MID-CAM-001 through MID-*-${String(trackingCounter - 1).padStart(3, '0')}\n`);

// Helper functions
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.replace(/^"|"$/g, ''));

  return values;
}

function escapeCSV(value) {
  if (!value) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

console.log('✅ Script complete!');
