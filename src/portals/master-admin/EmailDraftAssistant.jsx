import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Mail,
  Sparkles,
  Send,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  Package,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  X,
  Clock,
  Shield,
  UserX,
  Bell,
  Search
} from 'lucide-react';
import { generateEmailDraft } from '../../services/ai.service.js';
import './EmailDraftAssistant.css';

// Mock students for demo mode
const MOCK_STUDENTS = [
  { id: 1, full_name: 'Emma O\'Brien', email: 'emma.obrien@student.ncad.ie', department: 'Moving Image Design' },
  { id: 2, full_name: 'Liam Murphy', email: 'liam.murphy@student.ncad.ie', department: 'Graphic Design' },
  { id: 3, full_name: 'Sophie Walsh', email: 'sophie.walsh@student.ncad.ie', department: 'Illustration' },
  { id: 4, full_name: 'James Kelly', email: 'james.kelly@student.ncad.ie', department: 'Moving Image Design' },
  { id: 5, full_name: 'Aoife Ryan', email: 'aoife.ryan@student.ncad.ie', department: 'Graphic Design' },
  { id: 6, full_name: 'Sean Byrne', email: 'sean.byrne@student.ncad.ie', department: 'Illustration' },
  { id: 7, full_name: 'Ciara Fitzgerald', email: 'ciara.fitzgerald@student.ncad.ie', department: 'Moving Image Design' },
  { id: 8, full_name: 'Conor O\'Sullivan', email: 'conor.osullivan@student.ncad.ie', department: 'Graphic Design' },
  { id: 9, full_name: 'Niamh Brennan', email: 'niamh.brennan@student.ncad.ie', department: 'Illustration' },
  { id: 10, full_name: 'Patrick Doyle', email: 'patrick.doyle@student.ncad.ie', department: 'Moving Image Design' },
  { id: 11, full_name: 'Sinead McCarthy', email: 'sinead.mccarthy@student.ncad.ie', department: 'Graphic Design' },
  { id: 12, full_name: 'Roisin Kennedy', email: 'roisin.kennedy@student.ncad.ie', department: 'Illustration' },
  { id: 13, full_name: 'Oisin Walsh', email: 'oisin.walsh@student.ncad.ie', department: 'Moving Image Design' },
  { id: 14, full_name: 'Fiona O\'Connor', email: 'fiona.oconnor@student.ncad.ie', department: 'Graphic Design' },
  { id: 15, full_name: 'Declan Murray', email: 'declan.murray@student.ncad.ie', department: 'Illustration' }
];

/**
 * EmailDraftAssistant - AI-powered email drafting for admin communications
 *
 * Master Admin feature that generates professional email drafts for various
 * booking-related communications using local LLM (Ollama).
 */

// Email template scenarios
const EMAIL_SCENARIOS = [
  {
    id: 'approval',
    icon: CheckCircle,
    label: 'Booking Approval',
    description: 'Confirm equipment booking approval to student',
    category: 'Booking',
    color: 'var(--color-success-500)',
    fields: ['studentName', 'equipment', 'startDate', 'endDate']
  },
  {
    id: 'rejection',
    icon: X,
    label: 'Booking Rejection',
    description: 'Explain why a booking request was denied',
    category: 'Booking',
    color: 'var(--color-error-500)',
    fields: ['studentName', 'equipment', 'reason']
  },
  {
    id: 'overdue',
    icon: AlertTriangle,
    label: 'Overdue Reminder',
    description: 'Notify student about overdue equipment',
    category: 'Reminder',
    color: 'var(--color-warning-500)',
    fields: ['studentName', 'equipment', 'daysOverdue']
  },
  {
    id: 'reminder',
    icon: Bell,
    label: 'Pickup Reminder',
    description: 'Remind student of upcoming equipment pickup',
    category: 'Reminder',
    color: 'var(--color-info-500)',
    fields: ['studentName', 'equipment', 'pickupDate']
  },
  {
    id: 'damage',
    icon: AlertCircle,
    label: 'Damage Report',
    description: 'Report equipment damage to student',
    category: 'Equipment',
    color: 'var(--color-error-600)',
    fields: ['studentName', 'equipment', 'damageDescription']
  },
  {
    id: 'strike',
    icon: UserX,
    label: 'Strike Notification',
    description: 'Notify student about a policy violation strike',
    category: 'Policy',
    color: 'var(--color-warning-600)',
    fields: ['studentName', 'strikeReason', 'strikeCount']
  },
  {
    id: 'extension',
    icon: Clock,
    label: 'Extension Response',
    description: 'Respond to booking extension request',
    category: 'Booking',
    color: 'var(--color-primary-500)',
    fields: ['studentName', 'equipment', 'newEndDate', 'approved']
  },
  {
    id: 'policy',
    icon: Shield,
    label: 'Policy Update',
    description: 'Inform students about policy changes',
    category: 'Policy',
    color: 'var(--color-neutral-600)',
    fields: ['policyType', 'changes', 'effectiveDate']
  },
  {
    id: 'custom',
    icon: Edit3,
    label: 'Custom Email',
    description: 'Write a custom email with AI assistance',
    category: 'Custom',
    color: 'var(--color-secondary-500)',
    fields: ['context', 'tone']
  }
];

// Field labels and placeholders
const FIELD_CONFIG = {
  studentName: { label: 'Student Name', placeholder: 'Search for a student...', type: 'student-search' },
  equipment: { label: 'Equipment', placeholder: 'e.g., Canon EOS R5, Tripod', type: 'text' },
  startDate: { label: 'Start Date', placeholder: '', type: 'date' },
  endDate: { label: 'End Date', placeholder: '', type: 'date' },
  pickupDate: { label: 'Pickup Date', placeholder: '', type: 'date' },
  newEndDate: { label: 'New End Date', placeholder: '', type: 'date' },
  reason: { label: 'Rejection Reason', placeholder: 'e.g., Equipment reserved for class use', type: 'textarea' },
  daysOverdue: { label: 'Days Overdue', placeholder: 'e.g., 3', type: 'number' },
  damageDescription: { label: 'Damage Description', placeholder: 'Describe the damage...', type: 'textarea' },
  strikeReason: { label: 'Strike Reason', placeholder: 'e.g., Late return without notification', type: 'textarea' },
  strikeCount: { label: 'Total Strikes', placeholder: 'e.g., 2', type: 'number' },
  approved: { label: 'Extension Approved?', placeholder: '', type: 'select', options: ['Yes', 'No'] },
  policyType: { label: 'Policy Type', placeholder: 'e.g., Late Return Policy', type: 'text' },
  changes: { label: 'Policy Changes', placeholder: 'Describe the changes...', type: 'textarea' },
  effectiveDate: { label: 'Effective Date', placeholder: '', type: 'date' },
  context: { label: 'Email Context', placeholder: 'Describe what you want to communicate...', type: 'textarea' },
  tone: { label: 'Tone', placeholder: '', type: 'select', options: ['Professional', 'Friendly', 'Formal', 'Urgent'] }
};

export default function EmailDraftAssistant() {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [formData, setFormData] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmail, setEditedEmail] = useState({ subject: '', body: '' });
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [recentEmails, setRecentEmails] = useState([]);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });

  // Student search state
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentSearchFocused, setStudentSearchFocused] = useState(false);
  const [students] = useState(MOCK_STUDENTS);

  const emailRef = useRef(null);
  const studentSearchRef = useRef(null);

  // Handle scenario selection
  const handleScenarioSelect = useCallback((scenario) => {
    setSelectedScenario(scenario);
    setFormData({});
    setGeneratedEmail(null);
    setError(null);
    setIsEditing(false);
    setStudentSearchQuery('');
    setStudentSearchFocused(false);
  }, []);

  // Filter students based on search query
  const filteredStudents = students.filter(student => {
    if (!studentSearchQuery.trim()) return true;
    const query = studentSearchQuery.toLowerCase();
    return (
      student.full_name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.department.toLowerCase().includes(query)
    );
  }).slice(0, 8); // Limit to 8 results

  // Handle student selection from dropdown
  const handleStudentSelect = useCallback((student) => {
    setFormData(prev => ({ ...prev, studentName: student.full_name }));
    setStudentSearchQuery(student.full_name);
    setStudentSearchFocused(false);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentSearchRef.current && !studentSearchRef.current.contains(event.target)) {
        setStudentSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle form field changes
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Generate email draft
  const handleGenerate = useCallback(async () => {
    if (!selectedScenario) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedEmail(null);
    setProgress({ stage: 'Analyzing context...', percent: 20 });

    try {
      // Progress simulation for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.percent >= 90) return prev;
          const stages = [
            { stage: 'Understanding requirements...', percent: 40 },
            { stage: 'Generating draft...', percent: 60 },
            { stage: 'Refining language...', percent: 80 },
            { stage: 'Finalizing...', percent: 90 }
          ];
          const next = stages.find(s => s.percent > prev.percent);
          return next || prev;
        });
      }, 400);

      const response = await generateEmailDraft(selectedScenario.id, formData);
      clearInterval(progressInterval);

      if (response.success) {
        setProgress({ stage: 'Complete!', percent: 100 });
        setGeneratedEmail(response.email);
        setEditedEmail(response.email);

        // Add to recent emails
        setRecentEmails(prev => [{
          scenario: selectedScenario.label,
          subject: response.email.subject,
          timestamp: new Date(),
          ...formData
        }, ...prev.slice(0, 4)]);
      } else {
        throw new Error(response.error || 'Failed to generate email');
      }
    } catch (err) {
      setError(err.message);
      setProgress({ stage: '', percent: 0 });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedScenario, formData]);

  // Regenerate email with same parameters
  const handleRegenerate = useCallback(() => {
    handleGenerate();
  }, [handleGenerate]);

  // Copy email to clipboard
  const handleCopy = useCallback(async () => {
    const email = isEditing ? editedEmail : generatedEmail;
    if (!email) return;

    const text = `Subject: ${email.subject}\n\n${email.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedEmail, editedEmail, isEditing]);

  // Toggle edit mode
  const toggleEdit = useCallback(() => {
    if (!isEditing) {
      setEditedEmail(generatedEmail);
    }
    setIsEditing(!isEditing);
  }, [isEditing, generatedEmail]);

  // Handle edit changes
  const handleEditChange = useCallback((field, value) => {
    setEditedEmail(prev => ({ ...prev, [field]: value }));
  }, []);

  // Scroll to email when generated
  useEffect(() => {
    if (generatedEmail && emailRef.current) {
      emailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedEmail]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    if (!selectedScenario) return false;
    const requiredFields = selectedScenario.fields || [];
    return requiredFields.every(field => {
      const value = formData[field];
      return value !== undefined && value !== '';
    });
  }, [selectedScenario, formData]);

  // Render form field
  const renderField = (fieldName) => {
    const config = FIELD_CONFIG[fieldName];
    if (!config) return null;

    const value = formData[fieldName] || '';

    // Student search dropdown
    if (config.type === 'student-search') {
      return (
        <div key={fieldName} className="eda-field eda-field-full">
          <label>{config.label}</label>
          <div className="eda-student-search" ref={studentSearchRef}>
            <div className="eda-search-input-wrapper">
              <Search size={16} className="eda-search-icon" />
              <input
                type="text"
                value={studentSearchQuery}
                onChange={(e) => {
                  setStudentSearchQuery(e.target.value);
                  // Clear the form value if user is typing something different
                  if (e.target.value !== formData.studentName) {
                    handleFieldChange(fieldName, '');
                  }
                }}
                onFocus={() => setStudentSearchFocused(true)}
                placeholder={config.placeholder}
                className="eda-search-input"
              />
              {studentSearchQuery && (
                <button
                  type="button"
                  className="eda-search-clear"
                  onClick={() => {
                    setStudentSearchQuery('');
                    handleFieldChange(fieldName, '');
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {studentSearchFocused && (
              <div className="eda-student-dropdown">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(student => (
                    <button
                      key={student.id}
                      type="button"
                      className={`eda-student-option ${formData.studentName === student.full_name ? 'selected' : ''}`}
                      onClick={() => handleStudentSelect(student)}
                    >
                      <User size={14} className="eda-student-avatar" />
                      <div className="eda-student-info">
                        <span className="eda-student-name">{student.full_name}</span>
                        <span className="eda-student-email">{student.email}</span>
                      </div>
                      <span className="eda-student-dept">{student.department}</span>
                    </button>
                  ))
                ) : (
                  <div className="eda-no-students">
                    <span>No students found</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (config.type === 'textarea') {
      return (
        <div key={fieldName} className="eda-field">
          <label>{config.label}</label>
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={config.placeholder}
            rows={3}
          />
        </div>
      );
    }

    if (config.type === 'select') {
      return (
        <div key={fieldName} className="eda-field">
          <label>{config.label}</label>
          <select
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          >
            <option value="">Select...</option>
            {config.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={fieldName} className="eda-field">
        <label>{config.label}</label>
        <input
          type={config.type}
          value={value}
          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
          placeholder={config.placeholder}
        />
      </div>
    );
  };

  // Get display email (edited or generated)
  const displayEmail = isEditing ? editedEmail : generatedEmail;

  return (
    <div className="eda-container">
      {/* Header */}
      <div className="eda-header">
        <div className="eda-header-icon">
          <Mail size={32} />
        </div>
        <div>
          <h1>Email Draft Assistant</h1>
          <p>AI-powered email drafting for admin communications</p>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="eda-scenarios glass-panel">
        <h3>Select Email Type</h3>
        <div className="eda-scenarios-grid">
          {EMAIL_SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            const isSelected = selectedScenario?.id === scenario.id;

            return (
              <button
                key={scenario.id}
                className={`eda-scenario-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleScenarioSelect(scenario)}
                style={{ '--scenario-color': scenario.color }}
              >
                <div className="eda-scenario-icon">
                  <Icon size={20} />
                </div>
                <div className="eda-scenario-info">
                  <span className="eda-scenario-label">{scenario.label}</span>
                  <span className="eda-scenario-desc">{scenario.description}</span>
                </div>
                <span className="eda-scenario-category">{scenario.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Section */}
      {selectedScenario && (
        <div className="eda-form glass-panel">
          <div className="eda-form-header">
            <div className="eda-form-title">
              {React.createElement(selectedScenario.icon, { size: 20 })}
              <span>{selectedScenario.label}</span>
            </div>
            <button
              className="eda-close-btn"
              onClick={() => setSelectedScenario(null)}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="eda-form-fields">
            {selectedScenario.fields.map(renderField)}
          </div>

          <div className="eda-form-actions">
            <button
              className="eda-generate-btn"
              onClick={handleGenerate}
              disabled={!isFormValid() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="eda-spinner" size={18} />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Draft</span>
                </>
              )}
            </button>
          </div>

          {/* Progress Indicator */}
          {isGenerating && (
            <div className="eda-progress">
              <div className="eda-progress-bar">
                <div
                  className="eda-progress-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="eda-progress-text">{progress.stage}</span>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="eda-error glass-panel">
          <AlertCircle size={20} />
          <div>
            <strong>Generation Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Generated Email Display */}
      {generatedEmail && (
        <div ref={emailRef} className="eda-email glass-panel">
          <div className="eda-email-header">
            <div className="eda-email-title">
              <CheckCircle size={20} className="eda-success-icon" />
              <span>Generated Email Draft</span>
            </div>
            <div className="eda-email-actions">
              <button
                className={`eda-action-btn ${isEditing ? 'active' : ''}`}
                onClick={toggleEdit}
                title={isEditing ? 'View mode' : 'Edit mode'}
              >
                {isEditing ? <Eye size={16} /> : <Edit3 size={16} />}
                <span>{isEditing ? 'View' : 'Edit'}</span>
              </button>
              <button
                className={`eda-action-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                className="eda-action-btn"
                onClick={handleRegenerate}
                title="Regenerate"
                disabled={isGenerating}
              >
                <RefreshCw size={16} className={isGenerating ? 'eda-spinner' : ''} />
              </button>
            </div>
          </div>

          <div className="eda-email-content">
            {/* Subject Line */}
            <div className="eda-email-subject">
              <label>Subject:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEmail.subject}
                  onChange={(e) => handleEditChange('subject', e.target.value)}
                  className="eda-edit-subject"
                />
              ) : (
                <span>{displayEmail.subject}</span>
              )}
            </div>

            {/* Email Body */}
            <div className="eda-email-body">
              {isEditing ? (
                <textarea
                  value={editedEmail.body}
                  onChange={(e) => handleEditChange('body', e.target.value)}
                  className="eda-edit-body"
                  rows={12}
                />
              ) : (
                <pre>{displayEmail.body}</pre>
              )}
            </div>

            {/* Email Footer */}
            {generatedEmail.footer && (
              <div className="eda-email-footer">
                <small>{generatedEmail.footer}</small>
              </div>
            )}
          </div>

          {/* Demo Mode Note */}
          {generatedEmail.note && (
            <div className="eda-demo-note">
              <AlertCircle size={14} />
              <span>{generatedEmail.note}</span>
            </div>
          )}
        </div>
      )}

      {/* Recent Emails */}
      {recentEmails.length > 0 && (
        <div className="eda-recent glass-panel">
          <h3>
            <Clock size={16} />
            Recently Generated
          </h3>
          <div className="eda-recent-list">
            {recentEmails.map((item, index) => (
              <div key={index} className="eda-recent-item">
                <div className="eda-recent-info">
                  <span className="eda-recent-scenario">{item.scenario}</span>
                  <span className="eda-recent-subject">{item.subject}</span>
                </div>
                <span className="eda-recent-time">
                  {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="eda-tips glass-panel">
        <h3>
          <Sparkles size={16} />
          Tips for Better Emails
        </h3>
        <ul>
          <li>Be specific with equipment names and dates for more accurate drafts</li>
          <li>Use the edit mode to personalize the generated content</li>
          <li>For rejection emails, provide clear and constructive reasons</li>
          <li>Review all AI-generated content before sending</li>
        </ul>
      </div>
    </div>
  );
}
