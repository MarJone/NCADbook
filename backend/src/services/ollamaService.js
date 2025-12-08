/**
 * Ollama Service - Local LLM integration for NCAD Equipment Booking System
 *
 * Provides:
 * - Text generation (chat, completion)
 * - Vision analysis (equipment condition assessment)
 * - Embeddings for semantic search
 * - Health monitoring and model management
 *
 * Hardware target: RTX 4090 24GB VRAM
 */

import { Ollama } from 'ollama';

// Default Ollama configuration
const DEFAULT_CONFIG = {
  endpoint: 'http://localhost:11434',
  defaultModel: {
    text: 'mistral-small',      // 24B - Primary text model
    vision: 'llava:13b',         // Vision model for condition assessment
    fast: 'llama3.1:8b',         // Fast model for simple tasks
    embedding: 'nomic-embed-text' // Embedding model
  },
  timeout: 120000, // 2 minutes
  maxRetries: 3
};

class OllamaService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ollama = new Ollama({ host: this.config.endpoint });
    this.isHealthy = false;
    this.availableModels = [];
  }

  /**
   * Check if Ollama server is running and responsive
   */
  async healthCheck() {
    try {
      const response = await this.ollama.list();
      this.availableModels = response.models || [];
      this.isHealthy = true;
      return {
        healthy: true,
        models: this.availableModels.map(m => ({
          name: m.name,
          size: m.size,
          modified: m.modified_at
        })),
        endpoint: this.config.endpoint
      };
    } catch (error) {
      this.isHealthy = false;
      return {
        healthy: false,
        error: error.message,
        endpoint: this.config.endpoint
      };
    }
  }

  /**
   * Generate text completion
   *
   * @param {string} prompt - The prompt to complete
   * @param {Object} options - Generation options
   * @param {string} options.model - Model to use (default: fast model)
   * @param {string} options.system - System prompt
   * @param {boolean} options.stream - Stream the response
   * @param {number} options.temperature - Sampling temperature (0-2)
   * @param {number} options.maxTokens - Maximum tokens to generate
   */
  async generate(prompt, options = {}) {
    const model = options.model || this.config.defaultModel.fast;

    try {
      const response = await this.ollama.generate({
        model,
        prompt,
        system: options.system,
        stream: options.stream || false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2048
        }
      });

      return {
        success: true,
        text: response.response,
        model,
        totalDuration: response.total_duration,
        evalCount: response.eval_count
      };
    } catch (error) {
      console.error('[OllamaService] Generate error:', error);
      return {
        success: false,
        error: error.message,
        model
      };
    }
  }

  /**
   * Chat completion with conversation history
   *
   * @param {Array} messages - Array of {role, content} messages
   * @param {Object} options - Chat options
   */
  async chat(messages, options = {}) {
    const model = options.model || this.config.defaultModel.text;

    try {
      const response = await this.ollama.chat({
        model,
        messages,
        stream: options.stream || false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2048
        }
      });

      return {
        success: true,
        message: response.message,
        model,
        totalDuration: response.total_duration
      };
    } catch (error) {
      console.error('[OllamaService] Chat error:', error);
      return {
        success: false,
        error: error.message,
        model
      };
    }
  }

  /**
   * Streaming chat completion with progress callback
   *
   * @param {Array} messages - Conversation messages
   * @param {Function} onProgress - Called with partial responses
   * @param {Object} options - Chat options
   */
  async chatStream(messages, onProgress, options = {}) {
    const model = options.model || this.config.defaultModel.text;

    try {
      const response = await this.ollama.chat({
        model,
        messages,
        stream: true,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 2048
        }
      });

      let fullContent = '';

      for await (const part of response) {
        if (part.message?.content) {
          fullContent += part.message.content;
          onProgress?.({
            content: part.message.content,
            fullContent,
            done: part.done
          });
        }
      }

      return {
        success: true,
        message: { role: 'assistant', content: fullContent },
        model
      };
    } catch (error) {
      console.error('[OllamaService] Chat stream error:', error);
      return {
        success: false,
        error: error.message,
        model
      };
    }
  }

  /**
   * Vision analysis - Analyze image for equipment condition
   *
   * @param {string} imageBase64 - Base64 encoded image
   * @param {string} prompt - Analysis prompt
   * @param {Object} options - Vision options
   */
  async analyzeImage(imageBase64, prompt, options = {}) {
    const model = options.model || this.config.defaultModel.vision;

    try {
      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await this.ollama.generate({
        model,
        prompt,
        images: [cleanBase64],
        stream: false,
        options: {
          temperature: options.temperature || 0.3, // Lower for more consistent analysis
          num_predict: options.maxTokens || 1024
        }
      });

      return {
        success: true,
        analysis: response.response,
        model,
        totalDuration: response.total_duration
      };
    } catch (error) {
      console.error('[OllamaService] Vision error:', error);
      return {
        success: false,
        error: error.message,
        model
      };
    }
  }

  /**
   * Assess equipment condition from photo
   *
   * @param {string} imageBase64 - Base64 encoded equipment photo
   * @param {Object} equipmentInfo - Equipment context (name, previous condition)
   */
  async assessEquipmentCondition(imageBase64, equipmentInfo = {}) {
    const prompt = `You are an equipment condition assessment expert for an academic institution's equipment booking system.

Analyze this image of equipment and provide a JSON assessment.

Equipment Context:
- Name: ${equipmentInfo.name || 'Unknown equipment'}
- Category: ${equipmentInfo.category || 'General'}
- Previous condition: ${equipmentInfo.previousCondition || 'Unknown'}

Analyze the visible condition and respond with ONLY a JSON object (no markdown, no explanation):
{
  "condition_rating": "normal" | "minor_damage" | "major_damage",
  "confidence": 0.0-1.0,
  "visible_issues": ["list of specific issues observed"],
  "affected_components": ["list of affected parts"],
  "recommended_action": "none" | "note" | "maintenance" | "out_of_service",
  "description": "Brief professional description of condition"
}`;

    const result = await this.analyzeImage(imageBase64, prompt, {
      temperature: 0.2 // Very low for consistent structured output
    });

    if (!result.success) {
      return result;
    }

    // Parse JSON response
    try {
      // Extract JSON from response (handle potential markdown wrapping)
      let jsonStr = result.analysis;
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const assessment = JSON.parse(jsonStr);
      return {
        success: true,
        assessment,
        rawAnalysis: result.analysis,
        model: result.model
      };
    } catch (parseError) {
      console.error('[OllamaService] Failed to parse assessment JSON:', parseError);
      return {
        success: true,
        assessment: {
          condition_rating: 'normal',
          confidence: 0.5,
          visible_issues: [],
          affected_components: [],
          recommended_action: 'note',
          description: result.analysis
        },
        rawAnalysis: result.analysis,
        parseError: parseError.message,
        model: result.model
      };
    }
  }

  /**
   * Generate text embeddings for semantic search
   *
   * @param {string|Array} text - Text or array of texts to embed
   */
  async embed(text, options = {}) {
    const model = options.model || this.config.defaultModel.embedding;

    try {
      const response = await this.ollama.embeddings({
        model,
        prompt: Array.isArray(text) ? text.join('\n') : text
      });

      return {
        success: true,
        embedding: response.embedding,
        model
      };
    } catch (error) {
      console.error('[OllamaService] Embed error:', error);
      return {
        success: false,
        error: error.message,
        model
      };
    }
  }

  /**
   * Pull/download a model
   *
   * @param {string} modelName - Model to download
   * @param {Function} onProgress - Progress callback
   */
  async pullModel(modelName, onProgress) {
    try {
      const response = await this.ollama.pull({
        model: modelName,
        stream: true
      });

      for await (const part of response) {
        onProgress?.({
          status: part.status,
          digest: part.digest,
          total: part.total,
          completed: part.completed
        });
      }

      // Refresh available models
      await this.healthCheck();

      return { success: true, model: modelName };
    } catch (error) {
      console.error('[OllamaService] Pull model error:', error);
      return {
        success: false,
        error: error.message,
        model: modelName
      };
    }
  }

  /**
   * List available models
   */
  async listModels() {
    try {
      const response = await this.ollama.list();
      return {
        success: true,
        models: response.models || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        models: []
      };
    }
  }

  /**
   * Delete a model
   *
   * @param {string} modelName - Model to delete
   */
  async deleteModel(modelName) {
    try {
      await this.ollama.delete({ model: modelName });
      await this.healthCheck();
      return { success: true, model: modelName };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        model: modelName
      };
    }
  }

  /**
   * Get model info
   *
   * @param {string} modelName - Model to get info for
   */
  async getModelInfo(modelName) {
    try {
      const response = await this.ollama.show({ model: modelName });
      return {
        success: true,
        info: response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update configuration
   *
   * @param {Object} newConfig - New configuration values
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.endpoint) {
      this.ollama = new Ollama({ host: newConfig.endpoint });
    }
  }
}

// Singleton instance
let ollamaServiceInstance = null;

/**
 * Get or create OllamaService instance
 */
export function getOllamaService(config) {
  if (!ollamaServiceInstance) {
    ollamaServiceInstance = new OllamaService(config);
  }
  return ollamaServiceInstance;
}

export default OllamaService;
