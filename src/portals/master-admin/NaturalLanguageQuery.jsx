import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Database,
  Sparkles,
  Play,
  Copy,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2,
  HelpCircle,
  BarChart3,
  Users,
  Package,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { naturalLanguageQuery } from '../../services/ai.service.js';

/**
 * NaturalLanguageQuery - AI-powered database querying with natural language
 *
 * Master Admin feature that allows querying the database using plain English
 * questions, which are converted to SQL via local LLM (Ollama).
 */
export default function NaturalLanguageQuery() {
  const [question, setQuestion] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [queryHistory, setQueryHistory] = useState([]);
  const [showSQL, setShowSQL] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });

  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Example queries for quick access
  const exampleQueries = [
    { icon: Package, text: 'How many equipment items are available?', category: 'Equipment' },
    { icon: Users, text: 'Which students have the most bookings?', category: 'Users' },
    { icon: Calendar, text: 'Show all overdue bookings', category: 'Bookings' },
    { icon: BarChart3, text: 'What is the most popular equipment?', category: 'Analytics' },
    { icon: Package, text: 'List equipment that needs maintenance', category: 'Equipment' },
    { icon: Users, text: 'How many students are in each department?', category: 'Users' },
  ];

  // Handle query submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    if (!question.trim() || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress({ stage: 'Parsing question...', percent: 10 });

    try {
      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.percent >= 90) return prev;
          const stages = [
            { stage: 'Understanding question...', percent: 25 },
            { stage: 'Generating SQL query...', percent: 50 },
            { stage: 'Executing query...', percent: 75 },
            { stage: 'Formatting results...', percent: 90 },
          ];
          const next = stages.find(s => s.percent > prev.percent);
          return next || prev;
        });
      }, 500);

      const response = await naturalLanguageQuery(question);
      clearInterval(progressInterval);

      if (response.success) {
        setProgress({ stage: 'Complete!', percent: 100 });
        setResult(response.result || response);

        // Add to history
        setQueryHistory(prev => [{
          question,
          sql: response.result?.sql || response.sql,
          rowCount: response.result?.rowCount || response.rowCount || 0,
          timestamp: new Date(),
          success: true
        }, ...prev.slice(0, 9)]); // Keep last 10 queries
      } else {
        throw new Error(response.error || 'Query failed');
      }
    } catch (err) {
      setError(err.message);
      setProgress({ stage: '', percent: 0 });

      // Add failed query to history
      setQueryHistory(prev => [{
        question,
        error: err.message,
        timestamp: new Date(),
        success: false
      }, ...prev.slice(0, 9)]);
    } finally {
      setIsProcessing(false);
    }
  }, [question, isProcessing]);

  // Use example query
  const useExample = useCallback((text) => {
    setQuestion(text);
    inputRef.current?.focus();
  }, []);

  // Copy SQL to clipboard
  const copySQL = useCallback(() => {
    if (result?.sql) {
      navigator.clipboard.writeText(result.sql);
    }
  }, [result]);

  // Export results to CSV
  const exportToCSV = useCallback(() => {
    if (!result?.data?.length) return;

    const headers = Object.keys(result.data[0]);
    const rows = result.data.map(row =>
      headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  // Scroll to results when available
  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  // Format cell value for display
  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString();
    }
    return String(value);
  };

  return (
    <div className="nlq-container">
      <div className="nlq-header">
        <div className="nlq-header-icon">
          <Sparkles size={32} />
        </div>
        <div>
          <h1>Natural Language Query</h1>
          <p>Ask questions about your data in plain English</p>
        </div>
      </div>

      {/* Query Input Section */}
      <div className="nlq-input-section glass-panel">
        <form onSubmit={handleSubmit}>
          <div className="nlq-input-wrapper">
            <MessageSquare className="nlq-input-icon" size={20} />
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about equipment, bookings, or users..."
              className="nlq-input"
              disabled={isProcessing}
            />
            <button
              type="submit"
              className="nlq-submit-btn"
              disabled={!question.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="nlq-spinner" size={20} />
              ) : (
                <Play size={20} />
              )}
              <span>{isProcessing ? 'Processing...' : 'Run Query'}</span>
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        {isProcessing && (
          <div className="nlq-progress">
            <div className="nlq-progress-bar">
              <div
                className="nlq-progress-fill"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="nlq-progress-text">{progress.stage}</span>
          </div>
        )}
      </div>

      {/* Example Queries */}
      <div className="nlq-examples">
        <h3>
          <HelpCircle size={16} />
          Try these example queries
        </h3>
        <div className="nlq-examples-grid">
          {exampleQueries.map((example, index) => {
            const Icon = example.icon;
            return (
              <button
                key={index}
                className="nlq-example-btn"
                onClick={() => useExample(example.text)}
              >
                <Icon size={16} />
                <span>{example.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="nlq-error glass-panel">
          <AlertCircle size={20} />
          <div>
            <strong>Query Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div ref={resultsRef} className="nlq-results glass-panel">
          <div className="nlq-results-header">
            <div className="nlq-results-title">
              <CheckCircle size={20} className="nlq-success-icon" />
              <span>Query Results</span>
              <span className="nlq-row-count">
                {result.rowCount || result.data?.length || 0} rows
              </span>
            </div>
            <div className="nlq-results-actions">
              <button
                className="nlq-action-btn"
                onClick={() => setShowSQL(!showSQL)}
                title={showSQL ? 'Hide SQL' : 'Show SQL'}
              >
                <Database size={16} />
                <span>SQL</span>
                {showSQL ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <button
                className="nlq-action-btn"
                onClick={copySQL}
                title="Copy SQL"
              >
                <Copy size={16} />
              </button>
              <button
                className="nlq-action-btn"
                onClick={exportToCSV}
                disabled={!result.data?.length}
                title="Export to CSV"
              >
                <Download size={16} />
              </button>
              <button
                className="nlq-action-btn"
                onClick={() => handleSubmit()}
                title="Re-run query"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* SQL Display */}
          {showSQL && result.sql && (
            <div className="nlq-sql-display">
              <pre><code>{result.sql}</code></pre>
            </div>
          )}

          {/* Data Table */}
          {result.data && result.data.length > 0 ? (
            <div className="nlq-table-wrapper">
              <table className="nlq-table">
                <thead>
                  <tr>
                    {Object.keys(result.data[0]).map((header) => (
                      <th key={header}>{header.replace(/_/g, ' ')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{formatCellValue(value)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="nlq-no-results">
              <Database size={32} />
              <p>No data returned from query</p>
            </div>
          )}

          {/* Demo Mode Note */}
          {result.note && (
            <div className="nlq-demo-note">
              <AlertCircle size={14} />
              <span>{result.note}</span>
            </div>
          )}
        </div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <div className="nlq-history glass-panel">
          <h3>Recent Queries</h3>
          <div className="nlq-history-list">
            {queryHistory.map((item, index) => (
              <button
                key={index}
                className={`nlq-history-item ${item.success ? '' : 'failed'}`}
                onClick={() => useExample(item.question)}
              >
                <span className="nlq-history-question">{item.question}</span>
                <span className="nlq-history-meta">
                  {item.success ? (
                    <>{item.rowCount} rows</>
                  ) : (
                    <span className="nlq-history-error">Failed</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
