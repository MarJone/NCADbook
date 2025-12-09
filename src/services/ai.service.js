/**
 * AI Chat Service
 * Handles AI assistant chat functionality with Ollama backend integration
 */

import { aiChatAPI } from '../utils/api.js';

// System prompt for the equipment booking assistant
const SYSTEM_PROMPT = `You are the NCAD Equipment Booking Assistant, helping students and staff at the National College of Art & Design with equipment-related queries.

Your capabilities:
- Help users find and book equipment (cameras, lenses, audio gear, lighting, etc.)
- Answer questions about booking policies and procedures
- Provide equipment recommendations based on project needs
- Explain return deadlines and extension procedures
- Help troubleshoot booking issues

Guidelines:
- Be helpful, friendly, and concise
- Keep responses under 150 words unless more detail is needed
- Suggest specific equipment when possible
- Always encourage users to check availability in the catalog
- If you don't know something, recommend contacting the equipment office

Key policies:
- Standard loan period: 5 days
- Weekend bookings: Friday loans include Saturday and Sunday
- Late returns: May result in booking restrictions
- High-value items: Require supervisor approval`;

// Demo mode response patterns
const DEMO_RESPONSES = {
  'book': "To book equipment:\n1. Browse the catalog and select items\n2. Choose your pickup and return dates\n3. Add a purpose description (required for high-value items)\n4. Submit for approval\n\nMost bookings are approved within 24 hours!",
  'available': "I can help you check availability! Use the catalog search to filter by category and department. Items showing 'Available' can be booked immediately. Would you like me to explain the status indicators?",
  'recommend': "What type of project are you working on? For example:\n- **Video**: Canon C70, Sony FX6, lighting kits\n- **Photography**: Canon R5, medium format options\n- **Audio**: Zoom recorders, shotgun mics, wireless lavs\n- **Streaming**: Blackmagic ATEM, capture cards",
  'return': "Equipment is due by 5pm on your return date. You can:\n- Drop off at the equipment office\n- Use the self-checkout kiosk (scan QR code)\n- Request an extension through 'My Bookings' if needed\n\nLate returns may affect future booking privileges.",
  'issue': "I'm sorry you're having trouble! For equipment issues:\n1. Document the problem (photo if visible damage)\n2. Contact the equipment office immediately\n3. Don't attempt repairs yourself\n\nFor booking system issues, try refreshing or contact IT support.",
  'extend': "To extend your booking:\n1. Go to 'My Bookings'\n2. Click on the active booking\n3. Select 'Request Extension'\n4. Choose new return date\n\nExtensions are subject to availability and approval.",
  'camera': "We have excellent camera options:\n- **Canon EOS R5** - 45MP, 8K video\n- **Sony FX6** - Cinema camera, great low light\n- **Canon C70** - Documentary favorite\n- **RED Komodo** - High-end cinema (requires training)\n\nWhat's your project type?",
  'audio': "Audio equipment available:\n- **Zoom H6/H8** - Portable recorders\n- **Sennheiser MKH 416** - Industry shotgun mic\n- **Sony UWP-D** - Wireless lav systems\n- **Sound Devices MixPre** - Pro field mixer\n\nWhat are you recording?",
  'default': "I'm here to help with equipment booking! You can ask me about:\n- How to book equipment\n- Equipment recommendations\n- Availability and scheduling\n- Return procedures\n- Troubleshooting issues\n\nWhat would you like to know?"
};

/**
 * Check if we're in demo mode (no backend available)
 */
function isDemoMode() {
  // Demo mode for GitHub Pages or localhost without backend
  const hostname = window.location.hostname;
  return hostname.includes('github.io') ||
         (!hostname.includes('ncad.ie') && !localStorage.getItem('ncadbook_backend_active'));
}

/**
 * Get a demo response based on message content
 */
function getDemoResponse(message) {
  const lowerMessage = message.toLowerCase();

  for (const [key, response] of Object.entries(DEMO_RESPONSES)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }

  return DEMO_RESPONSES.default;
}

/**
 * Send a message to the AI assistant
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<Object>} AI response
 */
export async function sendChatMessage(userMessage, conversationHistory = []) {
  try {
    // In demo mode, use local response patterns
    if (isDemoMode()) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

      const response = getDemoResponse(userMessage);
      return {
        success: true,
        message: response,
        source: 'demo'
      };
    }

    // Build messages array for Ollama
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const result = await aiChatAPI.chat(messages, { stream: false });

    if (result.success && result.message) {
      return {
        success: true,
        message: result.message.content || result.message,
        source: 'ollama'
      };
    }

    // Fallback to demo response if AI fails
    return {
      success: true,
      message: getDemoResponse(userMessage),
      source: 'fallback'
    };
  } catch (error) {
    console.error('[AI Service] Chat error:', error);

    // Return demo response on error
    return {
      success: true,
      message: getDemoResponse(userMessage),
      source: 'fallback'
    };
  }
}

/**
 * Assess equipment condition from a photo
 * @param {string} imageBase64 - Base64 encoded image
 * @param {Object} equipmentInfo - Equipment metadata
 * @returns {Promise<Object>} Condition assessment
 */
export async function assessEquipmentCondition(imageBase64, equipmentInfo = {}) {
  try {
    if (isDemoMode()) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        success: true,
        assessment: {
          condition: 'Good',
          rating: 4,
          issues: [],
          recommendation: 'Equipment appears to be in good working condition.',
          confidence: 0.85
        },
        source: 'demo'
      };
    }

    const result = await aiChatAPI.assessCondition(imageBase64, equipmentInfo);
    return result;
  } catch (error) {
    console.error('[AI Service] Assessment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Query the database using natural language
 * @param {string} question - Natural language question
 * @returns {Promise<Object>} Query results
 */
export async function naturalLanguageQuery(question) {
  try {
    if (isDemoMode()) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        result: {
          sql: 'SELECT * FROM equipment WHERE status = \'available\' LIMIT 10',
          data: [],
          rowCount: 0,
          note: 'Demo mode - no database connection'
        },
        source: 'demo'
      };
    }

    const result = await aiChatAPI.naturalLanguageQuery(question);
    return result;
  } catch (error) {
    console.error('[AI Service] Query error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Check AI service health
 * @returns {Promise<Object>} Status info
 */
export async function checkAIStatus() {
  try {
    if (isDemoMode()) {
      return {
        success: true,
        status: 'demo',
        ollama: { available: false },
        message: 'Running in demo mode'
      };
    }

    const result = await aiChatAPI.getStatus();
    return result;
  } catch (error) {
    return {
      success: false,
      status: 'offline',
      error: error.message
    };
  }
}

export default {
  sendChatMessage,
  assessEquipmentCondition,
  naturalLanguageQuery,
  checkAIStatus,
  isDemoMode
};
