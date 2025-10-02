import emailjs from '@emailjs/browser';

/**
 * Email Notification Service using EmailJS
 *
 * NOTE: Before using in production, you need to:
 * 1. Create a free account at https://www.emailjs.com/
 * 2. Set up email templates for each notification type
 * 3. Update the configuration below with your EmailJS credentials
 */

// EmailJS Configuration
// Replace these with your actual EmailJS credentials
const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',  // From EmailJS dashboard
  publicKey: 'YOUR_PUBLIC_KEY',  // From EmailJS dashboard
  templates: {
    bookingConfirmation: 'template_booking_confirm',
    bookingApproved: 'template_booking_approved',
    bookingDenied: 'template_booking_denied',
    bookingOverdue: 'template_booking_overdue',
    bookingReminder: 'template_booking_reminder',
  }
};

class EmailService {
  constructor() {
    // Initialize EmailJS with public key (only once)
    if (EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(EMAILJS_CONFIG.publicKey);
    }
  }

  /**
   * Check if EmailJS is properly configured
   */
  isConfigured() {
    return EMAILJS_CONFIG.serviceId !== 'YOUR_SERVICE_ID' &&
           EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY';
  }

  /**
   * Send booking confirmation email to student
   * @param {Object} booking - The booking object
   * @param {Object} student - The student user object
   * @param {Array} equipment - Array of equipment items in the booking
   */
  async sendBookingConfirmation(booking, student, equipment) {
    if (!this.isConfigured()) {
      console.warn('EmailJS not configured. Skipping email notification.');
      return { success: false, error: 'EmailJS not configured' };
    }

    try {
      const equipmentList = equipment.map(item => item.product_name).join(', ');

      const templateParams = {
        to_email: student.email,
        to_name: student.full_name,
        booking_id: booking.id,
        equipment_list: equipmentList,
        start_date: new Date(booking.start_date).toLocaleDateString(),
        end_date: new Date(booking.end_date).toLocaleDateString(),
        purpose: booking.purpose || 'N/A',
        status: booking.status,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.bookingConfirmation,
        templateParams
      );

      console.log('Booking confirmation email sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking approval email to student
   * @param {Object} booking - The approved booking object
   * @param {Object} student - The student user object
   * @param {Array} equipment - Array of equipment items
   * @param {Object} admin - The admin who approved
   */
  async sendBookingApproved(booking, student, equipment, admin) {
    if (!this.isConfigured()) {
      console.warn('EmailJS not configured. Skipping email notification.');
      return { success: false, error: 'EmailJS not configured' };
    }

    try {
      const equipmentList = equipment.map(item => item.product_name).join(', ');

      const templateParams = {
        to_email: student.email,
        to_name: student.full_name,
        booking_id: booking.id,
        equipment_list: equipmentList,
        start_date: new Date(booking.start_date).toLocaleDateString(),
        end_date: new Date(booking.end_date).toLocaleDateString(),
        approved_by: admin.full_name,
        approved_at: new Date().toLocaleString(),
        return_instructions: 'Please return equipment on time to avoid late fees.',
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.bookingApproved,
        templateParams
      );

      console.log('Booking approval email sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send booking approval email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking denial email to student
   * @param {Object} booking - The denied booking object
   * @param {Object} student - The student user object
   * @param {Array} equipment - Array of equipment items
   * @param {Object} admin - The admin who denied
   * @param {String} reason - Reason for denial
   */
  async sendBookingDenied(booking, student, equipment, admin, reason) {
    if (!this.isConfigured()) {
      console.warn('EmailJS not configured. Skipping email notification.');
      return { success: false, error: 'EmailJS not configured' };
    }

    try {
      const equipmentList = equipment.map(item => item.product_name).join(', ');

      const templateParams = {
        to_email: student.email,
        to_name: student.full_name,
        booking_id: booking.id,
        equipment_list: equipmentList,
        start_date: new Date(booking.start_date).toLocaleDateString(),
        end_date: new Date(booking.end_date).toLocaleDateString(),
        denied_by: admin.full_name,
        denied_at: new Date().toLocaleString(),
        denial_reason: reason || 'No reason provided',
        support_email: 'equipment@ncad.ie',
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.bookingDenied,
        templateParams
      );

      console.log('Booking denial email sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send booking denial email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send overdue reminder email to student
   * @param {Object} booking - The overdue booking object
   * @param {Object} student - The student user object
   * @param {Array} equipment - Array of equipment items
   * @param {Number} daysOverdue - Number of days overdue
   */
  async sendOverdueReminder(booking, student, equipment, daysOverdue) {
    if (!this.isConfigured()) {
      console.warn('EmailJS not configured. Skipping email notification.');
      return { success: false, error: 'EmailJS not configured' };
    }

    try {
      const equipmentList = equipment.map(item => item.product_name).join(', ');

      const templateParams = {
        to_email: student.email,
        to_name: student.full_name,
        booking_id: booking.id,
        equipment_list: equipmentList,
        end_date: new Date(booking.end_date).toLocaleDateString(),
        days_overdue: daysOverdue,
        late_fee_warning: daysOverdue > 7 ? 'Late fees may apply.' : '',
        return_location: 'Equipment Store, Building A',
        support_email: 'equipment@ncad.ie',
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.bookingOverdue,
        templateParams
      );

      console.log('Overdue reminder email sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send overdue reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking reminder (before pickup date)
   * @param {Object} booking - The booking object
   * @param {Object} student - The student user object
   * @param {Array} equipment - Array of equipment items
   * @param {Number} daysUntilPickup - Days until pickup date
   */
  async sendBookingReminder(booking, student, equipment, daysUntilPickup) {
    if (!this.isConfigured()) {
      console.warn('EmailJS not configured. Skipping email notification.');
      return { success: false, error: 'EmailJS not configured' };
    }

    try {
      const equipmentList = equipment.map(item => item.product_name).join(', ');

      const templateParams = {
        to_email: student.email,
        to_name: student.full_name,
        booking_id: booking.id,
        equipment_list: equipmentList,
        start_date: new Date(booking.start_date).toLocaleDateString(),
        end_date: new Date(booking.end_date).toLocaleDateString(),
        days_until_pickup: daysUntilPickup,
        pickup_location: 'Equipment Store, Building A',
        pickup_hours: 'Mon-Fri: 9am-5pm',
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templates.bookingReminder,
        templateParams
      );

      console.log('Booking reminder email sent:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Failed to send booking reminder email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update EmailJS configuration (for admin settings)
   * @param {Object} config - Configuration object with serviceId, publicKey, templates
   */
  updateConfig(config) {
    if (config.serviceId) EMAILJS_CONFIG.serviceId = config.serviceId;
    if (config.publicKey) {
      EMAILJS_CONFIG.publicKey = config.publicKey;
      emailjs.init(config.publicKey);
    }
    if (config.templates) {
      EMAILJS_CONFIG.templates = { ...EMAILJS_CONFIG.templates, ...config.templates };
    }
  }

  /**
   * Get current configuration (for admin UI)
   */
  getConfig() {
    return {
      serviceId: EMAILJS_CONFIG.serviceId,
      publicKey: EMAILJS_CONFIG.publicKey,
      templates: { ...EMAILJS_CONFIG.templates },
      isConfigured: this.isConfigured()
    };
  }
}

export const emailService = new EmailService();
