import { useState, useEffect } from 'react';
import { bookingTemplateService } from '../../services/bookingTemplate.service';
import { useAuth } from '../../hooks/useAuth';
import Toast from '../common/Toast';
import { useToast } from '../../hooks/useToast';

export default function BookingTemplate({ onApplyTemplate, onClose }) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const userTemplates = bookingTemplateService.getTemplates(user.id);
    setTemplates(userTemplates);
  };

  const handleApplyTemplate = (template) => {
    const today = new Date();
    const bookingData = bookingTemplateService.applyTemplate(template, today);

    if (onApplyTemplate) {
      onApplyTemplate(bookingData);
    }

    showToast(`Template "${template.name}" applied`, 'success');
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Delete this template?')) {
      bookingTemplateService.deleteTemplate(user.id, templateId);
      loadTemplates();
      showToast('Template deleted', 'success');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Booking Templates</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {templates.length === 0 ? (
            <div className="empty-state">
              <p>No templates saved yet</p>
              <p className="small">Create templates from completed bookings for quick rebooking</p>
            </div>
          ) : (
            <div className="templates-list">
              {templates.map(template => (
                <div key={template.id} className="template-item" data-testid="template-item">
                  <div className="template-header">
                    <h3>{template.name}</h3>
                    <div className="template-actions">
                      <button
                        onClick={() => handleApplyTemplate(template)}
                        className="btn btn-primary btn-sm"
                        data-testid="apply-template-btn"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="btn btn-secondary btn-sm"
                        data-testid="delete-template-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="template-details">
                    <p><strong>Duration:</strong> {template.duration} day(s)</p>
                    {template.purpose && (
                      <p><strong>Purpose:</strong> {template.purpose}</p>
                    )}
                    <p className="template-meta">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
