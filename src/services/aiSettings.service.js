/**
 * AI Settings Service
 * Manages AI configuration (Ollama, models, cloud fallback)
 */

import { aiSettingsAPI } from '../utils/api.js';

/**
 * Get all AI settings
 * @returns {Promise<Array>} All AI settings
 */
export async function getAllAISettings() {
  try {
    // Demo mode: return mock settings
    const demoMode = !window.location.hostname.includes('ncad.ie');

    if (demoMode) {
      return [
        {
          id: 1,
          setting_key: 'ollama_enabled',
          setting_value: { enabled: true, endpoint: 'http://localhost:11434' },
          description: 'Ollama local LLM configuration',
          modified_by: 1,
          modified_at: new Date().toISOString()
        },
        {
          id: 2,
          setting_key: 'default_model',
          setting_value: { text: 'mistral-small', vision: 'llava:13b', fast: 'llama3.1:8b' },
          description: 'Default models for different tasks',
          modified_by: 1,
          modified_at: new Date().toISOString()
        },
        {
          id: 3,
          setting_key: 'cloud_fallback',
          setting_value: { enabled: false, provider: null, api_key: null },
          description: 'Cloud API fallback configuration',
          modified_by: 1,
          modified_at: new Date().toISOString()
        },
        {
          id: 4,
          setting_key: 'batch_schedule',
          setting_value: { anomaly_detection: '02:00', demand_forecast: '03:00', maintenance_schedule: '04:00' },
          description: 'Batch job schedule (24h format)',
          modified_by: 1,
          modified_at: new Date().toISOString()
        }
      ];
    }

    const response = await aiSettingsAPI.getAll();
    return response.settings || [];
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    // Return demo data as fallback
    return [
      {
        id: 1,
        setting_key: 'ollama_enabled',
        setting_value: { enabled: true, endpoint: 'http://localhost:11434' },
        description: 'Ollama local LLM configuration',
        modified_by: 1,
        modified_at: new Date().toISOString()
      },
      {
        id: 2,
        setting_key: 'default_model',
        setting_value: { text: 'mistral-small', vision: 'llava:13b', fast: 'llama3.1:8b' },
        description: 'Default models for different tasks',
        modified_by: 1,
        modified_at: new Date().toISOString()
      },
      {
        id: 3,
        setting_key: 'cloud_fallback',
        setting_value: { enabled: false, provider: null, api_key: null },
        description: 'Cloud API fallback configuration',
        modified_by: 1,
        modified_at: new Date().toISOString()
      },
      {
        id: 4,
        setting_key: 'batch_schedule',
        setting_value: { anomaly_detection: '02:00', demand_forecast: '03:00', maintenance_schedule: '04:00' },
        description: 'Batch job schedule (24h format)',
        modified_by: 1,
        modified_at: new Date().toISOString()
      }
    ];
  }
}

/**
 * Get a specific AI setting by key
 * @param {string} key - Setting key
 * @returns {Promise<Object>} Setting object
 */
export async function getAISetting(key) {
  try {
    const response = await aiSettingsAPI.getByKey(key);
    return response.setting;
  } catch (error) {
    console.error('Error fetching AI setting:', error);
    throw error;
  }
}

/**
 * Update an AI setting (master admin only)
 * @param {string} key - Setting key
 * @param {Object} value - Setting value (will be stored as JSONB)
 * @param {number} modifiedBy - User ID making the change
 * @returns {Promise<Object>} Updated setting
 */
export async function updateAISetting(key, value, modifiedBy) {
  try {
    // Demo mode: just store in localStorage
    const demoMode = !window.location.hostname.includes('ncad.ie');

    if (demoMode) {
      const settings = JSON.parse(localStorage.getItem('ncadbook_ai_settings') || '{}');
      settings[key] = {
        value,
        modified_by: modifiedBy,
        modified_at: new Date().toISOString()
      };
      localStorage.setItem('ncadbook_ai_settings', JSON.stringify(settings));

      return {
        setting_key: key,
        setting_value: value,
        modified_by: modifiedBy,
        modified_at: new Date().toISOString()
      };
    }

    const response = await aiSettingsAPI.update(key, value, modifiedBy);
    return response.setting;
  } catch (error) {
    console.error('Error updating AI setting:', error);
    // In demo mode, still return success
    const demoMode = !window.location.hostname.includes('ncad.ie');
    if (demoMode) {
      const settings = JSON.parse(localStorage.getItem('ncadbook_ai_settings') || '{}');
      settings[key] = {
        value,
        modified_by: modifiedBy,
        modified_at: new Date().toISOString()
      };
      localStorage.setItem('ncadbook_ai_settings', JSON.stringify(settings));

      return {
        setting_key: key,
        setting_value: value,
        modified_by: modifiedBy,
        modified_at: new Date().toISOString()
      };
    }
    throw error;
  }
}

/**
 * Test Ollama connection
 * @param {string} endpoint - Ollama endpoint URL
 * @returns {Promise<Object>} Connection test result
 */
export async function testOllamaConnection(endpoint) {
  try {
    // Demo mode: simulate connection test
    const demoMode = !window.location.hostname.includes('ncad.ie');

    if (demoMode) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate success if localhost, otherwise fail
      if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
        return {
          success: true,
          modelCount: 5,
          models: ['mistral-small', 'llava:13b', 'llama3.1:8b', 'llama2', 'codellama']
        };
      } else {
        return {
          success: false,
          error: 'Cannot connect to Ollama at ' + endpoint
        };
      }
    }

    const response = await aiSettingsAPI.testConnection(endpoint);
    return response;
  } catch (error) {
    console.error('Error testing Ollama connection:', error);
    return {
      success: false,
      error: error.message || 'Connection test failed'
    };
  }
}

/**
 * Check if Ollama is enabled
 * @returns {Promise<boolean>}
 */
export async function isOllamaEnabled() {
  try {
    const setting = await getAISetting('ollama_enabled');
    return setting?.setting_value?.enabled === true;
  } catch (error) {
    console.error('Error checking Ollama status:', error);
    return false;
  }
}

/**
 * Get the configured Ollama endpoint
 * @returns {Promise<string>}
 */
export async function getOllamaEndpoint() {
  try {
    const setting = await getAISetting('ollama_enabled');
    return setting?.setting_value?.endpoint || 'http://localhost:11434';
  } catch (error) {
    console.error('Error getting Ollama endpoint:', error);
    return 'http://localhost:11434';
  }
}

/**
 * Get default models configuration
 * @returns {Promise<Object>}
 */
export async function getDefaultModels() {
  try {
    const setting = await getAISetting('default_model');
    return setting?.setting_value || {
      text: 'mistral-small',
      vision: 'llava:13b',
      fast: 'llama3.1:8b'
    };
  } catch (error) {
    console.error('Error getting default models:', error);
    return {
      text: 'mistral-small',
      vision: 'llava:13b',
      fast: 'llama3.1:8b'
    };
  }
}
