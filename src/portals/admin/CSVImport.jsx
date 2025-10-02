import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { csvImportService } from '../../services/csv-import.service';

export default function CSVImport() {
  const { user } = useAuth();
  const [importType, setImportType] = useState('users'); // 'users' or 'equipment'
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [validation, setValidation] = useState(null);
  const [duplicates, setDuplicates] = useState(null);
  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: confirm, 4: results
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    updateDuplicates: false
  });
  const [importResults, setImportResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Master admin only guard
  if (user.role !== 'master_admin') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only Master Admins can import CSV data.</p>
      </div>
    );
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setLoading(true);

    try {
      const text = await file.text();
      const data = csvImportService.parseCSV(text);

      if (data.length === 0) {
        alert('CSV file is empty or invalid');
        setLoading(false);
        return;
      }

      // Validate data
      const validationResult = importType === 'users'
        ? csvImportService.validateUsers(data)
        : csvImportService.validateEquipment(data);

      if (!validationResult.valid) {
        setValidation(validationResult);
        setCsvData(null);
        setStep(2);
        setLoading(false);
        return;
      }

      // Detect duplicates
      const duplicateResult = importType === 'users'
        ? await csvImportService.detectUserDuplicates(data)
        : await csvImportService.detectEquipmentDuplicates(data);

      setCsvData(data);
      setValidation(validationResult);
      setDuplicates(duplicateResult);
      setStep(2);
    } catch (error) {
      alert('Failed to parse CSV file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!csvData) return;

    setLoading(true);
    setStep(3);

    try {
      const results = importType === 'users'
        ? await csvImportService.importUsers(csvData, importOptions)
        : await csvImportService.importEquipment(csvData, importOptions);

      setImportResults(results);
      setStep(4);
    } catch (error) {
      alert('Import failed: ' + error.message);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvData(null);
    setValidation(null);
    setDuplicates(null);
    setStep(1);
    setImportResults(null);
    setImportOptions({ skipDuplicates: true, updateDuplicates: false });
  };

  const downloadTemplate = () => {
    const template = importType === 'users'
      ? csvImportService.generateUserTemplate()
      : csvImportService.generateEquipmentTemplate();

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="csv-import">
      <div className="import-header">
        <h2>CSV Import</h2>
        <p className="subtitle">Bulk import users or equipment from CSV files</p>
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="import-step">
          <div className="import-type-selector">
            <label>
              <input
                type="radio"
                value="users"
                checked={importType === 'users'}
                onChange={(e) => setImportType(e.target.value)}
              />
              <span>Import Users</span>
            </label>
            <label>
              <input
                type="radio"
                value="equipment"
                checked={importType === 'equipment'}
                onChange={(e) => setImportType(e.target.value)}
              />
              <span>Import Equipment</span>
            </label>
          </div>

          <div className="template-download">
            <button onClick={downloadTemplate} className="btn btn-secondary">
              📥 Download {importType === 'users' ? 'Users' : 'Equipment'} Template
            </button>
            <p className="help-text">
              Download the template CSV file to see required columns and format
            </p>
          </div>

          <div className="file-upload-section">
            <label htmlFor="csv-file" className="file-upload-label">
              {file ? file.name : 'Choose CSV file...'}
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="file-input"
            />
          </div>

          <div className="import-actions">
            <button
              onClick={handleFileUpload}
              className="btn btn-primary"
              disabled={!file || loading}
            >
              {loading ? 'Processing...' : 'Upload and Validate'}
            </button>
          </div>

          <div className="import-info">
            <h3>📋 {importType === 'users' ? 'User' : 'Equipment'} CSV Requirements</h3>
            {importType === 'users' ? (
              <ul>
                <li><strong>Required columns:</strong> first_name, surname, full_name, email, department</li>
                <li><strong>Optional columns:</strong> role (student/staff/admin/master_admin), year</li>
                <li><strong>Valid departments:</strong> Moving Image Design, Graphic Design, Illustration</li>
                <li><strong>GDPR:</strong> All imports are logged and previewed before confirmation</li>
              </ul>
            ) : (
              <ul>
                <li><strong>Required columns:</strong> product_name, tracking_number, description, link_to_image</li>
                <li><strong>Optional columns:</strong> category, department, status, requires_justification</li>
                <li><strong>Tracking numbers:</strong> Must be unique (duplicates will be detected)</li>
                <li><strong>Status options:</strong> available, booked, maintenance, out_of_service</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Preview and Validation */}
      {step === 2 && (
        <div className="import-step">
          <h3>📊 Validation Results</h3>

          {/* Validation Errors */}
          {validation && validation.errors.length > 0 && (
            <div className="validation-errors">
              <h4>❌ Errors ({validation.errors.length})</h4>
              <ul>
                {validation.errors.map((error, idx) => (
                  <li key={idx} className="error-item">{error}</li>
                ))}
              </ul>
              <p className="error-message">
                Please fix these errors in your CSV file and try again.
              </p>
            </div>
          )}

          {/* Validation Warnings */}
          {validation && validation.warnings.length > 0 && validation.valid && (
            <div className="validation-warnings">
              <h4>⚠️ Warnings ({validation.warnings.length})</h4>
              <ul>
                {validation.warnings.map((warning, idx) => (
                  <li key={idx} className="warning-item">{warning}</li>
                ))}
              </ul>
              <p className="help-text">
                These warnings won't stop the import, but you may want to review them.
              </p>
            </div>
          )}

          {/* Duplicate Detection */}
          {duplicates && validation && validation.valid && (
            <div className="duplicate-detection">
              <h4>🔍 Duplicate Detection</h4>
              <div className="duplicate-stats">
                <div className="stat-card">
                  <span className="stat-number">{duplicates.unique.length}</span>
                  <span className="stat-label">New {importType}</span>
                </div>
                <div className="stat-card warning">
                  <span className="stat-number">{duplicates.duplicates.length}</span>
                  <span className="stat-label">Duplicates found</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">{csvData.length}</span>
                  <span className="stat-label">Total in CSV</span>
                </div>
              </div>

              {duplicates.duplicates.length > 0 && (
                <div className="duplicate-list">
                  <h5>Duplicate {importType === 'users' ? 'Emails' : 'Tracking Numbers'}</h5>
                  <table className="duplicate-table">
                    <thead>
                      <tr>
                        <th>CSV Row</th>
                        <th>Existing Record</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {duplicates.duplicates.slice(0, 10).map((dup, idx) => (
                        <tr key={idx}>
                          <td>
                            {importType === 'users' ? dup.row.email : dup.row.tracking_number}
                            <br />
                            <small>{importType === 'users' ? dup.row.full_name : dup.row.product_name}</small>
                          </td>
                          <td>
                            ID: {dup.existingId}
                            <br />
                            <small>{dup.existingName}</small>
                          </td>
                          <td>
                            <span className="action-badge">Will be skipped</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {duplicates.duplicates.length > 10 && (
                    <p className="help-text">Showing 10 of {duplicates.duplicates.length} duplicates</p>
                  )}
                </div>
              )}

              <div className="import-options">
                <h5>Import Options</h5>
                <label>
                  <input
                    type="checkbox"
                    checked={importOptions.skipDuplicates}
                    onChange={(e) => setImportOptions({ ...importOptions, skipDuplicates: e.target.checked })}
                  />
                  <span>Skip duplicates (recommended)</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={importOptions.updateDuplicates}
                    onChange={(e) => setImportOptions({ ...importOptions, updateDuplicates: e.target.checked })}
                    disabled={importOptions.skipDuplicates}
                  />
                  <span>Update existing records with CSV data (⚠️ use with caution)</span>
                </label>
              </div>
            </div>
          )}

          <div className="import-actions">
            <button onClick={handleReset} className="btn btn-secondary">
              Cancel
            </button>
            {validation && validation.valid && (
              <button onClick={handleImport} className="btn btn-primary" disabled={loading}>
                {loading ? 'Importing...' : `Import ${duplicates?.unique.length || 0} ${importType}`}
              </button>
            )}
            {validation && !validation.valid && (
              <button onClick={handleReset} className="btn btn-primary">
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 3 && (
        <div className="import-step">
          <div className="loading-spinner">
            <h3>⏳ Importing {importType}...</h3>
            <p>Please wait while we import your data.</p>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && importResults && (
        <div className="import-step">
          <h3>✅ Import Complete!</h3>

          <div className="import-results">
            <div className="result-card success">
              <span className="result-number">{importResults.imported}</span>
              <span className="result-label">New {importType} imported</span>
            </div>
            {importResults.updated > 0 && (
              <div className="result-card warning">
                <span className="result-number">{importResults.updated}</span>
                <span className="result-label">{importType} updated</span>
              </div>
            )}
            {importResults.skipped > 0 && (
              <div className="result-card">
                <span className="result-number">{importResults.skipped}</span>
                <span className="result-label">{importType} skipped</span>
              </div>
            )}
          </div>

          <div className="import-actions">
            <button onClick={handleReset} className="btn btn-primary">
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
