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

/**
 * Get installed models from Ollama
 * @param {string} endpoint - Ollama endpoint URL
 * @returns {Promise<Array>} Array of installed model objects
 */
export async function getInstalledModels(endpoint = 'http://localhost:11434') {
  try {
    const demoMode = !window.location.hostname.includes('ncad.ie');

    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        {
          name: 'mistral:latest',
          displayName: 'Mistral 7B',
          size: '4.1 GB',
          sizeBytes: 4400000000,
          modified: '2024-12-01T10:00:00Z',
          family: 'mistral',
          parameterSize: '7B',
          quantization: 'Q4_0',
          capabilities: ['text', 'chat', 'reasoning'],
          description: 'Fast, efficient general-purpose model'
        },
        {
          name: 'mistral-small:latest',
          displayName: 'Mistral Small',
          size: '2.9 GB',
          sizeBytes: 3100000000,
          modified: '2024-12-01T10:00:00Z',
          family: 'mistral',
          parameterSize: '7B',
          quantization: 'Q3_K_M',
          capabilities: ['text', 'chat'],
          description: 'Smaller, faster Mistral variant'
        },
        {
          name: 'llama3.1:8b',
          displayName: 'Llama 3.1 8B',
          size: '4.7 GB',
          sizeBytes: 5050000000,
          modified: '2024-11-28T15:30:00Z',
          family: 'llama',
          parameterSize: '8B',
          quantization: 'Q4_0',
          capabilities: ['text', 'chat', 'reasoning', 'code'],
          description: 'Latest Llama with improved reasoning'
        },
        {
          name: 'llama3.1:70b',
          displayName: 'Llama 3.1 70B',
          size: '39 GB',
          sizeBytes: 41900000000,
          modified: '2024-11-28T15:30:00Z',
          family: 'llama',
          parameterSize: '70B',
          quantization: 'Q4_0',
          capabilities: ['text', 'chat', 'reasoning', 'code', 'analysis'],
          description: 'Large model for complex tasks'
        },
        {
          name: 'llava:13b',
          displayName: 'LLaVA 13B',
          size: '8.0 GB',
          sizeBytes: 8590000000,
          modified: '2024-11-25T12:00:00Z',
          family: 'llava',
          parameterSize: '13B',
          quantization: 'Q4_0',
          capabilities: ['vision', 'image-analysis', 'text'],
          description: 'Vision model for image analysis'
        },
        {
          name: 'llava:7b',
          displayName: 'LLaVA 7B',
          size: '4.5 GB',
          sizeBytes: 4830000000,
          modified: '2024-11-25T12:00:00Z',
          family: 'llava',
          parameterSize: '7B',
          quantization: 'Q4_0',
          capabilities: ['vision', 'image-analysis', 'text'],
          description: 'Smaller vision model, faster inference'
        },
        {
          name: 'codellama:7b',
          displayName: 'Code Llama 7B',
          size: '3.8 GB',
          sizeBytes: 4080000000,
          modified: '2024-11-20T09:00:00Z',
          family: 'codellama',
          parameterSize: '7B',
          quantization: 'Q4_0',
          capabilities: ['code', 'text'],
          description: 'Specialized for code generation'
        },
        {
          name: 'phi3:mini',
          displayName: 'Phi-3 Mini',
          size: '2.3 GB',
          sizeBytes: 2470000000,
          modified: '2024-11-15T08:00:00Z',
          family: 'phi',
          parameterSize: '3.8B',
          quantization: 'Q4_0',
          capabilities: ['text', 'chat', 'fast'],
          description: 'Very fast, small footprint'
        },
        {
          name: 'gemma2:9b',
          displayName: 'Gemma 2 9B',
          size: '5.4 GB',
          sizeBytes: 5800000000,
          modified: '2024-11-10T14:00:00Z',
          family: 'gemma',
          parameterSize: '9B',
          quantization: 'Q4_0',
          capabilities: ['text', 'chat', 'reasoning'],
          description: 'Google\'s efficient open model'
        },
        {
          name: 'nomic-embed-text:latest',
          displayName: 'Nomic Embed Text',
          size: '274 MB',
          sizeBytes: 287000000,
          modified: '2024-11-05T11:00:00Z',
          family: 'nomic',
          parameterSize: '137M',
          quantization: 'F16',
          capabilities: ['embedding'],
          description: 'Text embedding model for search'
        }
      ];
    }

    const response = await fetch(`${endpoint}/api/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data = await response.json();
    return (data.models || []).map(model => ({
      name: model.name,
      displayName: model.name.replace(/:latest$/, ''),
      size: formatBytes(model.size),
      sizeBytes: model.size,
      modified: model.modified_at,
      family: model.details?.family || 'unknown',
      parameterSize: model.details?.parameter_size || 'unknown',
      quantization: model.details?.quantization_level || 'unknown',
      capabilities: inferCapabilities(model),
      description: model.details?.description || ''
    }));
  } catch (error) {
    console.error('Error fetching installed models:', error);
    return [];
  }
}

function formatBytes(bytes) {
  if (!bytes) return 'Unknown';
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function inferCapabilities(model) {
  const name = model.name.toLowerCase();
  const capabilities = ['text'];

  if (name.includes('llava') || name.includes('vision') || name.includes('bakllava')) {
    capabilities.push('vision', 'image-analysis');
  }
  if (name.includes('code') || name.includes('codellama') || name.includes('deepseek-coder')) {
    capabilities.push('code');
  }
  if (name.includes('embed') || name.includes('nomic')) {
    return ['embedding'];
  }
  if (name.includes('llama3') || name.includes('mistral') || name.includes('gemma')) {
    capabilities.push('chat', 'reasoning');
  }
  if (name.includes('phi') || name.includes('mini') || name.includes('tiny')) {
    capabilities.push('fast');
  }

  return capabilities;
}

/** VRAM presets for GPU configurations */
export const VRAM_PRESETS = [
  { value: 4, label: '4 GB', description: 'Entry-level GPU (GTX 1650, etc.)' },
  { value: 6, label: '6 GB', description: 'Mid-range GPU (GTX 1660, RTX 2060)' },
  { value: 8, label: '8 GB', description: 'Gaming GPU (RTX 3070, RTX 4060)' },
  { value: 12, label: '12 GB', description: 'High-end GPU (RTX 3080, RTX 4070)' },
  { value: 16, label: '16 GB', description: 'Enthusiast GPU (RTX 4080, A4000)' },
  { value: 24, label: '24 GB', description: 'Professional GPU (RTX 4090, A5000)' },
  { value: 48, label: '48 GB', description: 'Workstation GPU (RTX A6000, dual GPU)' },
  { value: 80, label: '80+ GB', description: 'Data center GPU (A100, H100)' }
];

/**
 * Attempt to detect GPU VRAM using WebGL
 * Returns estimated VRAM in GB or null if detection fails
 */
export function detectGPUInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) return { vram: null, renderer: null, detected: false };

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let renderer = 'Unknown GPU';
    let estimatedVram = null;

    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown GPU';

      // Estimate VRAM based on known GPU models
      const gpuLower = renderer.toLowerCase();

      // NVIDIA RTX 40 series
      if (gpuLower.includes('4090')) estimatedVram = 24;
      else if (gpuLower.includes('4080')) estimatedVram = 16;
      else if (gpuLower.includes('4070 ti super')) estimatedVram = 16;
      else if (gpuLower.includes('4070 ti')) estimatedVram = 12;
      else if (gpuLower.includes('4070 super')) estimatedVram = 12;
      else if (gpuLower.includes('4070')) estimatedVram = 12;
      else if (gpuLower.includes('4060 ti')) estimatedVram = 8;
      else if (gpuLower.includes('4060')) estimatedVram = 8;

      // NVIDIA RTX 30 series
      else if (gpuLower.includes('3090')) estimatedVram = 24;
      else if (gpuLower.includes('3080 ti')) estimatedVram = 12;
      else if (gpuLower.includes('3080')) estimatedVram = 10;
      else if (gpuLower.includes('3070 ti')) estimatedVram = 8;
      else if (gpuLower.includes('3070')) estimatedVram = 8;
      else if (gpuLower.includes('3060 ti')) estimatedVram = 8;
      else if (gpuLower.includes('3060')) estimatedVram = 12;

      // NVIDIA RTX 20 series
      else if (gpuLower.includes('2080 ti')) estimatedVram = 11;
      else if (gpuLower.includes('2080 super')) estimatedVram = 8;
      else if (gpuLower.includes('2080')) estimatedVram = 8;
      else if (gpuLower.includes('2070')) estimatedVram = 8;
      else if (gpuLower.includes('2060')) estimatedVram = 6;

      // NVIDIA Quadro/Professional
      else if (gpuLower.includes('a100')) estimatedVram = 80;
      else if (gpuLower.includes('a6000')) estimatedVram = 48;
      else if (gpuLower.includes('a5000')) estimatedVram = 24;
      else if (gpuLower.includes('a4000')) estimatedVram = 16;

      // AMD RX 7000 series
      else if (gpuLower.includes('7900 xtx')) estimatedVram = 24;
      else if (gpuLower.includes('7900 xt')) estimatedVram = 20;
      else if (gpuLower.includes('7800 xt')) estimatedVram = 16;
      else if (gpuLower.includes('7700 xt')) estimatedVram = 12;
      else if (gpuLower.includes('7600')) estimatedVram = 8;

      // AMD RX 6000 series
      else if (gpuLower.includes('6900 xt')) estimatedVram = 16;
      else if (gpuLower.includes('6800 xt')) estimatedVram = 16;
      else if (gpuLower.includes('6800')) estimatedVram = 16;
      else if (gpuLower.includes('6700 xt')) estimatedVram = 12;
      else if (gpuLower.includes('6600')) estimatedVram = 8;

      // Apple Silicon (unified memory - use conservative estimates)
      else if (gpuLower.includes('apple m3 max')) estimatedVram = 48;
      else if (gpuLower.includes('apple m3 pro')) estimatedVram = 18;
      else if (gpuLower.includes('apple m3')) estimatedVram = 8;
      else if (gpuLower.includes('apple m2 ultra')) estimatedVram = 64;
      else if (gpuLower.includes('apple m2 max')) estimatedVram = 32;
      else if (gpuLower.includes('apple m2 pro')) estimatedVram = 16;
      else if (gpuLower.includes('apple m2')) estimatedVram = 8;
      else if (gpuLower.includes('apple m1')) estimatedVram = 8;
    }

    return {
      vram: estimatedVram,
      renderer,
      detected: estimatedVram !== null
    };
  } catch (error) {
    console.error('GPU detection failed:', error);
    return { vram: null, renderer: null, detected: false };
  }
}

/**
 * Get model recommendations based on installed models and VRAM
 * @param {Array} installedModels - Array of installed model objects
 * @param {number} vramGB - Available VRAM in GB (default 8)
 * @returns {Object} Recommended models for each task
 */
export function getModelRecommendations(installedModels, vramGB = 8) {
  const recommendations = { text: null, vision: null, fast: null };

  // Calculate max model size based on VRAM (rough estimate: model needs ~1.2x its size in VRAM)
  const maxModelSizeBytes = (vramGB / 1.2) * 1024 * 1024 * 1024;

  // Filter models that fit in VRAM
  const fittingModels = installedModels.filter(m => m.sizeBytes <= maxModelSizeBytes);

  const textModels = fittingModels.filter(m =>
    m.capabilities.includes('text') && !m.capabilities.includes('embedding')
  );
  const visionModels = fittingModels.filter(m => m.capabilities.includes('vision'));
  const fastModels = fittingModels.filter(m =>
    m.capabilities.includes('text') &&
    !m.capabilities.includes('embedding') &&
    m.sizeBytes < Math.min(5000000000, maxModelSizeBytes)
  );

  if (textModels.length > 0) {
    const scored = textModels.map(m => ({ ...m, score: calculateTextScore(m, vramGB) }))
      .sort((a, b) => b.score - a.score);
    recommendations.text = scored[0];
  }

  if (visionModels.length > 0) {
    const scored = visionModels.map(m => ({ ...m, score: calculateVisionScore(m, vramGB) }))
      .sort((a, b) => b.score - a.score);
    recommendations.vision = scored[0];
  }

  if (fastModels.length > 0) {
    const scored = fastModels.map(m => ({ ...m, score: calculateFastScore(m, vramGB) }))
      .sort((a, b) => b.score - a.score);
    recommendations.fast = scored[0];
  }

  return recommendations;
}

function calculateTextScore(model, vramGB = 8) {
  let score = 50;
  const sizeGB = model.sizeBytes / (1024 * 1024 * 1024);

  // Capability bonuses
  if (model.capabilities.includes('reasoning')) score += 20;
  if (model.capabilities.includes('chat')) score += 10;

  // VRAM-aware size scoring - favor larger models when we have the VRAM
  if (vramGB >= 24) {
    // High VRAM: prefer larger, more capable models
    if (sizeGB >= 30 && sizeGB <= 45) score += 30; // 70B models
    else if (sizeGB >= 8 && sizeGB <= 15) score += 20; // 13B models
    else if (sizeGB >= 4 && sizeGB <= 8) score += 10; // 7-8B models
  } else if (vramGB >= 12) {
    // Medium-high VRAM: prefer 13B models
    if (sizeGB >= 8 && sizeGB <= 12) score += 25;
    else if (sizeGB >= 4 && sizeGB <= 8) score += 15;
  } else if (vramGB >= 8) {
    // Medium VRAM: prefer 7-8B models
    if (sizeGB >= 4 && sizeGB <= 6) score += 20;
    else if (sizeGB >= 3 && sizeGB <= 4) score += 15;
  } else {
    // Low VRAM: prefer smallest models
    if (sizeGB < 3) score += 25;
    else if (sizeGB < 4) score += 15;
  }

  // Model family bonuses
  if (model.family === 'llama' && model.name.includes('3.1')) score += 15;
  if (model.family === 'mistral') score += 10;
  if (model.family === 'gemma') score += 8;

  return score;
}

function calculateVisionScore(model, vramGB = 8) {
  let score = 50;
  const sizeGB = model.sizeBytes / (1024 * 1024 * 1024);

  // VRAM-aware scoring for vision models
  if (vramGB >= 16) {
    // High VRAM: prefer larger vision models
    if (sizeGB >= 8) score += 25;
    else if (sizeGB >= 4) score += 15;
  } else if (vramGB >= 8) {
    // Medium VRAM: balance between quality and fit
    if (sizeGB >= 4 && sizeGB <= 8) score += 20;
    else if (sizeGB < 4) score += 10;
  } else {
    // Low VRAM: prefer smaller vision models
    if (sizeGB < 5) score += 20;
  }

  if (model.family === 'llava') score += 15;
  if (model.parameterSize && model.parameterSize.includes('13')) score += 10;

  return score;
}

function calculateFastScore(model, vramGB = 8) {
  let score = 50;
  const sizeGB = model.sizeBytes / (1024 * 1024 * 1024);

  // Fast model should always be small regardless of VRAM
  if (sizeGB < 3) score += 30;
  else if (sizeGB < 4) score += 20;
  else if (sizeGB < 5) score += 10;

  if (model.capabilities.includes('fast')) score += 25;
  if (model.family === 'phi') score += 20;
  if (model.name.includes('mini')) score += 15;
  if (model.capabilities.includes('chat')) score += 5;

  return score;
}

/**
 * Get VRAM usage estimate for a model configuration
 * @param {Object} models - Selected models { text, vision, fast }
 * @param {Array} installedModels - Array of installed model objects
 * @returns {Object} VRAM usage estimates
 */
export function estimateVRAMUsage(models, installedModels) {
  const usage = { text: 0, vision: 0, fast: 0, total: 0 };

  for (const [task, modelName] of Object.entries(models)) {
    const model = installedModels.find(m => m.name === modelName);
    if (model) {
      // Estimate runtime VRAM as ~1.2x model size
      const vramGB = (model.sizeBytes / (1024 * 1024 * 1024)) * 1.2;
      usage[task] = Math.round(vramGB * 10) / 10;
    }
  }

  // Total assumes only one model runs at a time (typical for Ollama)
  usage.total = Math.max(usage.text, usage.vision, usage.fast);
  usage.maxConcurrent = usage.text + usage.vision; // If running text + vision

  return usage;
}

// Store active download abort controllers
const activeDownloads = new Map();

/**
 * Pull (download) a model from Ollama library
 * @param {string} modelName - Model name to pull (e.g., 'llama3.1:8b')
 * @param {string} endpoint - Ollama endpoint URL
 * @param {Function} onProgress - Progress callback (receives { status, progress, total })
 * @returns {Promise<Object>} Pull result
 */
export async function pullModel(modelName, endpoint = 'http://localhost:11434', onProgress) {
  // Create abort controller for this download
  const abortController = new AbortController();
  activeDownloads.set(modelName, abortController);

  // Track download metrics
  let lastUpdate = Date.now();
  let lastBytes = 0;
  let downloadSpeed = 0;

  try {
    const demoMode = !window.location.hostname.includes('ncad.ie');

    if (demoMode) {
      // Simulate model download with progress updates
      const totalSize = getEstimatedModelSize(modelName);
      let downloaded = 0;
      const chunkSize = totalSize / 50; // 50 progress updates for smoother animation
      const startTime = Date.now();

      for (let i = 0; i <= 50; i++) {
        // Check for cancellation
        if (abortController.signal.aborted) {
          throw new Error('Download cancelled');
        }

        await new Promise(resolve => setTimeout(resolve, 120));
        downloaded = Math.min(chunkSize * i, totalSize);

        // Calculate simulated speed
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = downloaded / elapsed;
        const remaining = totalSize - downloaded;
        const eta = speed > 0 ? Math.round(remaining / speed) : 0;

        if (onProgress) {
          onProgress({
            status: i < 45 ? 'Downloading...' : i < 48 ? 'Verifying...' : 'Complete!',
            completed: downloaded,
            total: totalSize,
            percent: Math.round((downloaded / totalSize) * 100),
            speed: speed,
            eta: eta,
            layer: `Layer ${Math.ceil((i + 1) / 10)} of 5`
          });
        }
      }

      activeDownloads.delete(modelName);
      return { success: true, model: modelName };
    }

    // Real implementation using fetch with streaming
    const response = await fetch(`${endpoint}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName, stream: true }),
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`Failed to pull model: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // Activity timeout - if no progress for 90 seconds, warn but continue
    let activityTimeout;
    const resetActivityTimeout = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        console.warn('Download appears slow - no activity for 90 seconds');
        if (onProgress) {
          onProgress({
            status: 'Downloading (slow)...',
            completed: lastBytes,
            total: 0,
            percent: 0,
            speed: 0,
            eta: -1,
            warning: 'Download may be slow. Large models can take 10-30 minutes.'
          });
        }
      }, 90000);
    };

    resetActivityTimeout();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        clearTimeout(activityTimeout);
        break;
      }

      resetActivityTimeout();

      // Decode and append to buffer (handle partial JSON)
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);

          // Calculate download speed
          const now = Date.now();
          const timeDelta = (now - lastUpdate) / 1000;
          if (timeDelta > 0.5 && data.completed) { // Update speed every 0.5s
            const bytesDelta = (data.completed || 0) - lastBytes;
            downloadSpeed = bytesDelta / timeDelta;
            lastBytes = data.completed || 0;
            lastUpdate = now;
          }

          // Calculate ETA
          const remaining = (data.total || 0) - (data.completed || 0);
          const eta = downloadSpeed > 0 ? Math.round(remaining / downloadSpeed) : -1;

          if (onProgress) {
            // Parse Ollama status messages for better display
            let statusText = data.status || 'Downloading...';
            let layer = '';

            if (statusText.includes('pulling manifest')) {
              statusText = 'Pulling manifest...';
            } else if (statusText.includes('pulling') && statusText.includes(':')) {
              // Extract layer hash
              const match = statusText.match(/pulling ([a-f0-9]+)/i);
              if (match) {
                layer = match[1].substring(0, 12);
                statusText = 'Downloading layer...';
              }
            } else if (statusText.includes('verifying')) {
              statusText = 'Verifying checksum...';
            } else if (statusText.includes('writing')) {
              statusText = 'Writing to disk...';
            } else if (statusText === 'success') {
              statusText = 'Complete!';
            }

            onProgress({
              status: statusText,
              completed: data.completed || 0,
              total: data.total || 0,
              percent: data.total ? Math.round((data.completed / data.total) * 100) : 0,
              speed: downloadSpeed,
              eta: eta,
              layer: layer,
              digest: data.digest
            });
          }
        } catch (e) {
          // Log parse errors for debugging but don't fail
          console.debug('Failed to parse Ollama response line:', line.substring(0, 100));
        }
      }
    }

    activeDownloads.delete(modelName);
    return { success: true, model: modelName };
  } catch (error) {
    activeDownloads.delete(modelName);

    if (error.name === 'AbortError' || error.message === 'Download cancelled') {
      return { success: false, error: 'Download cancelled', cancelled: true };
    }

    console.error('Error pulling model:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel an active model download
 * @param {string} modelName - Model name to cancel
 * @returns {boolean} Whether cancellation was initiated
 */
export function cancelModelDownload(modelName) {
  const controller = activeDownloads.get(modelName);
  if (controller) {
    controller.abort();
    activeDownloads.delete(modelName);
    return true;
  }
  return false;
}

/**
 * Delete a model from Ollama
 * @param {string} modelName - Model name to delete
 * @param {string} endpoint - Ollama endpoint URL
 * @returns {Promise<Object>} Delete result
 */
export async function deleteModel(modelName, endpoint = 'http://localhost:11434') {
  try {
    const demoMode = !window.location.hostname.includes('ncad.ie');

    if (demoMode) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, deleted: modelName };
    }

    const response = await fetch(`${endpoint}/api/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete model: ${response.status}`);
    }

    return { success: true, deleted: modelName };
  } catch (error) {
    console.error('Error deleting model:', error);
    return { success: false, error: error.message };
  }
}

// Helper to estimate model size for demo mode
function getEstimatedModelSize(modelName) {
  const sizes = {
    'phi3:mini': 2.3 * 1024 * 1024 * 1024,
    'gemma2:2b': 1.6 * 1024 * 1024 * 1024,
    'llama3.2:3b': 2.0 * 1024 * 1024 * 1024,
    'mistral:7b': 4.1 * 1024 * 1024 * 1024,
    'llama3.1:8b': 4.7 * 1024 * 1024 * 1024,
    'llava:7b': 4.5 * 1024 * 1024 * 1024,
    'codellama:7b': 3.8 * 1024 * 1024 * 1024,
    'qwen2.5:7b': 4.4 * 1024 * 1024 * 1024,
    'deepseek-coder:6.7b': 3.8 * 1024 * 1024 * 1024,
    'llava:13b': 8.0 * 1024 * 1024 * 1024,
    'llama3.1:70b': 39 * 1024 * 1024 * 1024,
  };
  return sizes[modelName] || 4 * 1024 * 1024 * 1024; // Default 4GB
}

/** Popular models available for download - organized by category */
export const AVAILABLE_MODELS = [
  // ==================== TINY/FAST MODELS (< 3GB) ====================
  {
    name: 'tinyllama:1.1b',
    displayName: 'TinyLlama 1.1B',
    size: '637 MB',
    sizeBytes: 637 * 1024 * 1024,
    description: 'Ultra-lightweight model for basic tasks. Fastest inference.',
    capabilities: ['text', 'chat', 'fast'],
    category: 'fast',
    recommended: ['4GB']
  },
  {
    name: 'gemma2:2b',
    displayName: 'Gemma 2 2B',
    size: '1.6 GB',
    sizeBytes: 1.6 * 1024 * 1024 * 1024,
    description: 'Google\'s tiny but capable model. Great quality for size.',
    capabilities: ['text', 'chat', 'fast'],
    category: 'fast',
    recommended: ['4GB', '6GB']
  },
  {
    name: 'phi3:mini',
    displayName: 'Phi-3 Mini',
    size: '2.3 GB',
    sizeBytes: 2.3 * 1024 * 1024 * 1024,
    description: 'Microsoft\'s ultra-fast 3.8B model. Punches above its weight.',
    capabilities: ['text', 'chat', 'fast', 'reasoning'],
    category: 'fast',
    recommended: ['4GB', '6GB', '8GB']
  },
  {
    name: 'llama3.2:1b',
    displayName: 'Llama 3.2 1B',
    size: '1.3 GB',
    sizeBytes: 1.3 * 1024 * 1024 * 1024,
    description: 'Meta\'s smallest Llama 3.2. Fast and efficient.',
    capabilities: ['text', 'chat', 'fast'],
    category: 'fast',
    recommended: ['4GB', '6GB']
  },
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 3B',
    size: '2.0 GB',
    sizeBytes: 2.0 * 1024 * 1024 * 1024,
    description: 'Meta\'s small model. Excellent quality/speed ratio.',
    capabilities: ['text', 'chat', 'fast', 'reasoning'],
    category: 'fast',
    recommended: ['4GB', '6GB', '8GB']
  },
  {
    name: 'qwen2.5:3b',
    displayName: 'Qwen 2.5 3B',
    size: '1.9 GB',
    sizeBytes: 1.9 * 1024 * 1024 * 1024,
    description: 'Alibaba\'s small model. Good multilingual support.',
    capabilities: ['text', 'chat', 'fast'],
    category: 'fast',
    recommended: ['4GB', '6GB', '8GB']
  },
  {
    name: 'stablelm2:1.6b',
    displayName: 'StableLM 2 1.6B',
    size: '984 MB',
    sizeBytes: 984 * 1024 * 1024,
    description: 'Stability AI\'s compact model. Good for light tasks.',
    capabilities: ['text', 'chat', 'fast'],
    category: 'fast',
    recommended: ['4GB', '6GB']
  },

  // ==================== STANDARD MODELS (3-6GB) ====================
  {
    name: 'mistral:7b',
    displayName: 'Mistral 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Fast, efficient general-purpose model. Great all-rounder.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'llama3.1:8b',
    displayName: 'Llama 3.1 8B',
    size: '4.7 GB',
    sizeBytes: 4.7 * 1024 * 1024 * 1024,
    description: 'Meta\'s latest with improved reasoning and coding.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'llama3.2:latest',
    displayName: 'Llama 3.2 8B',
    size: '4.7 GB',
    sizeBytes: 4.7 * 1024 * 1024 * 1024,
    description: 'Latest Llama with enhanced instruction following.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'qwen2.5:7b',
    displayName: 'Qwen 2.5 7B',
    size: '4.4 GB',
    sizeBytes: 4.4 * 1024 * 1024 * 1024,
    description: 'Alibaba\'s model. Excellent for multilingual and coding.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'gemma2:9b',
    displayName: 'Gemma 2 9B',
    size: '5.4 GB',
    sizeBytes: 5.4 * 1024 * 1024 * 1024,
    description: 'Google\'s mid-size model. Strong reasoning abilities.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'neural-chat:7b',
    displayName: 'Neural Chat 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Intel\'s conversational model. Natural dialogue.',
    capabilities: ['text', 'chat'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'openchat:7b',
    displayName: 'OpenChat 3.5 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Top-performing open chat model. Great for conversations.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'dolphin-mistral:7b',
    displayName: 'Dolphin Mistral 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Uncensored Mistral variant. Helpful and unrestricted.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'yi:6b',
    displayName: 'Yi 6B',
    size: '3.5 GB',
    sizeBytes: 3.5 * 1024 * 1024 * 1024,
    description: '01.AI\'s bilingual model. Strong English and Chinese.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'orca-mini:7b',
    displayName: 'Orca Mini 7B',
    size: '3.8 GB',
    sizeBytes: 3.8 * 1024 * 1024 * 1024,
    description: 'Microsoft research model. Good reasoning for size.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'zephyr:7b',
    displayName: 'Zephyr 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'HuggingFace\'s chat model. Helpful and harmless.',
    capabilities: ['text', 'chat'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'starling-lm:7b',
    displayName: 'Starling LM 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Berkeley\'s RLHF model. High quality responses.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },

  // ==================== LARGE MODELS (6-15GB) ====================
  {
    name: 'llama3.1:13b',
    displayName: 'Llama 3.1 13B',
    size: '7.4 GB',
    sizeBytes: 7.4 * 1024 * 1024 * 1024,
    description: 'Larger Llama for better quality. More nuanced responses.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'large',
    recommended: ['12GB', '16GB']
  },
  {
    name: 'qwen2.5:14b',
    displayName: 'Qwen 2.5 14B',
    size: '8.2 GB',
    sizeBytes: 8.2 * 1024 * 1024 * 1024,
    description: 'Mid-size Qwen. Great balance of speed and quality.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'large',
    recommended: ['12GB', '16GB']
  },
  {
    name: 'mixtral:8x7b',
    displayName: 'Mixtral 8x7B',
    size: '26 GB',
    sizeBytes: 26 * 1024 * 1024 * 1024,
    description: 'Mistral\'s MoE model. State-of-the-art open model.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'large',
    recommended: ['48GB', '80GB']
  },
  {
    name: 'yi:34b',
    displayName: 'Yi 34B',
    size: '19 GB',
    sizeBytes: 19 * 1024 * 1024 * 1024,
    description: '01.AI\'s large model. Excellent reasoning.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'large',
    recommended: ['24GB', '48GB']
  },
  {
    name: 'codellama:13b',
    displayName: 'Code Llama 13B',
    size: '7.4 GB',
    sizeBytes: 7.4 * 1024 * 1024 * 1024,
    description: 'Larger code model. Better completions and analysis.',
    capabilities: ['code', 'text'],
    category: 'large',
    recommended: ['12GB', '16GB']
  },
  {
    name: 'dolphin-mixtral:8x7b',
    displayName: 'Dolphin Mixtral 8x7B',
    size: '26 GB',
    sizeBytes: 26 * 1024 * 1024 * 1024,
    description: 'Uncensored Mixtral. Powerful and unrestricted.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'large',
    recommended: ['48GB', '80GB']
  },
  {
    name: 'nous-hermes2:34b',
    displayName: 'Nous Hermes 2 34B',
    size: '19 GB',
    sizeBytes: 19 * 1024 * 1024 * 1024,
    description: 'Nous Research\'s flagship. Excellent instruction following.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'large',
    recommended: ['24GB', '48GB']
  },
  {
    name: 'wizardlm2:7b',
    displayName: 'WizardLM 2 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Microsoft\'s instruction-tuned model. Strong reasoning.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'standard',
    recommended: ['8GB', '12GB']
  },

  // ==================== EXTRA LARGE MODELS (15GB+) ====================
  {
    name: 'llama3.1:70b',
    displayName: 'Llama 3.1 70B',
    size: '39 GB',
    sizeBytes: 39 * 1024 * 1024 * 1024,
    description: 'Meta\'s largest. Near frontier-level performance.',
    capabilities: ['text', 'chat', 'reasoning', 'code', 'analysis'],
    category: 'xlarge',
    recommended: ['48GB', '80GB']
  },
  {
    name: 'qwen2.5:32b',
    displayName: 'Qwen 2.5 32B',
    size: '18 GB',
    sizeBytes: 18 * 1024 * 1024 * 1024,
    description: 'Alibaba\'s large model. Excellent across all tasks.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'xlarge',
    recommended: ['24GB', '48GB']
  },
  {
    name: 'qwen2.5:72b',
    displayName: 'Qwen 2.5 72B',
    size: '41 GB',
    sizeBytes: 41 * 1024 * 1024 * 1024,
    description: 'Alibaba\'s flagship. Competitive with closed models.',
    capabilities: ['text', 'chat', 'reasoning', 'code', 'analysis'],
    category: 'xlarge',
    recommended: ['48GB', '80GB']
  },
  {
    name: 'command-r:35b',
    displayName: 'Command R 35B',
    size: '20 GB',
    sizeBytes: 20 * 1024 * 1024 * 1024,
    description: 'Cohere\'s RAG-optimized model. Great for search.',
    capabilities: ['text', 'chat', 'reasoning', 'rag'],
    category: 'xlarge',
    recommended: ['24GB', '48GB']
  },
  {
    name: 'command-r-plus:104b',
    displayName: 'Command R+ 104B',
    size: '59 GB',
    sizeBytes: 59 * 1024 * 1024 * 1024,
    description: 'Cohere\'s flagship. Enterprise-grade RAG.',
    capabilities: ['text', 'chat', 'reasoning', 'code', 'rag'],
    category: 'xlarge',
    recommended: ['80GB']
  },
  {
    name: 'codellama:34b',
    displayName: 'Code Llama 34B',
    size: '19 GB',
    sizeBytes: 19 * 1024 * 1024 * 1024,
    description: 'Largest Code Llama. Best for complex code tasks.',
    capabilities: ['code', 'text'],
    category: 'xlarge',
    recommended: ['24GB', '48GB']
  },
  {
    name: 'deepseek-llm:67b',
    displayName: 'DeepSeek LLM 67B',
    size: '37 GB',
    sizeBytes: 37 * 1024 * 1024 * 1024,
    description: 'DeepSeek\'s large model. Strong coding abilities.',
    capabilities: ['text', 'chat', 'reasoning', 'code'],
    category: 'xlarge',
    recommended: ['48GB', '80GB']
  },

  // ==================== VISION MODELS ====================
  {
    name: 'moondream:1.8b',
    displayName: 'Moondream 1.8B',
    size: '1.7 GB',
    sizeBytes: 1.7 * 1024 * 1024 * 1024,
    description: 'Tiny vision model. Fast image understanding.',
    capabilities: ['vision', 'image-analysis', 'text', 'fast'],
    category: 'vision',
    recommended: ['4GB', '6GB', '8GB']
  },
  {
    name: 'llava:7b',
    displayName: 'LLaVA 7B',
    size: '4.5 GB',
    sizeBytes: 4.5 * 1024 * 1024 * 1024,
    description: 'Vision model for image analysis and condition assessment.',
    capabilities: ['vision', 'image-analysis', 'text'],
    category: 'vision',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'llava:13b',
    displayName: 'LLaVA 13B',
    size: '8.0 GB',
    sizeBytes: 8.0 * 1024 * 1024 * 1024,
    description: 'Larger vision model. Better accuracy for damage detection.',
    capabilities: ['vision', 'image-analysis', 'text'],
    category: 'vision',
    recommended: ['12GB', '16GB', '24GB']
  },
  {
    name: 'llava:34b',
    displayName: 'LLaVA 34B',
    size: '19 GB',
    sizeBytes: 19 * 1024 * 1024 * 1024,
    description: 'Largest LLaVA. Most accurate vision analysis.',
    capabilities: ['vision', 'image-analysis', 'text', 'reasoning'],
    category: 'vision',
    recommended: ['24GB', '48GB']
  },
  {
    name: 'bakllava:7b',
    displayName: 'BakLLaVA 7B',
    size: '4.5 GB',
    sizeBytes: 4.5 * 1024 * 1024 * 1024,
    description: 'Enhanced LLaVA variant. Better visual reasoning.',
    capabilities: ['vision', 'image-analysis', 'text'],
    category: 'vision',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'llava-llama3:8b',
    displayName: 'LLaVA Llama3 8B',
    size: '5.5 GB',
    sizeBytes: 5.5 * 1024 * 1024 * 1024,
    description: 'LLaVA with Llama 3 base. Latest vision capabilities.',
    capabilities: ['vision', 'image-analysis', 'text', 'reasoning'],
    category: 'vision',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'minicpm-v:8b',
    displayName: 'MiniCPM-V 8B',
    size: '5.1 GB',
    sizeBytes: 5.1 * 1024 * 1024 * 1024,
    description: 'Efficient vision model. Good for OCR and documents.',
    capabilities: ['vision', 'image-analysis', 'text', 'ocr'],
    category: 'vision',
    recommended: ['8GB', '12GB']
  },

  // ==================== CODE MODELS ====================
  {
    name: 'codellama:7b',
    displayName: 'Code Llama 7B',
    size: '3.8 GB',
    sizeBytes: 3.8 * 1024 * 1024 * 1024,
    description: 'Meta\'s code model. Specialized for code generation.',
    capabilities: ['code', 'text'],
    category: 'code',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'deepseek-coder:6.7b',
    displayName: 'DeepSeek Coder 6.7B',
    size: '3.8 GB',
    sizeBytes: 3.8 * 1024 * 1024 * 1024,
    description: 'Excellent code model with SQL generation capabilities.',
    capabilities: ['code', 'text'],
    category: 'code',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'deepseek-coder:33b',
    displayName: 'DeepSeek Coder 33B',
    size: '18 GB',
    sizeBytes: 18 * 1024 * 1024 * 1024,
    description: 'Large code model. Best for complex programming tasks.',
    capabilities: ['code', 'text', 'reasoning'],
    category: 'code',
    recommended: ['24GB', '48GB']
  },
  {
    name: 'starcoder2:3b',
    displayName: 'StarCoder2 3B',
    size: '1.7 GB',
    sizeBytes: 1.7 * 1024 * 1024 * 1024,
    description: 'BigCode\'s small model. Fast code completion.',
    capabilities: ['code', 'text', 'fast'],
    category: 'code',
    recommended: ['4GB', '6GB', '8GB']
  },
  {
    name: 'starcoder2:7b',
    displayName: 'StarCoder2 7B',
    size: '4.0 GB',
    sizeBytes: 4.0 * 1024 * 1024 * 1024,
    description: 'BigCode\'s medium model. Good code generation.',
    capabilities: ['code', 'text'],
    category: 'code',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'starcoder2:15b',
    displayName: 'StarCoder2 15B',
    size: '9.0 GB',
    sizeBytes: 9.0 * 1024 * 1024 * 1024,
    description: 'BigCode\'s flagship. State-of-the-art open code model.',
    capabilities: ['code', 'text', 'reasoning'],
    category: 'code',
    recommended: ['12GB', '16GB', '24GB']
  },
  {
    name: 'codegemma:7b',
    displayName: 'CodeGemma 7B',
    size: '5.0 GB',
    sizeBytes: 5.0 * 1024 * 1024 * 1024,
    description: 'Google\'s code model. Strong at multiple languages.',
    capabilities: ['code', 'text'],
    category: 'code',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'codestral:22b',
    displayName: 'Codestral 22B',
    size: '12 GB',
    sizeBytes: 12 * 1024 * 1024 * 1024,
    description: 'Mistral\'s code model. Excellent for all programming.',
    capabilities: ['code', 'text', 'reasoning'],
    category: 'code',
    recommended: ['16GB', '24GB']
  },
  {
    name: 'qwen2.5-coder:7b',
    displayName: 'Qwen 2.5 Coder 7B',
    size: '4.4 GB',
    sizeBytes: 4.4 * 1024 * 1024 * 1024,
    description: 'Alibaba\'s code-specialized model. Strong SQL skills.',
    capabilities: ['code', 'text'],
    category: 'code',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'granite-code:8b',
    displayName: 'Granite Code 8B',
    size: '4.6 GB',
    sizeBytes: 4.6 * 1024 * 1024 * 1024,
    description: 'IBM\'s enterprise code model. 116 programming languages.',
    capabilities: ['code', 'text'],
    category: 'code',
    recommended: ['8GB', '12GB']
  },

  // ==================== EMBEDDING MODELS ====================
  {
    name: 'nomic-embed-text:latest',
    displayName: 'Nomic Embed Text',
    size: '274 MB',
    sizeBytes: 274 * 1024 * 1024,
    description: 'Text embedding model for semantic search.',
    capabilities: ['embedding'],
    category: 'embedding',
    recommended: ['4GB', '6GB', '8GB']
  },
  {
    name: 'mxbai-embed-large:latest',
    displayName: 'MixedBread Embed Large',
    size: '669 MB',
    sizeBytes: 669 * 1024 * 1024,
    description: 'High-quality embeddings for search and RAG.',
    capabilities: ['embedding'],
    category: 'embedding',
    recommended: ['4GB', '6GB', '8GB']
  },
  {
    name: 'snowflake-arctic-embed:latest',
    displayName: 'Snowflake Arctic Embed',
    size: '669 MB',
    sizeBytes: 669 * 1024 * 1024,
    description: 'Snowflake\'s embedding model. Enterprise-grade retrieval.',
    capabilities: ['embedding'],
    category: 'embedding',
    recommended: ['4GB', '6GB', '8GB']
  },
  {
    name: 'all-minilm:latest',
    displayName: 'All MiniLM',
    size: '46 MB',
    sizeBytes: 46 * 1024 * 1024,
    description: 'Tiny embedding model. Extremely fast.',
    capabilities: ['embedding'],
    category: 'embedding',
    recommended: ['4GB']
  },

  // ==================== SPECIALIZED MODELS ====================
  {
    name: 'llama3.1:8b-text-q4_0',
    displayName: 'Llama 3.1 8B Text Q4',
    size: '4.7 GB',
    sizeBytes: 4.7 * 1024 * 1024 * 1024,
    description: 'Text-only Llama without chat template. For raw completion.',
    capabilities: ['text'],
    category: 'specialized',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'meditron:7b',
    displayName: 'Meditron 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Medical domain model. Healthcare focused.',
    capabilities: ['text', 'chat', 'medical'],
    category: 'specialized',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'sqlcoder:7b',
    displayName: 'SQLCoder 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Specialized for SQL generation. Best for NL-to-SQL.',
    capabilities: ['code', 'sql'],
    category: 'specialized',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'magicoder:7b',
    displayName: 'Magicoder 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'OSS-Instruct trained. Strong code generation.',
    capabilities: ['code', 'text'],
    category: 'specialized',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'samantha-mistral:7b',
    displayName: 'Samantha Mistral 7B',
    size: '4.1 GB',
    sizeBytes: 4.1 * 1024 * 1024 * 1024,
    description: 'Companion-style model. Empathetic and engaging.',
    capabilities: ['text', 'chat'],
    category: 'specialized',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'solar:10.7b',
    displayName: 'Solar 10.7B',
    size: '6.1 GB',
    sizeBytes: 6.1 * 1024 * 1024 * 1024,
    description: 'Upstage\'s model. Strong Korean and English.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'specialized',
    recommended: ['8GB', '12GB']
  },
  {
    name: 'everythinglm:13b',
    displayName: 'EverythingLM 13B',
    size: '7.4 GB',
    sizeBytes: 7.4 * 1024 * 1024 * 1024,
    description: 'Uncensored 16K context model. Versatile.',
    capabilities: ['text', 'chat', 'reasoning'],
    category: 'specialized',
    recommended: ['12GB', '16GB']
  }
];

/** Model task descriptions for UI */
export const MODEL_TASKS = {
  text: {
    label: 'Text Model',
    description: 'Natural language queries, analytics, email drafting, text generation',
    requiredCapabilities: ['text', 'chat'],
    icon: 'MessageSquare'
  },
  vision: {
    label: 'Vision Model',
    description: 'Damage detection, condition assessment, photo verification',
    requiredCapabilities: ['vision'],
    icon: 'Eye'
  },
  fast: {
    label: 'Fast Model',
    description: 'Quick queries, smart search, justification analysis, real-time features',
    requiredCapabilities: ['text'],
    icon: 'Zap'
  }
};
