// Booking Template Service - Manages reusable booking templates using localStorage

const TEMPLATE_KEY = 'ncadbook_booking_templates';

class BookingTemplateService {
  /**
   * Get all templates for a user
   * @param {string} userId - User ID
   * @returns {Array} - Array of template objects
   */
  getTemplates(userId) {
    try {
      const stored = localStorage.getItem(`${TEMPLATE_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get templates:', error);
      return [];
    }
  }

  /**
   * Save a new template
   * @param {string} userId - User ID
   * @param {object} template - Template object { name, equipmentIds, duration, purpose }
   * @returns {object} - Saved template with ID
   */
  saveTemplate(userId, template) {
    try {
      const templates = this.getTemplates(userId);
      const newTemplate = {
        id: this.generateId(),
        ...template,
        createdAt: new Date().toISOString()
      };

      templates.push(newTemplate);
      localStorage.setItem(`${TEMPLATE_KEY}_${userId}`, JSON.stringify(templates));

      return newTemplate;
    } catch (error) {
      console.error('Failed to save template:', error);
      throw error;
    }
  }

  /**
   * Update an existing template
   * @param {string} userId - User ID
   * @param {string} templateId - Template ID
   * @param {object} updates - Template updates
   * @returns {boolean} - Success status
   */
  updateTemplate(userId, templateId, updates) {
    try {
      const templates = this.getTemplates(userId);
      const index = templates.findIndex(t => t.id === templateId);

      if (index === -1) {
        return false;
      }

      templates[index] = {
        ...templates[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(`${TEMPLATE_KEY}_${userId}`, JSON.stringify(templates));
      return true;
    } catch (error) {
      console.error('Failed to update template:', error);
      return false;
    }
  }

  /**
   * Delete a template
   * @param {string} userId - User ID
   * @param {string} templateId - Template ID
   * @returns {boolean} - Success status
   */
  deleteTemplate(userId, templateId) {
    try {
      const templates = this.getTemplates(userId);
      const filtered = templates.filter(t => t.id !== templateId);

      localStorage.setItem(`${TEMPLATE_KEY}_${userId}`, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  /**
   * Get a specific template
   * @param {string} userId - User ID
   * @param {string} templateId - Template ID
   * @returns {object|null} - Template object or null
   */
  getTemplate(userId, templateId) {
    const templates = this.getTemplates(userId);
    return templates.find(t => t.id === templateId) || null;
  }

  /**
   * Apply template to create booking
   * @param {object} template - Template object
   * @param {Date} startDate - Start date for booking
   * @returns {object} - Booking data object
   */
  applyTemplate(template, startDate) {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (template.duration || 1));

    return {
      equipmentIds: template.equipmentIds || [],
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      purpose: template.purpose || ''
    };
  }

  /**
   * Create template from existing booking
   * @param {string} userId - User ID
   * @param {object} booking - Booking object
   * @param {string} name - Template name
   * @returns {object} - Created template
   */
  createFromBooking(userId, booking, name) {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const template = {
      name,
      equipmentIds: [booking.equipment_id],
      duration,
      purpose: booking.purpose || ''
    };

    return this.saveTemplate(userId, template);
  }

  /**
   * Get template count for a user
   * @param {string} userId - User ID
   * @returns {number} - Number of templates
   */
  getCount(userId) {
    return this.getTemplates(userId).length;
  }

  /**
   * Clear all templates for a user
   * @param {string} userId - User ID
   */
  clearAll(userId) {
    try {
      localStorage.removeItem(`${TEMPLATE_KEY}_${userId}`);
    } catch (error) {
      console.error('Failed to clear templates:', error);
    }
  }

  /**
   * Generate unique ID for template
   * @returns {string} - Unique ID
   */
  generateId() {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const bookingTemplateService = new BookingTemplateService();
