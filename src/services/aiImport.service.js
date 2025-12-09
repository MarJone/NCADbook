/**
 * AI Import Service
 * Provides intelligent data analysis and import functionality using local LLM
 */

import { aiChatAPI } from '../utils/api.js';

// Field patterns for detection
const FIELD_PATTERNS = {
  users: {
    email: [/email/i, /e-?mail/i, /mail/i, /student.*email/i],
    full_name: [/full.?name/i, /name/i, /student.?name/i, /display.?name/i],
    first_name: [/first.?name/i, /given.?name/i, /forename/i],
    surname: [/surname/i, /last.?name/i, /family.?name/i],
    department: [/department/i, /dept/i, /course/i, /program/i, /faculty/i],
    role: [/role/i, /type/i, /user.?type/i, /account.?type/i],
    student_id: [/student.?id/i, /id.?number/i, /student.?number/i, /enrollment/i],
    phone: [/phone/i, /mobile/i, /contact/i, /tel/i]
  },
  equipment: {
    product_name: [/product.?name/i, /name/i, /item/i, /equipment/i, /title/i, /model/i],
    tracking_number: [/tracking/i, /track.?id/i, /asset.?id/i, /barcode/i, /inventory/i],
    department: [/department/i, /dept/i, /location/i, /assigned/i],
    category: [/category/i, /type/i, /kind/i, /class/i],
    description: [/description/i, /desc/i, /notes/i, /details/i],
    status: [/status/i, /state/i, /condition/i, /availability/i],
    serial_number: [/serial/i, /serial.?number/i, /sn/i, /s\/n/i],
    location: [/location/i, /room/i, /building/i, /storage/i],
    purchase_date: [/purchase.?date/i, /bought/i, /acquired/i, /date/i]
  }
};

// Sample data patterns that indicate users vs equipment
const DATA_PATTERNS = {
  users: {
    hasEmail: (values) => values.some(v => v && v.includes('@')),
    hasStudentId: (values) => values.some(v => v && /^\d{6,10}$/.test(v)),
    hasName: (values) => values.some(v => v && /^[A-Z][a-z]+ [A-Z]/.test(v))
  },
  equipment: {
    hasTrackingNumber: (values) => values.some(v => v && /^[A-Z]{2,4}[-\s]?\d{3,6}$/i.test(v)),
    hasSerialNumber: (values) => values.some(v => v && /^[A-Z0-9]{8,20}$/i.test(v)),
    hasCategory: (values) => values.some(v => v && /camera|lens|tripod|audio|light/i.test(v))
  }
};

/**
 * Analyze import data to detect type and suggest field mappings
 * @param {Array} headers - Column headers from the file
 * @param {Array} sampleData - Sample rows of data (first 10 rows)
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeImportData(headers, sampleData) {
  // First, try pattern-based detection
  const patternAnalysis = analyzeWithPatterns(headers, sampleData);

  // Then, use AI for more sophisticated analysis
  const aiAnalysis = await analyzeWithAI(headers, sampleData, patternAnalysis);

  // Combine results
  return {
    detectedType: aiAnalysis.detectedType || patternAnalysis.detectedType,
    confidence: aiAnalysis.confidence || patternAnalysis.confidence,
    fieldMappings: aiAnalysis.fieldMappings || patternAnalysis.fieldMappings,
    questions: aiAnalysis.questions || generateQuestions(patternAnalysis),
    explanation: aiAnalysis.explanation || patternAnalysis.explanation
  };
}

/**
 * Pattern-based analysis (fast, works offline)
 */
function analyzeWithPatterns(headers, sampleData) {
  const lowerHeaders = headers.map(h => h.toLowerCase());

  // Score for each type
  let userScore = 0;
  let equipmentScore = 0;
  const fieldMappings = {};

  // Check header patterns
  for (const header of headers) {
    const lowerHeader = header.toLowerCase();

    // Check user patterns
    for (const [field, patterns] of Object.entries(FIELD_PATTERNS.users)) {
      if (patterns.some(p => p.test(header))) {
        userScore += field === 'email' || field === 'full_name' ? 3 : 1;
        if (!fieldMappings[header]) {
          fieldMappings[header] = field;
        }
      }
    }

    // Check equipment patterns
    for (const [field, patterns] of Object.entries(FIELD_PATTERNS.equipment)) {
      if (patterns.some(p => p.test(header))) {
        equipmentScore += field === 'tracking_number' || field === 'product_name' ? 3 : 1;
        if (!fieldMappings[header]) {
          fieldMappings[header] = field;
        }
      }
    }
  }

  // Check data patterns
  if (sampleData.length > 0) {
    // Check for email addresses
    const allValues = sampleData.flatMap(row => Object.values(row));
    const emailValues = allValues.filter(v => v && typeof v === 'string' && v.includes('@'));
    if (emailValues.length > sampleData.length * 0.5) {
      userScore += 5;
    }

    // Check for tracking numbers pattern
    const trackingPattern = /^[A-Z]{2,4}[-\s]?\d{3,6}$/i;
    const trackingValues = allValues.filter(v => v && trackingPattern.test(v));
    if (trackingValues.length > sampleData.length * 0.5) {
      equipmentScore += 5;
    }
  }

  const detectedType = userScore > equipmentScore ? 'users' : 'equipment';
  const confidence = Math.min(95, Math.round((Math.max(userScore, equipmentScore) / (userScore + equipmentScore + 1)) * 100));

  return {
    detectedType,
    confidence,
    fieldMappings,
    explanation: `Detected ${detectedType} based on column headers and data patterns. User indicators: ${userScore}, Equipment indicators: ${equipmentScore}.`
  };
}

/**
 * AI-based analysis using Ollama
 */
async function analyzeWithAI(headers, sampleData, patternAnalysis) {
  const demoMode = !window.location.hostname.includes('ncad.ie');

  if (demoMode) {
    // Simulate AI analysis in demo mode
    await new Promise(resolve => setTimeout(resolve, 2000));

    const questions = generateQuestions(patternAnalysis);

    return {
      ...patternAnalysis,
      questions,
      explanation: `AI analysis confirms this appears to be ${patternAnalysis.detectedType} data. ${
        patternAnalysis.detectedType === 'users'
          ? 'Found email-like columns and name fields.'
          : 'Found equipment tracking and category columns.'
      }`
    };
  }

  try {
    const prompt = buildAnalysisPrompt(headers, sampleData);
    const messages = [
      { role: 'system', content: 'You are a data analysis assistant that helps identify CSV data types and field mappings.' },
      { role: 'user', content: prompt }
    ];

    const response = await aiChatAPI.chat(messages, { stream: false });

    if (response && response.message) {
      return parseAIResponse(response.message, headers, patternAnalysis);
    }
  } catch (error) {
    console.error('AI analysis failed, using pattern analysis:', error);
  }

  // Fallback to pattern analysis
  return {
    ...patternAnalysis,
    questions: generateQuestions(patternAnalysis)
  };
}

/**
 * Build prompt for AI analysis
 */
function buildAnalysisPrompt(headers, sampleData) {
  const sampleStr = sampleData.slice(0, 3).map(row =>
    headers.map(h => `${h}: ${row[h] || 'empty'}`).join(', ')
  ).join('\n');

  return `Analyze this CSV data and determine if it contains USERS or EQUIPMENT.

COLUMNS: ${headers.join(', ')}

SAMPLE DATA:
${sampleStr}

Respond in JSON format:
{
  "type": "users" or "equipment",
  "confidence": 0-100,
  "mappings": {"column_name": "field_name"},
  "missing": ["list of required fields not found"],
  "explanation": "brief explanation"
}

For USERS, required fields are: email, full_name, department, role
For EQUIPMENT, required fields are: product_name, tracking_number, department, category`;
}

/**
 * Parse AI response
 */
function parseAIResponse(text, headers, fallback) {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        detectedType: parsed.type || fallback.detectedType,
        confidence: parsed.confidence || fallback.confidence,
        fieldMappings: parsed.mappings || fallback.fieldMappings,
        questions: generateQuestionsFromMissing(parsed.missing || [], parsed.type || fallback.detectedType),
        explanation: parsed.explanation || fallback.explanation
      };
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
  }

  return fallback;
}

/**
 * Generate questions for missing data
 */
function generateQuestions(analysis) {
  const questions = [];
  const { detectedType, fieldMappings } = analysis;
  const mappedFields = Object.values(fieldMappings);

  if (detectedType === 'users') {
    // Check for missing required fields
    if (!mappedFields.includes('department')) {
      questions.push({
        text: 'No department column was detected. What department should these users be assigned to?',
        field: 'department',
        type: 'select',
        options: ['Moving Image Design', 'Graphic Design', 'Illustration', 'Fine Art', 'Product Design'],
        applyToAll: true,
        hint: 'This will be applied to all imported users.'
      });
    }

    if (!mappedFields.includes('role')) {
      questions.push({
        text: 'No role column was detected. What role should these users have?',
        field: 'role',
        type: 'select',
        options: ['student', 'staff', 'department_admin'],
        defaultValue: 'student',
        applyToAll: true,
        hint: 'Default: student. Select "staff" for faculty members.'
      });
    }

    if (!mappedFields.includes('email') && !mappedFields.includes('full_name')) {
      questions.push({
        text: 'Could not detect email or name columns. Please ensure your file has these columns and re-upload.',
        type: 'info',
        critical: true
      });
    }
  } else if (detectedType === 'equipment') {
    if (!mappedFields.includes('department')) {
      questions.push({
        text: 'No department column was detected. Which department owns this equipment?',
        field: 'department',
        type: 'select',
        options: ['Moving Image Design', 'Graphic Design', 'Illustration', 'Fine Art', 'Product Design', 'Shared'],
        applyToAll: true
      });
    }

    if (!mappedFields.includes('category')) {
      questions.push({
        text: 'No category column was detected. What category is this equipment?',
        field: 'category',
        type: 'select',
        options: ['Camera', 'Lens', 'Lighting', 'Audio', 'Tripod', 'Accessory', 'Computer', 'Other'],
        applyToAll: true
      });
    }

    if (!mappedFields.includes('status')) {
      questions.push({
        text: 'No status column was detected. What should be the default status?',
        field: 'status',
        type: 'select',
        options: ['available', 'maintenance', 'out_of_service'],
        defaultValue: 'available',
        applyToAll: true
      });
    }
  }

  return questions;
}

/**
 * Generate questions from AI-detected missing fields
 */
function generateQuestionsFromMissing(missingFields, detectedType) {
  const questions = [];

  for (const field of missingFields) {
    const fieldLower = field.toLowerCase();

    if (fieldLower.includes('department')) {
      questions.push({
        text: `Missing ${field}. Which department should be assigned?`,
        field: 'department',
        type: 'select',
        options: ['Moving Image Design', 'Graphic Design', 'Illustration', 'Fine Art', 'Product Design'],
        applyToAll: true
      });
    } else if (fieldLower.includes('role')) {
      questions.push({
        text: `Missing ${field}. What role should users have?`,
        field: 'role',
        type: 'select',
        options: ['student', 'staff', 'department_admin'],
        defaultValue: 'student',
        applyToAll: true
      });
    } else if (fieldLower.includes('category')) {
      questions.push({
        text: `Missing ${field}. What category is this equipment?`,
        field: 'category',
        type: 'select',
        options: ['Camera', 'Lens', 'Lighting', 'Audio', 'Tripod', 'Accessory', 'Computer', 'Other'],
        applyToAll: true
      });
    } else if (fieldLower.includes('status')) {
      questions.push({
        text: `Missing ${field}. What should be the default status?`,
        field: 'status',
        type: 'select',
        options: ['available', 'maintenance', 'out_of_service'],
        defaultValue: 'available',
        applyToAll: true
      });
    }
  }

  return questions;
}

/**
 * Perform the actual import
 * @param {string} dataType - 'users' or 'equipment'
 * @param {Array} data - Array of mapped data objects
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Import results
 */
export async function performAIImport(dataType, data, onProgress) {
  const demoMode = !window.location.hostname.includes('ncad.ie');

  if (demoMode) {
    // Simulate import in demo mode
    const total = data.length;
    let imported = 0;
    let errors = 0;

    for (let i = 0; i < total; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      imported++;
      onProgress(Math.round((i + 1) / total * 100));
    }

    // Store in localStorage for demo persistence
    const storageKey = dataType === 'users' ? 'ncadbook_imported_users' : 'ncadbook_imported_equipment';
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    localStorage.setItem(storageKey, JSON.stringify([...existing, ...data]));

    return {
      success: true,
      imported,
      skipped: 0,
      errors,
      total
    };
  }

  // Real API import
  try {
    const response = await fetch(`/api/${dataType}/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });

    if (!response.ok) {
      throw new Error(`Import failed: ${response.status}`);
    }

    const result = await response.json();
    onProgress(100);

    return result;
  } catch (error) {
    console.error('Import failed:', error);
    throw error;
  }
}

/**
 * Validate a single row of data
 * @param {Object} row - Data row
 * @param {string} dataType - 'users' or 'equipment'
 * @returns {Array} Array of validation errors
 */
export function validateRow(row, dataType) {
  const errors = [];
  const requiredFields = {
    users: ['email', 'full_name', 'department', 'role'],
    equipment: ['product_name', 'tracking_number', 'department', 'category']
  };

  // Check required fields
  for (const field of requiredFields[dataType] || []) {
    if (!row[field] || row[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type-specific validation
  if (dataType === 'users') {
    if (row.email && !row.email.includes('@')) {
      errors.push('Invalid email format');
    }
    if (row.role && !['student', 'staff', 'department_admin', 'master_admin'].includes(row.role.toLowerCase())) {
      errors.push(`Invalid role: ${row.role}`);
    }
  }

  if (dataType === 'equipment') {
    if (row.status && !['available', 'booked', 'maintenance', 'out_of_service'].includes(row.status.toLowerCase())) {
      errors.push(`Invalid status: ${row.status}`);
    }
  }

  return errors;
}

/**
 * Get suggested field mapping for a header
 * @param {string} header - Column header
 * @param {string} dataType - 'users' or 'equipment'
 * @returns {string|null} Suggested field name or null
 */
export function suggestFieldMapping(header, dataType) {
  const patterns = FIELD_PATTERNS[dataType] || {};

  for (const [field, fieldPatterns] of Object.entries(patterns)) {
    if (fieldPatterns.some(p => p.test(header))) {
      return field;
    }
  }

  return null;
}
