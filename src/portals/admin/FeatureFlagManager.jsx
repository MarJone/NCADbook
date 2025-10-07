import { useState, useEffect } from 'react';
import { systemSettingsAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { emailService } from '../../services/email.service';

export default function FeatureFlagManager() {
  const { user } = useAuth();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailConfig, setEmailConfig] = useState({
    serviceId: '',
    publicKey: '',
    templateConfirm: '',
    templateApproved: '',
    templateDenied: '',
    templateOverdue: '',
    templateReminder: ''
  });
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailTestStatus, setEmailTestStatus] = useState('');

  useEffect(() => {
    loadFlags();
    loadEmailConfig();
  }, []);

  const loadFlags = async () => {
    try {
      const response = await systemSettingsAPI.getAll();
      const settings = response.settings || [];
      // Convert settings to flag format for the UI
      const flagsData = settings.map(setting => ({
        id: setting.key,
        name: setting.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        key: setting.key,
        enabled: setting.value === true || setting.value === 'true',
        description: setting.description || ''
      }));
      setFlags(flagsData);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmailConfig = () => {
    const config = emailService.getConfig();
    setEmailConfig({
      serviceId: config.serviceId,
      publicKey: config.publicKey,
      templateConfirm: config.templates.bookingConfirmation,
      templateApproved: config.templates.bookingApproved,
      templateDenied: config.templates.bookingDenied,
      templateOverdue: config.templates.bookingOverdue,
      templateReminder: config.templates.bookingReminder
    });
  };

  const handleSaveEmailConfig = () => {
    if (user.role !== 'master_admin') {
      alert('Only master admins can update email configuration');
      return;
    }

    emailService.updateConfig({
      serviceId: emailConfig.serviceId,
      publicKey: emailConfig.publicKey,
      templates: {
        bookingConfirmation: emailConfig.templateConfirm,
        bookingApproved: emailConfig.templateApproved,
        bookingDenied: emailConfig.templateDenied,
        bookingOverdue: emailConfig.templateOverdue,
        bookingReminder: emailConfig.templateReminder
      }
    });

    alert('Email configuration saved successfully!');
    setShowEmailConfig(false);
  };

  const handleTestEmail = async (type) => {
    setEmailTestStatus(`Testing ${type} email...`);

    const testBooking = {
      id: 'TEST123',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000 * 3).toISOString(),
      purpose: 'Test booking for email verification'
    };

    const testEquipment = [{ product_name: 'Test Equipment (Canon EOS R5)' }];

    try {
      let result;
      switch (type) {
        case 'confirmation':
          result = await emailService.sendBookingConfirmation(testBooking, user, testEquipment);
          break;
        case 'approved':
          result = await emailService.sendBookingApproved(testBooking, user, testEquipment, user);
          break;
        case 'denied':
          result = await emailService.sendBookingDenied(testBooking, user, testEquipment, user, 'Test denial reason');
          break;
        case 'overdue':
          result = await emailService.sendOverdueReminder(testBooking, user, testEquipment, 3);
          break;
        case 'reminder':
          result = await emailService.sendBookingReminder(testBooking, user, testEquipment, 2);
          break;
      }

      if (result.success) {
        setEmailTestStatus(`✅ ${type} email sent successfully!`);
      } else {
        setEmailTestStatus(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      setEmailTestStatus(`❌ Error: ${error.message}`);
    }

    setTimeout(() => setEmailTestStatus(''), 5000);
  };

  const handleToggle = async (flagId) => {
    if (user.role !== 'master_admin') {
      alert('Only master admins can toggle feature flags');
      return;
    }

    try {
      const flag = flags.find(f => f.id === flagId);
      const newValue = !flag.enabled;

      await systemSettingsAPI.update(
        flag.key,
        newValue,
        flag.description || `${flag.name} setting`
      );

      await loadFlags();
      alert(`Feature flag ${newValue ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      alert('Failed to toggle feature flag: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading feature flags...</div>;
  }

  return (
    <div className="feature-flags">
      <h2>Feature Flag Management</h2>
      <p className="subtitle">Control system-wide features and access</p>

      {user.role !== 'master_admin' && (
        <div className="warning-banner">
          ⚠️ You are viewing feature flags in read-only mode. Only Master Admins can toggle flags.
        </div>
      )}

      <div className="flags-list">
        {flags.map(flag => (
          <div key={flag.id} className="flag-item">
            <div className="flag-info">
              <h3>{flag.name.replace(/_/g, ' ').toUpperCase()}</h3>
              <p className="flag-description">{flag.description}</p>
              <p className="flag-meta">
                <span className="role-badge">{flag.required_role}</span>
              </p>
            </div>

            <div className="flag-toggle">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={flag.enabled}
                  onChange={() => handleToggle(flag.id)}
                  disabled={user.role !== 'master_admin'}
                />
                <span className="slider"></span>
              </label>
              <span className={flag.enabled ? 'status-enabled' : 'status-disabled'}>
                {flag.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flags-info">
        <h3>About Feature Flags</h3>
        <ul>
          <li><strong>Room Booking:</strong> Allows staff to book rooms and spaces by the hour</li>
          <li><strong>Analytics Export:</strong> Enables CSV/PDF export of analytics data</li>
          <li><strong>CSV Import:</strong> Allows bulk import of users and equipment</li>
          <li><strong>Interdisciplinary Access:</strong> Permits cross-department equipment borrowing</li>
          <li><strong>Advanced Reporting:</strong> Unlocks detailed reporting features</li>
        </ul>
      </div>

      {/* Email Notifications Configuration */}
      <div className="email-config-section">
        <div className="section-header">
          <h2>📧 Email Notifications Configuration</h2>
          <button
            onClick={() => setShowEmailConfig(!showEmailConfig)}
            className="btn btn-secondary btn-sm"
            disabled={user.role !== 'master_admin'}
          >
            {showEmailConfig ? 'Hide' : 'Configure EmailJS'}
          </button>
        </div>

        <div className="email-status">
          {emailService.isConfigured() ? (
            <span className="status-badge status-success">✅ EmailJS Configured</span>
          ) : (
            <span className="status-badge status-warning">⚠️ EmailJS Not Configured</span>
          )}
          <p className="help-text">
            Email notifications are sent automatically for booking confirmations, approvals, and denials.
            <br />
            See <code>EMAIL_TEMPLATES.md</code> for setup instructions.
          </p>
        </div>

        {showEmailConfig && (
          <div className="email-config-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serviceId">EmailJS Service ID</label>
                <input
                  id="serviceId"
                  type="text"
                  value={emailConfig.serviceId}
                  onChange={(e) => setEmailConfig({ ...emailConfig, serviceId: e.target.value })}
                  placeholder="service_xxxxxxxxx"
                  disabled={user.role !== 'master_admin'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="publicKey">EmailJS Public Key</label>
                <input
                  id="publicKey"
                  type="text"
                  value={emailConfig.publicKey}
                  onChange={(e) => setEmailConfig({ ...emailConfig, publicKey: e.target.value })}
                  placeholder="Your public key"
                  disabled={user.role !== 'master_admin'}
                />
              </div>
            </div>

            <h3>Email Template IDs</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="templateConfirm">Booking Confirmation</label>
                <input
                  id="templateConfirm"
                  type="text"
                  value={emailConfig.templateConfirm}
                  onChange={(e) => setEmailConfig({ ...emailConfig, templateConfirm: e.target.value })}
                  placeholder="template_booking_confirm"
                  disabled={user.role !== 'master_admin'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="templateApproved">Booking Approved</label>
                <input
                  id="templateApproved"
                  type="text"
                  value={emailConfig.templateApproved}
                  onChange={(e) => setEmailConfig({ ...emailConfig, templateApproved: e.target.value })}
                  placeholder="template_booking_approved"
                  disabled={user.role !== 'master_admin'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="templateDenied">Booking Denied</label>
                <input
                  id="templateDenied"
                  type="text"
                  value={emailConfig.templateDenied}
                  onChange={(e) => setEmailConfig({ ...emailConfig, templateDenied: e.target.value })}
                  placeholder="template_booking_denied"
                  disabled={user.role !== 'master_admin'}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="templateOverdue">Overdue Reminder</label>
                <input
                  id="templateOverdue"
                  type="text"
                  value={emailConfig.templateOverdue}
                  onChange={(e) => setEmailConfig({ ...emailConfig, templateOverdue: e.target.value })}
                  placeholder="template_booking_overdue"
                  disabled={user.role !== 'master_admin'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="templateReminder">Booking Reminder</label>
                <input
                  id="templateReminder"
                  type="text"
                  value={emailConfig.templateReminder}
                  onChange={(e) => setEmailConfig({ ...emailConfig, templateReminder: e.target.value })}
                  placeholder="template_booking_reminder"
                  disabled={user.role !== 'master_admin'}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                onClick={handleSaveEmailConfig}
                className="btn btn-primary"
                disabled={user.role !== 'master_admin'}
              >
                Save Configuration
              </button>
            </div>

            {/* Test Email Buttons */}
            {emailService.isConfigured() && (
              <div className="email-test-section">
                <h3>Test Email Templates</h3>
                <p className="help-text">Send test emails to {user.email}</p>
                <div className="test-buttons">
                  <button onClick={() => handleTestEmail('confirmation')} className="btn btn-secondary btn-sm">
                    Test Confirmation
                  </button>
                  <button onClick={() => handleTestEmail('approved')} className="btn btn-secondary btn-sm">
                    Test Approved
                  </button>
                  <button onClick={() => handleTestEmail('denied')} className="btn btn-secondary btn-sm">
                    Test Denied
                  </button>
                  <button onClick={() => handleTestEmail('overdue')} className="btn btn-secondary btn-sm">
                    Test Overdue
                  </button>
                  <button onClick={() => handleTestEmail('reminder')} className="btn btn-secondary btn-sm">
                    Test Reminder
                  </button>
                </div>
                {emailTestStatus && (
                  <div className="test-status">{emailTestStatus}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
