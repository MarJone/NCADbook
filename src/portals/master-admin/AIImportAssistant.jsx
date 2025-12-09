import { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Brain,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronRight,
  ChevronLeft,
  Users,
  Package,
  HelpCircle,
  Loader,
  Download,
  RefreshCw,
  Check,
  AlertCircle,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  Sparkles,
  Database,
  FileText,
  MapPin,
  ClipboardPaste,
  Type
} from 'lucide-react';
import { analyzeImportData, performAIImport } from '../../services/aiImport.service';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import './AIImportAssistant.css';

// Required fields for each data type
const REQUIRED_FIELDS = {
  users: ['email', 'full_name', 'department', 'role'],
  equipment: ['product_name', 'tracking_number', 'department', 'category']
};

// Optional fields that can be mapped
const OPTIONAL_FIELDS = {
  users: ['first_name', 'surname', 'student_id', 'phone'],
  equipment: ['description', 'status', 'location', 'serial_number', 'purchase_date', 'condition']
};

// Valid values for certain fields
const VALID_VALUES = {
  role: ['student', 'staff', 'department_admin', 'master_admin'],
  department: ['Moving Image Design', 'Graphic Design', 'Illustration', 'Fine Art', 'Product Design'],
  status: ['available', 'booked', 'maintenance', 'out_of_service'],
  category: ['Camera', 'Lens', 'Lighting', 'Audio', 'Tripod', 'Accessory', 'Computer', 'Other']
};

/**
 * AIImportAssistant - Intelligent data import with AI analysis
 *
 * Features:
 * - Drag & drop file upload
 * - AI-powered data type detection (users vs equipment)
 * - Intelligent field mapping
 * - Missing data identification and prompts
 * - Preview and validation before import
 */
export default function AIImportAssistant() {
  const { toasts, showToast, removeToast } = useToast();

  // Input mode: 'file' or 'paste'
  const [inputMode, setInputMode] = useState('file');
  const [pasteText, setPasteText] = useState('');

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);

  // AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [detectedType, setDetectedType] = useState(null);
  const [fieldMappings, setFieldMappings] = useState({});
  const [confidence, setConfidence] = useState(0);

  // Questions state (for missing/ambiguous data)
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // Import state
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);

  // Preview state
  const [previewData, setPreviewData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;

    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    const isValid = validTypes.includes(selectedFile.type) || ['csv', 'xlsx', 'xls'].includes(extension);

    if (!isValid) {
      showToast('Please upload a CSV or Excel file', 'error');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  }, [showToast]);

  // Parse CSV/Excel file
  const parseFile = useCallback(async (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      setRawData(content);

      // Parse CSV (simple parser for demo)
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        showToast('File appears to be empty or invalid', 'error');
        return;
      }

      // Parse headers
      const headerLine = lines[0];
      const parsedHeaders = parseCSVLine(headerLine);
      setHeaders(parsedHeaders);

      // Parse data rows
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === parsedHeaders.length) {
          const row = {};
          parsedHeaders.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });
          rows.push(row);
        }
      }

      setParsedData(rows);
      showToast(`Loaded ${rows.length} rows from ${file.name}`, 'success');
    };

    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };

    reader.readAsText(file);
  }, [showToast]);

  // Parse CSV line handling quoted values
  const parseCSVLine = (line, delimiter = ',') => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  };

  // Detect delimiter (comma, tab, or semicolon)
  const detectDelimiter = (text) => {
    const firstLine = text.split('\n')[0] || '';
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;

    if (tabCount > commaCount && tabCount > semicolonCount) return '\t';
    if (semicolonCount > commaCount) return ';';
    return ',';
  };

  // Parse pasted text
  const parsePastedText = useCallback((text) => {
    if (!text.trim()) {
      setParsedData([]);
      setHeaders([]);
      return;
    }

    const delimiter = detectDelimiter(text);
    const lines = text.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      showToast('Please include a header row and at least one data row', 'warning');
      return;
    }

    // Parse headers
    const parsedHeaders = parseCSVLine(lines[0], delimiter);
    setHeaders(parsedHeaders);

    // Parse data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i], delimiter);
      if (values.length > 0 && values.some(v => v.trim())) {
        const row = {};
        parsedHeaders.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        rows.push(row);
      }
    }

    setParsedData(rows);
    setRawData(text);

    if (rows.length > 0) {
      showToast(`Parsed ${rows.length} rows from pasted text`, 'success');
    }
  }, [showToast]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add('drag-over');
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('drag-over');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('drag-over');

    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  }, [handleFileSelect]);

  // Analyze data with AI
  const handleAnalyze = useCallback(async () => {
    if (!parsedData.length || !headers.length) {
      showToast('No data to analyze', 'error');
      return;
    }

    setAnalyzing(true);
    setCurrentStep(2);

    try {
      const result = await analyzeImportData(headers, parsedData.slice(0, 10));

      setAnalysis(result);
      setDetectedType(result.detectedType);
      setFieldMappings(result.fieldMappings || {});
      setConfidence(result.confidence || 0);
      setQuestions(result.questions || []);

      // Initialize answers with defaults
      const defaultAnswers = {};
      (result.questions || []).forEach((q, i) => {
        if (q.defaultValue) {
          defaultAnswers[i] = q.defaultValue;
        }
      });
      setAnswers(defaultAnswers);

      showToast('Analysis complete!', 'success');
    } catch (error) {
      console.error('Analysis failed:', error);
      showToast('Analysis failed: ' + error.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  }, [parsedData, headers, showToast]);

  // Update field mapping
  const updateFieldMapping = useCallback((sourceField, targetField) => {
    setFieldMappings(prev => ({
      ...prev,
      [sourceField]: targetField
    }));
  }, []);

  // Answer a question
  const answerQuestion = useCallback((index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
  }, []);

  // Generate preview data
  const generatePreview = useCallback(() => {
    const errors = [];
    const preview = parsedData.map((row, rowIndex) => {
      const mappedRow = { _rowIndex: rowIndex };
      const rowErrors = [];

      // Apply field mappings
      Object.entries(fieldMappings).forEach(([source, target]) => {
        if (target && row[source] !== undefined) {
          mappedRow[target] = row[source];
        }
      });

      // Apply answers to fill missing required fields
      questions.forEach((q, i) => {
        if (answers[i] && q.field) {
          if (q.applyToAll) {
            mappedRow[q.field] = answers[i];
          } else if (q.rowIndex === rowIndex) {
            mappedRow[q.field] = answers[i];
          }
        }
      });

      // Check required fields
      const requiredFields = REQUIRED_FIELDS[detectedType] || [];
      requiredFields.forEach(field => {
        if (!mappedRow[field] || mappedRow[field].trim() === '') {
          rowErrors.push(`Missing required field: ${field}`);
        }
      });

      // Validate values
      if (detectedType === 'users') {
        if (mappedRow.role && !VALID_VALUES.role.includes(mappedRow.role.toLowerCase())) {
          rowErrors.push(`Invalid role: ${mappedRow.role}`);
        }
        if (mappedRow.email && !mappedRow.email.includes('@')) {
          rowErrors.push(`Invalid email: ${mappedRow.email}`);
        }
      }

      if (detectedType === 'equipment') {
        if (mappedRow.status && !VALID_VALUES.status.includes(mappedRow.status.toLowerCase())) {
          rowErrors.push(`Invalid status: ${mappedRow.status}`);
        }
      }

      mappedRow._errors = rowErrors;
      if (rowErrors.length > 0) {
        errors.push({ row: rowIndex + 1, errors: rowErrors });
      }

      return mappedRow;
    });

    setPreviewData(preview);
    setValidationErrors(errors);
    setCurrentStep(4);
  }, [parsedData, fieldMappings, questions, answers, detectedType]);

  // Perform import
  const handleImport = useCallback(async () => {
    if (validationErrors.length > 0) {
      const proceed = window.confirm(
        `There are ${validationErrors.length} rows with errors. Do you want to skip these and import the valid rows?`
      );
      if (!proceed) return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      // Filter out rows with errors
      const validRows = previewData.filter(row => !row._errors?.length);

      // Clean up internal fields
      const cleanRows = validRows.map(row => {
        const clean = { ...row };
        delete clean._rowIndex;
        delete clean._errors;
        return clean;
      });

      const result = await performAIImport(detectedType, cleanRows, (progress) => {
        setImportProgress(progress);
      });

      setImportResults(result);
      setCurrentStep(5);
      showToast(`Successfully imported ${result.imported} ${detectedType}!`, 'success');
    } catch (error) {
      console.error('Import failed:', error);
      showToast('Import failed: ' + error.message, 'error');
    } finally {
      setImporting(false);
    }
  }, [previewData, validationErrors, detectedType, showToast]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setInputMode('file');
    setPasteText('');
    setFile(null);
    setRawData(null);
    setParsedData([]);
    setHeaders([]);
    setAnalyzing(false);
    setAnalysis(null);
    setDetectedType(null);
    setFieldMappings({});
    setConfidence(0);
    setQuestions([]);
    setAnswers({});
    setImporting(false);
    setImportProgress(0);
    setImportResults(null);
    setPreviewData([]);
    setValidationErrors([]);
  }, []);

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="ai-import-steps">
      {[
        { num: 1, label: 'Upload', icon: Upload },
        { num: 2, label: 'Analyze', icon: Brain },
        { num: 3, label: 'Map Fields', icon: MapPin },
        { num: 4, label: 'Preview', icon: FileText },
        { num: 5, label: 'Complete', icon: CheckCircle }
      ].map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.num;
        const isComplete = currentStep > step.num;

        return (
          <div key={step.num} className="step-wrapper">
            <div className={`step-item ${isActive ? 'active' : ''} ${isComplete ? 'complete' : ''}`}>
              <div className="step-circle">
                {isComplete ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
            {index < 4 && <div className={`step-connector ${isComplete ? 'complete' : ''}`} />}
          </div>
        );
      })}
    </div>
  );

  // Render Step 1: Upload
  const renderUploadStep = () => (
    <div className="import-step upload-step">
      <div className="step-header">
        <h3>
          <Upload size={24} />
          Import Your Data
        </h3>
        <p>Upload a file or paste raw data. The AI will analyze and map it automatically.</p>
      </div>

      {/* Input Mode Toggle */}
      <div className="input-mode-toggle">
        <button
          className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
          onClick={() => {
            setInputMode('file');
            setPasteText('');
            if (!file) {
              setParsedData([]);
              setHeaders([]);
            }
          }}
        >
          <FileSpreadsheet size={18} />
          Upload File
        </button>
        <button
          className={`mode-btn ${inputMode === 'paste' ? 'active' : ''}`}
          onClick={() => {
            setInputMode('paste');
            setFile(null);
            if (!pasteText) {
              setParsedData([]);
              setHeaders([]);
            }
          }}
        >
          <ClipboardPaste size={18} />
          Paste Data
        </button>
      </div>

      {inputMode === 'file' ? (
        /* File Upload Mode */
        <div
          ref={dropZoneRef}
          className={`drop-zone ${file ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />

          {file ? (
            <div className="file-info">
              <FileSpreadsheet size={48} className="file-icon" />
              <div className="file-details">
                <span className="file-name">{file.name}</span>
                <span className="file-meta">
                  {parsedData.length} rows &bull; {headers.length} columns
                </span>
              </div>
              <button
                className="btn-remove-file"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setParsedData([]);
                  setHeaders([]);
                  setRawData(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="drop-zone-content">
              <Upload size={48} className="upload-icon" />
              <h4>Drag & drop your file here</h4>
              <p>or click to browse</p>
              <span className="file-types">Supports CSV, XLSX, XLS</span>
            </div>
          )}
        </div>
      ) : (
        /* Paste Data Mode */
        <div className="paste-zone">
          <div className="paste-header">
            <Type size={18} />
            <span>Paste CSV, tab-separated, or semicolon-separated data</span>
          </div>
          <textarea
            className="paste-textarea"
            placeholder={`Paste your data here...

Example (CSV):
name,email,department
John Doe,john@example.com,Design
Jane Smith,jane@example.com,Art

Example (Tab-separated - copy from Excel):
name\temail\tdepartment
John Doe\tjohn@example.com\tDesign`}
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              parsePastedText(e.target.value);
            }}
            rows={10}
          />
          {pasteText && (
            <div className="paste-info">
              <span className="paste-stats">
                {parsedData.length} rows &bull; {headers.length} columns detected
              </span>
              <button
                className="btn-clear-paste"
                onClick={() => {
                  setPasteText('');
                  setParsedData([]);
                  setHeaders([]);
                  setRawData(null);
                }}
              >
                <X size={16} />
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {/* Data Preview (shows for both modes) */}
      {parsedData.length > 0 && (
        <div className="upload-preview">
          <h4>Data Preview</h4>
          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  {headers.map((header, i) => (
                    <th key={i}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {headers.map((header, j) => (
                      <td key={j}>{row[header] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedData.length > 5 && (
            <p className="preview-more">... and {parsedData.length - 5} more rows</p>
          )}
        </div>
      )}

      <div className="step-actions">
        <button
          className="btn-primary btn-analyze"
          onClick={handleAnalyze}
          disabled={!parsedData.length}
        >
          <Brain size={18} />
          Analyze with AI
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  // Render Step 2: Analysis Results
  const renderAnalysisStep = () => (
    <div className="import-step analysis-step">
      <div className="step-header">
        <h3>
          <Brain size={24} />
          AI Analysis
        </h3>
        <p>The AI has analyzed your data. Review the detected type and field mappings below.</p>
      </div>

      {analyzing ? (
        <div className="analyzing-state">
          <div className="analyzing-animation">
            <Sparkles size={48} className="sparkle-icon" />
            <Loader size={64} className="spinning" />
          </div>
          <h4>Analyzing your data...</h4>
          <p>The AI is examining column headers and sample data to determine the best import strategy.</p>
        </div>
      ) : analysis ? (
        <>
          <div className="analysis-results">
            <div className="detected-type-card">
              <div className="type-icon">
                {detectedType === 'users' ? <Users size={32} /> : <Package size={32} />}
              </div>
              <div className="type-info">
                <h4>Detected Data Type</h4>
                <span className="type-name">{detectedType === 'users' ? 'Users' : 'Equipment'}</span>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${confidence}%` }} />
                </div>
                <span className="confidence-label">{confidence}% confidence</span>
              </div>
              <button
                className="btn-switch-type"
                onClick={() => setDetectedType(detectedType === 'users' ? 'equipment' : 'users')}
              >
                Switch to {detectedType === 'users' ? 'Equipment' : 'Users'}
              </button>
            </div>

            {analysis.explanation && (
              <div className="analysis-explanation">
                <HelpCircle size={18} />
                <p>{analysis.explanation}</p>
              </div>
            )}
          </div>

          <div className="step-actions">
            <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
              <ChevronLeft size={18} />
              Back
            </button>
            <button className="btn-primary" onClick={() => setCurrentStep(3)}>
              Configure Field Mappings
              <ChevronRight size={18} />
            </button>
          </div>
        </>
      ) : null}
    </div>
  );

  // Render Step 3: Field Mapping & Questions
  const renderMappingStep = () => {
    const requiredFields = REQUIRED_FIELDS[detectedType] || [];
    const optionalFields = OPTIONAL_FIELDS[detectedType] || [];
    const allTargetFields = [...requiredFields, ...optionalFields];

    return (
      <div className="import-step mapping-step">
        <div className="step-header">
          <h3>
            <MapPin size={24} />
            Map Fields & Answer Questions
          </h3>
          <p>Review how your columns map to database fields. Fill in any missing required information.</p>
        </div>

        <div className="mapping-section">
          <h4>Field Mappings</h4>
          <p className="mapping-hint">
            Map your CSV columns to {detectedType} fields. Required fields are marked with <span className="required-marker">*</span>
          </p>

          <div className="field-mappings">
            {headers.map((header) => {
              const currentMapping = fieldMappings[header];
              const isRequired = requiredFields.includes(currentMapping);

              return (
                <div key={header} className="mapping-row">
                  <div className="source-field">
                    <FileText size={16} />
                    <span>{header}</span>
                  </div>
                  <ArrowRight size={20} className="mapping-arrow" />
                  <select
                    value={currentMapping || ''}
                    onChange={(e) => updateFieldMapping(header, e.target.value)}
                    className={`target-field-select ${isRequired ? 'required' : ''}`}
                  >
                    <option value="">-- Skip this column --</option>
                    <optgroup label="Required Fields">
                      {requiredFields.map(field => (
                        <option key={field} value={field}>
                          {field} *
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Optional Fields">
                      {optionalFields.map(field => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {questions.length > 0 && (
          <div className="questions-section">
            <h4>
              <HelpCircle size={20} />
              Additional Information Needed
            </h4>
            <p className="questions-hint">
              The AI detected some missing or ambiguous data. Please answer these questions:
            </p>

            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={index} className="question-card">
                  <div className="question-header">
                    <AlertTriangle size={18} className="question-icon" />
                    <span className="question-text">{question.text}</span>
                  </div>

                  {question.type === 'select' ? (
                    <select
                      value={answers[index] || ''}
                      onChange={(e) => answerQuestion(index, e.target.value)}
                      className="question-input"
                    >
                      <option value="">Select an option...</option>
                      {question.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={answers[index] || ''}
                      onChange={(e) => answerQuestion(index, e.target.value)}
                      placeholder={question.placeholder || 'Enter value...'}
                      className="question-input"
                    />
                  )}

                  {question.hint && (
                    <p className="question-hint">{question.hint}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="step-actions">
          <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
            <ChevronLeft size={18} />
            Back
          </button>
          <button className="btn-primary" onClick={generatePreview}>
            Preview Import
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  };

  // Render Step 4: Preview
  const renderPreviewStep = () => {
    const validCount = previewData.filter(row => !row._errors?.length).length;
    const errorCount = previewData.length - validCount;

    return (
      <div className="import-step preview-step">
        <div className="step-header">
          <h3>
            <FileText size={24} />
            Preview Import
          </h3>
          <p>Review the mapped data before importing. Rows with errors will be skipped.</p>
        </div>

        <div className="preview-summary">
          <div className="summary-card valid">
            <CheckCircle size={24} />
            <div>
              <span className="summary-count">{validCount}</span>
              <span className="summary-label">Valid rows</span>
            </div>
          </div>
          <div className="summary-card errors">
            <AlertTriangle size={24} />
            <div>
              <span className="summary-count">{errorCount}</span>
              <span className="summary-label">Rows with errors</span>
            </div>
          </div>
          <div className="summary-card type">
            {detectedType === 'users' ? <Users size={24} /> : <Package size={24} />}
            <div>
              <span className="summary-count">{detectedType}</span>
              <span className="summary-label">Data type</span>
            </div>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <h4>
              <AlertCircle size={18} />
              Validation Errors
            </h4>
            <div className="errors-list">
              {validationErrors.slice(0, 10).map((error, index) => (
                <div key={index} className="error-item">
                  <span className="error-row">Row {error.row}:</span>
                  <span className="error-messages">{error.errors.join(', ')}</span>
                </div>
              ))}
              {validationErrors.length > 10 && (
                <p className="more-errors">... and {validationErrors.length - 10} more errors</p>
              )}
            </div>
          </div>
        )}

        <div className="preview-table-section">
          <h4>Data Preview (First 10 Rows)</h4>
          <div className="preview-table-wrapper">
            <table className="preview-table mapped">
              <thead>
                <tr>
                  <th>Status</th>
                  {(REQUIRED_FIELDS[detectedType] || []).map(field => (
                    <th key={field} className="required">{field}</th>
                  ))}
                  {(OPTIONAL_FIELDS[detectedType] || []).slice(0, 3).map(field => (
                    <th key={field}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((row, index) => (
                  <tr key={index} className={row._errors?.length ? 'has-error' : ''}>
                    <td className="status-cell">
                      {row._errors?.length ? (
                        <AlertTriangle size={16} className="error-icon" />
                      ) : (
                        <CheckCircle size={16} className="valid-icon" />
                      )}
                    </td>
                    {(REQUIRED_FIELDS[detectedType] || []).map(field => (
                      <td key={field} className={!row[field] ? 'missing' : ''}>
                        {row[field] || <span className="missing-value">Missing</span>}
                      </td>
                    ))}
                    {(OPTIONAL_FIELDS[detectedType] || []).slice(0, 3).map(field => (
                      <td key={field}>{row[field] || '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="step-actions">
          <button className="btn-secondary" onClick={() => setCurrentStep(3)}>
            <ChevronLeft size={18} />
            Back to Mapping
          </button>
          <button
            className="btn-primary btn-import"
            onClick={handleImport}
            disabled={validCount === 0 || importing}
          >
            {importing ? (
              <>
                <Loader size={18} className="spinning" />
                Importing... {importProgress}%
              </>
            ) : (
              <>
                <Database size={18} />
                Import {validCount} {detectedType}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  // Render Step 5: Complete
  const renderCompleteStep = () => (
    <div className="import-step complete-step">
      <div className="complete-content">
        <div className="complete-icon">
          <CheckCircle size={64} />
        </div>
        <h3>Import Complete!</h3>
        <p>Your data has been successfully imported to the database.</p>

        {importResults && (
          <div className="import-results">
            <div className="result-item">
              <span className="result-label">Imported:</span>
              <span className="result-value success">{importResults.imported}</span>
            </div>
            {importResults.skipped > 0 && (
              <div className="result-item">
                <span className="result-label">Skipped:</span>
                <span className="result-value warning">{importResults.skipped}</span>
              </div>
            )}
            {importResults.errors > 0 && (
              <div className="result-item">
                <span className="result-label">Errors:</span>
                <span className="result-value error">{importResults.errors}</span>
              </div>
            )}
          </div>
        )}

        <div className="complete-actions">
          <button className="btn-secondary" onClick={resetWizard}>
            <Plus size={18} />
            Import More Data
          </button>
          <a href={`#/${detectedType}`} className="btn-primary">
            View {detectedType === 'users' ? 'Users' : 'Equipment'}
            <ChevronRight size={18} />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="ai-import-assistant">
      <div className="import-header">
        <h2>
          <Sparkles size={28} />
          AI Import Assistant
        </h2>
        <p>Intelligently import users or equipment data with AI-powered analysis and field mapping.</p>
      </div>

      {renderStepIndicator()}

      <div className="import-content">
        {currentStep === 1 && renderUploadStep()}
        {currentStep === 2 && renderAnalysisStep()}
        {currentStep === 3 && renderMappingStep()}
        {currentStep === 4 && renderPreviewStep()}
        {currentStep === 5 && renderCompleteStep()}
      </div>

      {/* Toast notifications */}
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
