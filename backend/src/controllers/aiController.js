/**
 * AI Controller - Handles AI-related API endpoints
 *
 * Endpoints:
 * - Health check and status
 * - Chat completions
 * - Vision analysis
 * - Model management
 */

import { getOllamaService } from '../services/ollamaService.js';
import { query } from '../config/database.js';

// Get AI settings from database
async function getAISettings() {
  try {
    const result = await query('SELECT setting_key, setting_value FROM ai_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  } catch (error) {
    console.error('[AI Controller] Failed to get AI settings:', error);
    return {};
  }
}

// Update AI setting in database
async function updateAISetting(key, value, userId) {
  try {
    await query(
      `INSERT INTO ai_settings (setting_key, setting_value, modified_by, modified_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (setting_key)
       DO UPDATE SET setting_value = $2, modified_by = $3, modified_at = NOW()`,
      [key, JSON.stringify(value), userId]
    );
    return true;
  } catch (error) {
    console.error('[AI Controller] Failed to update AI setting:', error);
    return false;
  }
}

/**
 * GET /api/ai/status
 * Check Ollama health and available models
 */
export async function getStatus(req, res) {
  try {
    const ollama = getOllamaService();
    const health = await ollama.healthCheck();
    const settings = await getAISettings();

    res.json({
      success: true,
      ollama: health,
      settings: {
        ollama_enabled: settings.ollama_enabled,
        default_model: settings.default_model,
        cloud_fallback: settings.cloud_fallback
      }
    });
  } catch (error) {
    console.error('[AI Controller] Status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/ai/chat
 * General AI chat completion
 */
export async function chat(req, res) {
  try {
    const { messages, model, stream } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Messages array is required'
      });
    }

    const ollama = getOllamaService();

    // Check if streaming is requested
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const result = await ollama.chatStream(messages, (progress) => {
        res.write(`data: ${JSON.stringify(progress)}\n\n`);
      }, { model });

      res.write(`data: ${JSON.stringify({ done: true, ...result })}\n\n`);
      res.end();
    } else {
      const result = await ollama.chat(messages, { model });
      res.json(result);
    }
  } catch (error) {
    console.error('[AI Controller] Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/ai/generate
 * Simple text generation
 */
export async function generate(req, res) {
  try {
    const { prompt, system, model, maxTokens, temperature } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const ollama = getOllamaService();
    const result = await ollama.generate(prompt, {
      system,
      model,
      maxTokens,
      temperature
    });

    res.json(result);
  } catch (error) {
    console.error('[AI Controller] Generate error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/ai/assess-condition
 * Assess equipment condition from photo
 */
export async function assessCondition(req, res) {
  try {
    const { image, equipmentInfo } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'Image (base64) is required'
      });
    }

    const ollama = getOllamaService();

    // Send progress update
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    res.write(`data: ${JSON.stringify({ stage: 'analyzing', progress: 20 })}\n\n`);

    const result = await ollama.assessEquipmentCondition(image, equipmentInfo || {});

    res.write(`data: ${JSON.stringify({ stage: 'complete', progress: 100, result })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[AI Controller] Assess condition error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/ai/query
 * Natural language database query (Text-to-SQL)
 */
export async function naturalLanguageQuery(req, res) {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: 'Question is required'
      });
    }

    // Get database schema context
    const schemaContext = `
You are a SQL query generator for a PostgreSQL database. The database has these tables:

USERS: id, email, first_name, surname, full_name, role, department, strike_count, created_at
EQUIPMENT: id, product_name, tracking_number, description, category, department, status, created_at
BOOKINGS: id, user_id, equipment_id, start_date, end_date, purpose, status, approved_by, created_at
EQUIPMENT_NOTES: id, equipment_id, note_type, note_content, created_by, created_at
BOOKING_VERIFICATIONS: id, booking_id, verification_type, condition_rating, verified_at

Valid booking statuses: pending, approved, denied, returned, overdue, checked_out, completed
Valid equipment statuses: available, booked, maintenance, out_of_service
Valid user roles: student, staff, department_admin, master_admin

Generate ONLY a PostgreSQL query that answers the user's question. Return ONLY the SQL, no explanation.
`;

    const ollama = getOllamaService();

    // Use streaming for progress
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    res.write(`data: ${JSON.stringify({ stage: 'parsing', progress: 10 })}\n\n`);

    // Generate SQL query
    const sqlResult = await ollama.generate(question, {
      system: schemaContext,
      model: 'qwen2.5:32b', // Use more capable model for SQL
      temperature: 0.1 // Low temperature for deterministic SQL
    });

    if (!sqlResult.success) {
      res.write(`data: ${JSON.stringify({ stage: 'error', error: sqlResult.error })}\n\n`);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ stage: 'generating_sql', progress: 40 })}\n\n`);

    // Extract SQL from response
    let sql = sqlResult.text.trim();

    // Clean up SQL (remove markdown code blocks if present)
    sql = sql.replace(/```sql\n?/gi, '').replace(/```\n?/gi, '').trim();

    // Basic SQL validation
    const dangerousPatterns = /\b(DROP|DELETE|TRUNCATE|ALTER|INSERT|UPDATE|CREATE|GRANT|REVOKE)\b/i;
    if (dangerousPatterns.test(sql)) {
      res.write(`data: ${JSON.stringify({
        stage: 'error',
        error: 'Query contains potentially dangerous operations. Only SELECT queries are allowed.'
      })}\n\n`);
      res.end();
      return;
    }

    // Ensure it's a SELECT query
    if (!sql.toUpperCase().startsWith('SELECT')) {
      res.write(`data: ${JSON.stringify({
        stage: 'error',
        error: 'Only SELECT queries are allowed for security reasons.'
      })}\n\n`);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ stage: 'executing', progress: 70, sql })}\n\n`);

    // Execute the query
    try {
      const queryResult = await query(sql);

      res.write(`data: ${JSON.stringify({ stage: 'formatting', progress: 90 })}\n\n`);

      res.write(`data: ${JSON.stringify({
        stage: 'complete',
        progress: 100,
        result: {
          success: true,
          sql,
          data: queryResult.rows,
          rowCount: queryResult.rowCount
        }
      })}\n\n`);
    } catch (queryError) {
      res.write(`data: ${JSON.stringify({
        stage: 'error',
        error: `Query execution failed: ${queryError.message}`,
        sql
      })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('[AI Controller] NL Query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/ai/models
 * List available Ollama models
 */
export async function listModels(req, res) {
  try {
    const ollama = getOllamaService();
    const result = await ollama.listModels();
    res.json(result);
  } catch (error) {
    console.error('[AI Controller] List models error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * POST /api/ai/models/pull
 * Download a new model
 */
export async function pullModel(req, res) {
  try {
    const { model } = req.body;

    if (!model) {
      return res.status(400).json({
        success: false,
        error: 'Model name is required'
      });
    }

    const ollama = getOllamaService();

    // Stream progress
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    const result = await ollama.pullModel(model, (progress) => {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ done: true, ...result })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[AI Controller] Pull model error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * DELETE /api/ai/models/:name
 * Delete a model
 */
export async function deleteModel(req, res) {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Model name is required'
      });
    }

    const ollama = getOllamaService();
    const result = await ollama.deleteModel(name);
    res.json(result);
  } catch (error) {
    console.error('[AI Controller] Delete model error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * GET /api/ai/settings
 * Get AI settings
 */
export async function getSettings(req, res) {
  try {
    const settings = await getAISettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('[AI Controller] Get settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * PUT /api/ai/settings
 * Update AI settings
 */
export async function updateSettings(req, res) {
  try {
    const { settings } = req.body;
    const userId = req.user?.id;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Settings object is required'
      });
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await updateAISetting(key, value, userId);
    }

    // Refresh Ollama service config if endpoint changed
    if (settings.ollama_enabled?.endpoint) {
      const ollama = getOllamaService();
      ollama.updateConfig({ endpoint: settings.ollama_enabled.endpoint });
    }

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('[AI Controller] Update settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export default {
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
};
