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

// Email draft templates for demo mode
const EMAIL_TEMPLATES = {
  approval: (data) => ({
    subject: `Equipment Booking Approved - ${data.equipment || 'Your Request'}`,
    body: `Dear ${data.studentName || 'Student'},

We are pleased to confirm that your equipment booking has been approved.

Booking Details:
• Equipment: ${data.equipment || 'N/A'}
• Pickup Date: ${data.startDate ? new Date(data.startDate).toLocaleDateString() : 'N/A'}
• Return Date: ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'N/A'}

Please collect your equipment from the Equipment Store (Building A) during opening hours:
Monday - Friday: 9:00 AM - 5:00 PM

Important Reminders:
• Bring your student ID for verification
• Inspect the equipment before leaving
• Report any issues immediately to staff
• Return equipment on time to avoid penalties

If you have any questions, please contact us at equipment@ncad.ie

Best regards,
NCAD Equipment Office`,
    footer: 'This is an automated message from the NCAD Equipment Booking System.'
  }),

  rejection: (data) => ({
    subject: `Equipment Booking Request - Unable to Approve`,
    body: `Dear ${data.studentName || 'Student'},

We regret to inform you that your equipment booking request could not be approved at this time.

Requested Equipment: ${data.equipment || 'N/A'}

Reason: ${data.reason || 'The requested equipment is not available for the selected dates.'}

What you can do:
• Check availability for alternative dates
• Browse similar equipment that may be available
• Contact the equipment office for alternatives

We apologize for any inconvenience this may cause. Our team is happy to help you find a suitable alternative.

If you believe this decision was made in error, please contact us at equipment@ncad.ie

Best regards,
NCAD Equipment Office`,
    footer: 'This is an automated message from the NCAD Equipment Booking System.'
  }),

  overdue: (data) => ({
    subject: `URGENT: Equipment Overdue - ${data.equipment || 'Return Required'}`,
    body: `Dear ${data.studentName || 'Student'},

This is an urgent reminder that you have equipment that is currently overdue.

Overdue Equipment: ${data.equipment || 'N/A'}
Days Overdue: ${data.daysOverdue || '1'} day(s)

IMPORTANT: Please return this equipment immediately to avoid:
• Booking restrictions on your account
• Late fees (if applicable)
• Impact on your academic standing

Return Location: Equipment Store, Building A
Hours: Monday - Friday, 9:00 AM - 5:00 PM

If you are unable to return the equipment today, please contact us immediately at equipment@ncad.ie to discuss options.

Note: Other students may be waiting for this equipment for their projects.

Best regards,
NCAD Equipment Office`,
    footer: 'This is an automated message from the NCAD Equipment Booking System.'
  }),

  reminder: (data) => ({
    subject: `Reminder: Equipment Pickup - ${data.equipment || 'Tomorrow'}`,
    body: `Dear ${data.studentName || 'Student'},

This is a friendly reminder about your upcoming equipment pickup.

Equipment: ${data.equipment || 'N/A'}
Pickup Date: ${data.pickupDate ? new Date(data.pickupDate).toLocaleDateString() : 'Tomorrow'}

Pickup Location: Equipment Store, Building A
Hours: Monday - Friday, 9:00 AM - 5:00 PM

What to bring:
• Your student ID
• This confirmation email (optional but helpful)

When you arrive:
1. Check in at the equipment counter
2. Verify your booking details
3. Inspect the equipment with staff
4. Sign the equipment log

If you need to cancel or reschedule, please update your booking in the system or contact us at equipment@ncad.ie

Looking forward to seeing you!

Best regards,
NCAD Equipment Office`,
    footer: 'This is an automated message from the NCAD Equipment Booking System.'
  }),

  damage: (data) => ({
    subject: `Equipment Condition Report - ${data.equipment || 'Action Required'}`,
    body: `Dear ${data.studentName || 'Student'},

During the return inspection of your recent equipment loan, our staff identified the following condition issue:

Equipment: ${data.equipment || 'N/A'}

Damage Report:
${data.damageDescription || 'Condition issues were noted during the return inspection.'}

Next Steps:
1. Please review this report and contact us if you have any questions
2. You may be contacted for additional information about how the damage occurred
3. Depending on the assessment, repair costs may be applicable

Important: This report is for documentation purposes. If you noticed any pre-existing damage that was not recorded at checkout, please let us know immediately.

Please contact the equipment office at equipment@ncad.ie or visit us during office hours to discuss this matter.

Best regards,
NCAD Equipment Office`,
    footer: 'This report has been logged in our system for equipment tracking purposes.'
  }),

  strike: (data) => ({
    subject: `Policy Violation Notice - Account Status Update`,
    body: `Dear ${data.studentName || 'Student'},

We are writing to inform you that a policy violation has been recorded on your equipment booking account.

Violation Details:
${data.strikeReason || 'A policy violation was recorded on your account.'}

Current Strike Count: ${data.strikeCount || '1'} of 3

Please be aware of our strike policy:
• 1 Strike: Warning issued
• 2 Strikes: Booking restrictions may apply
• 3 Strikes: Account suspension pending review

How to prevent future violations:
• Return equipment on or before the due date
• Report any issues with equipment immediately
• Follow all equipment handling guidelines
• Communicate proactively if problems arise

If you believe this strike was issued in error, or if you have extenuating circumstances to discuss, please contact the equipment office within 5 working days.

We're here to help you succeed in your projects while maintaining fair access for all students.

Best regards,
NCAD Equipment Office`,
    footer: 'This notice is recorded in accordance with NCAD equipment policies.'
  }),

  extension: (data) => ({
    subject: `Booking Extension Request - ${data.approved === 'Yes' ? 'Approved' : 'Unable to Approve'}`,
    body: data.approved === 'Yes' ? `Dear ${data.studentName || 'Student'},

Great news! Your booking extension request has been approved.

Equipment: ${data.equipment || 'N/A'}
New Return Date: ${data.newEndDate ? new Date(data.newEndDate).toLocaleDateString() : 'As requested'}

Please ensure you return the equipment by the new deadline to maintain your good standing.

Reminder: Extensions are subject to availability and not guaranteed for future requests. Plan your projects accordingly.

If you need further assistance, contact us at equipment@ncad.ie

Best regards,
NCAD Equipment Office` : `Dear ${data.studentName || 'Student'},

We have reviewed your booking extension request and unfortunately cannot approve it at this time.

Equipment: ${data.equipment || 'N/A'}
Requested Extension: ${data.newEndDate ? new Date(data.newEndDate).toLocaleDateString() : 'N/A'}

Reason: The equipment has been reserved by another student for the requested period.

Please return the equipment by your original due date.

If you need the equipment for a longer period in the future, we recommend:
• Booking well in advance
• Checking availability for similar equipment
• Contacting us to discuss alternatives

We apologize for any inconvenience.

Best regards,
NCAD Equipment Office`,
    footer: 'This is an automated message from the NCAD Equipment Booking System.'
  }),

  policy: (data) => ({
    subject: `Important: ${data.policyType || 'Policy'} Update - Action May Be Required`,
    body: `Dear NCAD Students,

We are writing to inform you of an upcoming change to our equipment booking policies.

Policy: ${data.policyType || 'Equipment Booking Policy'}
Effective Date: ${data.effectiveDate ? new Date(data.effectiveDate).toLocaleDateString() : 'Immediately'}

What's Changing:
${data.changes || 'Policy updates have been made to improve the booking experience.'}

What This Means for You:
• Please review the updated policy on our website
• Current bookings will not be affected
• New bookings after the effective date will follow the new policy

Why We're Making This Change:
These updates are designed to ensure fair access to equipment for all students and improve the overall booking experience.

Questions?
If you have any questions about these changes, please contact us at equipment@ncad.ie or visit the equipment office during opening hours.

Thank you for your understanding and cooperation.

Best regards,
NCAD Equipment Office`,
    footer: 'This policy notification is sent to all registered equipment booking users.'
  }),

  custom: (data) => ({
    subject: 'NCAD Equipment Office - Important Information',
    body: `Dear Student,

${data.context || 'We are reaching out regarding your equipment booking account.'}

If you have any questions or need assistance, please don't hesitate to contact us.

Email: equipment@ncad.ie
Location: Equipment Store, Building A
Hours: Monday - Friday, 9:00 AM - 5:00 PM

Best regards,
NCAD Equipment Office`,
    footer: 'This message was sent from the NCAD Equipment Booking System.'
  })
};

/**
 * Generate an email draft using AI
 * @param {string} scenario - The email scenario type
 * @param {Object} data - Context data for the email
 * @returns {Promise<Object>} Generated email with subject and body
 */
export async function generateEmailDraft(scenario, data = {}) {
  try {
    if (isDemoMode()) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

      const template = EMAIL_TEMPLATES[scenario];
      if (!template) {
        return {
          success: false,
          error: `Unknown email scenario: ${scenario}`
        };
      }

      const email = template(data);
      return {
        success: true,
        email: {
          ...email,
          note: 'Demo mode - Generated from templates'
        },
        source: 'demo'
      };
    }

    // Build prompt for LLM
    const prompt = buildEmailPrompt(scenario, data);

    const messages = [
      {
        role: 'system',
        content: `You are a professional email writer for NCAD (National College of Art & Design) equipment booking system.
Write clear, professional, and helpful emails. Be concise but complete.
Always maintain a supportive and helpful tone, even when delivering negative news.
Format your response as JSON with "subject" and "body" fields.`
      },
      { role: 'user', content: prompt }
    ];

    const result = await aiChatAPI.chat(messages, { stream: false });

    if (result.success && result.message) {
      try {
        const content = result.message.content || result.message;
        // Try to parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const email = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            email: {
              subject: email.subject,
              body: email.body,
              footer: 'Generated by AI - Please review before sending.'
            },
            source: 'ollama'
          };
        }
      } catch (parseError) {
        console.warn('[AI Service] Failed to parse email JSON, using fallback');
      }

      // Fallback to template if parsing fails
      const template = EMAIL_TEMPLATES[scenario];
      return {
        success: true,
        email: template ? template(data) : { subject: 'Email Draft', body: result.message.content || result.message },
        source: 'fallback'
      };
    }

    // Use template as fallback
    const template = EMAIL_TEMPLATES[scenario];
    return {
      success: true,
      email: template ? template(data) : { subject: 'Email Draft', body: 'Unable to generate email content.' },
      source: 'fallback'
    };
  } catch (error) {
    console.error('[AI Service] Email draft error:', error);

    // Return demo template on error
    const template = EMAIL_TEMPLATES[scenario];
    if (template) {
      return {
        success: true,
        email: {
          ...template(data),
          note: 'Generated from template (AI unavailable)'
        },
        source: 'fallback'
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Build prompt for email generation
 */
function buildEmailPrompt(scenario, data) {
  const scenarioDescriptions = {
    approval: 'booking approval confirmation',
    rejection: 'booking rejection with reason',
    overdue: 'overdue equipment reminder',
    reminder: 'pickup reminder',
    damage: 'equipment damage report',
    strike: 'policy violation notification',
    extension: 'extension request response',
    policy: 'policy update announcement',
    custom: 'custom communication'
  };

  let prompt = `Write a professional email for: ${scenarioDescriptions[scenario] || scenario}\n\nContext:\n`;

  for (const [key, value] of Object.entries(data)) {
    if (value) {
      prompt += `- ${key}: ${value}\n`;
    }
  }

  prompt += `\nRequirements:
- Professional but friendly tone
- Clear and actionable content
- Include relevant details from context
- Sign off as "NCAD Equipment Office"
- Return as JSON: {"subject": "...", "body": "..."}`;

  return prompt;
}

/**
 * Analyze a booking justification using AI
 * @param {Object} data - Booking context data
 * @param {string} data.purpose - The justification text
 * @param {string} data.equipment - Equipment name
 * @param {string} data.category - Equipment category
 * @param {number} data.duration - Loan duration in days
 * @param {string} data.department - Student's department
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeJustification(data) {
  try {
    if (isDemoMode()) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));

      // Generate demo analysis based on justification quality
      const analysis = generateDemoAnalysis(data);
      return {
        success: true,
        analysis: {
          ...analysis,
          note: 'Demo mode - Analysis based on heuristics'
        },
        source: 'demo'
      };
    }

    // Build prompt for LLM analysis
    const prompt = buildJustificationPrompt(data);

    const messages = [
      {
        role: 'system',
        content: `You are an equipment booking analyst for NCAD (National College of Art & Design).
Analyze student booking justifications and provide structured feedback.
Be fair but thorough. Academic projects should be given appropriate consideration.
Return your analysis as JSON with the following structure:
{
  "score": <number 0-100>,
  "recommendation": "<approve|review|reject>",
  "clarity": <number 0-100>,
  "relevance": <number 0-100>,
  "specificity": <number 0-100>,
  "summary": "<brief analysis summary>",
  "flags": ["<issue1>", "<issue2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"]
}`
      },
      { role: 'user', content: prompt }
    ];

    const result = await aiChatAPI.chat(messages, { stream: false });

    if (result.success && result.message) {
      try {
        const content = result.message.content || result.message;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            analysis: {
              score: analysis.score || 50,
              recommendation: analysis.recommendation || 'review',
              clarity: analysis.clarity || 50,
              relevance: analysis.relevance || 50,
              specificity: analysis.specificity || 50,
              summary: analysis.summary || 'Analysis complete.',
              flags: analysis.flags || [],
              suggestions: analysis.suggestions || []
            },
            source: 'ollama'
          };
        }
      } catch (parseError) {
        console.warn('[AI Service] Failed to parse justification analysis, using fallback');
      }
    }

    // Fallback to demo analysis
    return {
      success: true,
      analysis: generateDemoAnalysis(data),
      source: 'fallback'
    };
  } catch (error) {
    console.error('[AI Service] Justification analysis error:', error);

    // Return demo analysis on error
    return {
      success: true,
      analysis: {
        ...generateDemoAnalysis(data),
        note: 'Generated from heuristics (AI unavailable)'
      },
      source: 'fallback'
    };
  }
}

/**
 * Generate demo analysis based on justification quality heuristics
 */
function generateDemoAnalysis(data) {
  const { purpose, equipment, category, duration, department } = data;
  const purposeLower = purpose.toLowerCase();
  const wordCount = purpose.split(/\s+/).length;

  // Calculate clarity score based on length and detail
  let clarity = 30;
  if (wordCount >= 10) clarity += 20;
  if (wordCount >= 20) clarity += 20;
  if (purpose.includes('.')) clarity += 10;
  if (/project|assignment|exhibition|portfolio|film|documentary|shoot/i.test(purpose)) clarity += 15;
  clarity = Math.min(100, clarity);

  // Calculate relevance based on equipment-purpose match
  let relevance = 50;
  const equipmentLower = equipment.toLowerCase();
  const categoryLower = category.toLowerCase();

  // Check for equipment-purpose relevance
  if (categoryLower.includes('camera') && /photo|video|film|shoot|documentary|footage/i.test(purposeLower)) {
    relevance += 30;
  } else if (categoryLower.includes('audio') && /sound|audio|record|podcast|voice|music/i.test(purposeLower)) {
    relevance += 30;
  } else if (categoryLower.includes('light') && /photo|shoot|studio|product|portrait/i.test(purposeLower)) {
    relevance += 30;
  } else if (categoryLower.includes('computer') && /edit|design|illustration|digital|render/i.test(purposeLower)) {
    relevance += 30;
  } else if (categoryLower.includes('stabilizer') && /video|film|shoot|motion/i.test(purposeLower)) {
    relevance += 30;
  } else if (wordCount < 5) {
    relevance -= 20;
  }

  // Department relevance bonus
  if (department.includes('Moving Image') && /video|film|documentary|camera/i.test(purposeLower)) {
    relevance += 10;
  } else if (department.includes('Graphic') && /photo|design|portfolio/i.test(purposeLower)) {
    relevance += 10;
  } else if (department.includes('Illustration') && /animation|digital|illustration/i.test(purposeLower)) {
    relevance += 10;
  }
  relevance = Math.min(100, Math.max(0, relevance));

  // Calculate specificity
  let specificity = 20;
  if (/final year|degree|exhibition|deadline|assessment/i.test(purposeLower)) specificity += 25;
  if (/portfolio|gallery|screening|presentation/i.test(purposeLower)) specificity += 20;
  if (wordCount >= 15) specificity += 15;
  if (/\d+/.test(purpose)) specificity += 10; // Contains numbers (dates, quantities)
  specificity = Math.min(100, specificity);

  // Calculate overall score
  const score = Math.round((clarity * 0.3 + relevance * 0.4 + specificity * 0.3));

  // Determine recommendation
  let recommendation = 'review';
  if (score >= 70) recommendation = 'approve';
  else if (score < 40) recommendation = 'reject';

  // Generate flags
  const flags = [];
  if (wordCount < 5) flags.push('Very short justification - lacks detail');
  if (wordCount < 10 && !flags.length) flags.push('Brief justification - consider requesting more details');
  if (duration > 7) flags.push(`Extended loan period (${duration} days) - verify necessity`);
  if (relevance < 40) flags.push('Equipment may not match stated purpose');
  if (!/project|assignment|class|course|exhibition/i.test(purposeLower)) {
    flags.push('No clear academic context mentioned');
  }

  // Generate suggestions
  const suggestions = [];
  if (clarity < 50) suggestions.push('Ask student to provide more detail about their project');
  if (relevance < 50) suggestions.push('Confirm this equipment is appropriate for the stated purpose');
  if (specificity < 50) suggestions.push('Request information about project deadline or deliverables');
  if (duration > 7) suggestions.push('Consider if a shorter loan period would suffice');
  if (score >= 70 && flags.length === 0) suggestions.push('Justification appears complete - ready for approval');

  // Generate summary
  let summary = '';
  if (score >= 70) {
    summary = `Well-justified request with clear academic purpose. ${wordCount} words provided explaining the need for ${equipment}. Suitable for approval.`;
  } else if (score >= 50) {
    summary = `Adequate justification but could benefit from more detail. The connection between ${equipment} and the stated purpose is ${relevance >= 50 ? 'reasonable' : 'unclear'}.`;
  } else {
    summary = `Justification lacks sufficient detail. Only ${wordCount} words provided with limited context for why ${equipment} is needed.`;
  }

  return {
    score,
    recommendation,
    clarity,
    relevance,
    specificity,
    summary,
    flags,
    suggestions
  };
}

/**
 * Build prompt for justification analysis
 */
function buildJustificationPrompt(data) {
  return `Analyze this equipment booking justification:

Equipment Requested: ${data.equipment} (${data.category})
Loan Duration: ${data.duration} days
Student Department: ${data.department}

Justification provided by student:
"${data.purpose}"

Evaluate:
1. Clarity - How well does the student explain their need?
2. Relevance - Does the equipment match the stated purpose?
3. Specificity - Are project details (deadline, deliverables, context) provided?

Provide your analysis as JSON with score (0-100), recommendation (approve/review/reject), and detailed breakdown.`;
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
  generateEmailDraft,
  analyzeJustification,
  checkAIStatus,
  isDemoMode
};
