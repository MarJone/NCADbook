import React, { useState, useCallback, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  User,
  Package,
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  AlertCircle,
  Eye,
  Check,
  X
} from 'lucide-react';
import { analyzeJustification } from '../../services/ai.service.js';
import './BookingJustificationAnalyzer.css';

/**
 * BookingJustificationAnalyzer - AI-powered booking justification analysis
 *
 * Master Admin feature that analyzes student booking justifications to help
 * admins make faster, more consistent approval decisions.
 */

// Mock pending bookings for demo mode
const MOCK_BOOKINGS = [
  {
    id: 'BK-001',
    student: { full_name: 'Emma O\'Brien', email: 'emma.obrien@student.ncad.ie', department: 'Moving Image Design' },
    equipment: { product_name: 'Canon EOS R5', category: 'Camera' },
    start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Final year documentary project about Dublin street artists. Need high-quality 4K footage for cinema screening.',
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-002',
    student: { full_name: 'Liam Murphy', email: 'liam.murphy@student.ncad.ie', department: 'Graphic Design' },
    equipment: { product_name: 'Sony A7 IV', category: 'Camera' },
    start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'need camera for project',
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-003',
    student: { full_name: 'Sophie Walsh', email: 'sophie.walsh@student.ncad.ie', department: 'Illustration' },
    equipment: { product_name: 'Zoom H6 Audio Recorder', category: 'Audio' },
    start_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Recording ambient sounds for animated short film soundtrack. Creating immersive audio landscape for gallery installation piece.',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-004',
    student: { full_name: 'James Kelly', email: 'james.kelly@student.ncad.ie', department: 'Moving Image Design' },
    equipment: { product_name: 'DJI Ronin RS3 Pro', category: 'Stabilizer' },
    start_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'stuff',
    status: 'pending',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-005',
    student: { full_name: 'Aoife Ryan', email: 'aoife.ryan@student.ncad.ie', department: 'Graphic Design' },
    equipment: { product_name: 'Profoto B10 Plus', category: 'Lighting' },
    start_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'Professional product photography shoot for portfolio. Photographing ceramic pieces for end-of-year exhibition catalog.',
    status: 'pending',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'BK-006',
    student: { full_name: 'Sean Byrne', email: 'sean.byrne@student.ncad.ie', department: 'Illustration' },
    equipment: { product_name: 'MacBook Pro 16"', category: 'Computer' },
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'My laptop broke and I need to finish my digital illustrations for the degree show. Working on a series of 12 large-format prints.',
    status: 'pending',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  }
];

// Recommendation badge component
function RecommendationBadge({ recommendation, score }) {
  const config = {
    approve: { icon: ThumbsUp, color: 'var(--color-success-500)', bg: 'rgba(34, 197, 94, 0.1)', label: 'Recommend Approve' },
    review: { icon: HelpCircle, color: 'var(--color-warning-500)', bg: 'rgba(245, 158, 11, 0.1)', label: 'Needs Review' },
    reject: { icon: ThumbsDown, color: 'var(--color-error-500)', bg: 'rgba(239, 68, 68, 0.1)', label: 'Consider Rejecting' }
  };

  const { icon: Icon, color, bg, label } = config[recommendation] || config.review;

  return (
    <div className="bja-recommendation-badge" style={{ backgroundColor: bg, color }}>
      <Icon size={14} />
      <span>{label}</span>
      <span className="bja-score">{score}/100</span>
    </div>
  );
}

export default function BookingJustificationAnalyzer() {
  const [bookings, setBookings] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, approve, review, reject
  const [stats, setStats] = useState({ total: 0, approve: 0, review: 0, reject: 0 });
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // Load pending bookings
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);
      // In demo mode, use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      setBookings(MOCK_BOOKINGS);
      setIsLoading(false);
    };
    loadBookings();
  }, []);

  // Update stats when analyses change
  useEffect(() => {
    const newStats = { total: bookings.length, approve: 0, review: 0, reject: 0 };
    Object.values(analyses).forEach(analysis => {
      if (analysis.recommendation) {
        newStats[analysis.recommendation]++;
      }
    });
    setStats(newStats);
  }, [analyses, bookings]);

  // Analyze a single booking
  const analyzeBooking = useCallback(async (booking) => {
    setAnalyzingId(booking.id);
    try {
      const result = await analyzeJustification({
        purpose: booking.purpose,
        equipment: booking.equipment.product_name,
        category: booking.equipment.category,
        duration: Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24)),
        department: booking.student.department
      });

      if (result.success) {
        setAnalyses(prev => ({
          ...prev,
          [booking.id]: result.analysis
        }));
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzingId(null);
    }
  }, []);

  // Analyze all pending bookings
  const analyzeAll = useCallback(async () => {
    setBulkAnalyzing(true);
    setBulkProgress(0);

    const unanalyzed = bookings.filter(b => !analyses[b.id]);
    for (let i = 0; i < unanalyzed.length; i++) {
      await analyzeBooking(unanalyzed[i]);
      setBulkProgress(((i + 1) / unanalyzed.length) * 100);
    }

    setBulkAnalyzing(false);
  }, [bookings, analyses, analyzeBooking]);

  // Toggle expanded booking details
  const toggleExpanded = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // Filter bookings based on recommendation
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    const analysis = analyses[booking.id];
    return analysis?.recommendation === filter;
  });

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate loan duration
  const getDuration = (start, end) => {
    const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  // Get time ago string
  const getTimeAgo = (dateString) => {
    const minutes = Math.floor((Date.now() - new Date(dateString)) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="bja-container">
      {/* Header */}
      <div className="bja-header">
        <div className="bja-header-icon">
          <FileText size={32} />
        </div>
        <div>
          <h1>Booking Justification Analyzer</h1>
          <p>AI-powered analysis of booking request justifications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bja-stats glass-panel">
        <div className="bja-stat-card">
          <div className="bja-stat-icon total">
            <BarChart3 size={20} />
          </div>
          <div className="bja-stat-info">
            <span className="bja-stat-value">{stats.total}</span>
            <span className="bja-stat-label">Pending</span>
          </div>
        </div>
        <div className="bja-stat-card clickable" onClick={() => setFilter(filter === 'approve' ? 'all' : 'approve')}>
          <div className="bja-stat-icon approve">
            <ThumbsUp size={20} />
          </div>
          <div className="bja-stat-info">
            <span className="bja-stat-value">{stats.approve}</span>
            <span className="bja-stat-label">Recommend Approve</span>
          </div>
        </div>
        <div className="bja-stat-card clickable" onClick={() => setFilter(filter === 'review' ? 'all' : 'review')}>
          <div className="bja-stat-icon review">
            <HelpCircle size={20} />
          </div>
          <div className="bja-stat-info">
            <span className="bja-stat-value">{stats.review}</span>
            <span className="bja-stat-label">Needs Review</span>
          </div>
        </div>
        <div className="bja-stat-card clickable" onClick={() => setFilter(filter === 'reject' ? 'all' : 'reject')}>
          <div className="bja-stat-icon reject">
            <ThumbsDown size={20} />
          </div>
          <div className="bja-stat-info">
            <span className="bja-stat-value">{stats.reject}</span>
            <span className="bja-stat-label">Consider Rejecting</span>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bja-actions glass-panel">
        <div className="bja-filter-group">
          <Filter size={16} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bja-filter-select"
          >
            <option value="all">All Bookings</option>
            <option value="approve">Recommend Approve</option>
            <option value="review">Needs Review</option>
            <option value="reject">Consider Rejecting</option>
          </select>
        </div>

        <button
          className="bja-analyze-all-btn"
          onClick={analyzeAll}
          disabled={bulkAnalyzing || Object.keys(analyses).length === bookings.length}
        >
          {bulkAnalyzing ? (
            <>
              <Loader2 className="bja-spinner" size={18} />
              <span>Analyzing... {Math.round(bulkProgress)}%</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Analyze All ({bookings.length - Object.keys(analyses).length} remaining)</span>
            </>
          )}
        </button>
      </div>

      {/* Bulk Progress */}
      {bulkAnalyzing && (
        <div className="bja-bulk-progress">
          <div className="bja-progress-bar">
            <div className="bja-progress-fill" style={{ width: `${bulkProgress}%` }} />
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="bja-bookings-list">
        {isLoading ? (
          <div className="bja-loading glass-panel">
            <Loader2 className="bja-spinner" size={32} />
            <p>Loading pending bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bja-empty glass-panel">
            <FileText size={48} />
            <h3>No bookings match filter</h3>
            <p>Try changing the filter or analyze more bookings</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const analysis = analyses[booking.id];
            const isExpanded = expandedId === booking.id;
            const isAnalyzing = analyzingId === booking.id;

            return (
              <div key={booking.id} className={`bja-booking-card glass-panel ${isExpanded ? 'expanded' : ''}`}>
                {/* Booking Header */}
                <div className="bja-booking-header" onClick={() => toggleExpanded(booking.id)}>
                  <div className="bja-booking-main">
                    <div className="bja-booking-id">{booking.id}</div>
                    <div className="bja-booking-info">
                      <div className="bja-student">
                        <User size={14} />
                        <span>{booking.student.full_name}</span>
                        <span className="bja-department">{booking.student.department}</span>
                      </div>
                      <div className="bja-equipment">
                        <Package size={14} />
                        <span>{booking.equipment.product_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bja-booking-meta">
                    <div className="bja-dates">
                      <Calendar size={14} />
                      <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                      <span className="bja-duration">({getDuration(booking.start_date, booking.end_date)})</span>
                    </div>
                    <div className="bja-submitted">
                      <Clock size={14} />
                      <span>{getTimeAgo(booking.created_at)}</span>
                    </div>
                  </div>

                  <div className="bja-booking-actions">
                    {analysis ? (
                      <RecommendationBadge
                        recommendation={analysis.recommendation}
                        score={analysis.score}
                      />
                    ) : (
                      <button
                        className="bja-analyze-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          analyzeBooking(booking);
                        }}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="bja-spinner" size={16} />
                        ) : (
                          <Sparkles size={16} />
                        )}
                        <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                      </button>
                    )}
                    <button className="bja-expand-btn">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Justification Preview */}
                <div className="bja-justification-preview">
                  <span className="bja-label">Justification:</span>
                  <span className={`bja-purpose ${booking.purpose.length < 30 ? 'short' : ''}`}>
                    "{booking.purpose}"
                  </span>
                </div>

                {/* Expanded Analysis */}
                {isExpanded && (
                  <div className="bja-expanded-content">
                    {analysis ? (
                      <div className="bja-analysis">
                        <div className="bja-analysis-header">
                          <Sparkles size={16} />
                          <span>AI Analysis</span>
                          <button
                            className="bja-reanalyze-btn"
                            onClick={() => analyzeBooking(booking)}
                            disabled={isAnalyzing}
                          >
                            <RefreshCw size={14} className={isAnalyzing ? 'bja-spinner' : ''} />
                          </button>
                        </div>

                        {/* Score Breakdown */}
                        <div className="bja-score-breakdown">
                          <div className="bja-score-item">
                            <span className="bja-score-label">Clarity</span>
                            <div className="bja-score-bar">
                              <div
                                className="bja-score-fill"
                                style={{ width: `${analysis.clarity}%` }}
                                data-score={analysis.clarity >= 70 ? 'good' : analysis.clarity >= 40 ? 'medium' : 'low'}
                              />
                            </div>
                            <span className="bja-score-value">{analysis.clarity}%</span>
                          </div>
                          <div className="bja-score-item">
                            <span className="bja-score-label">Relevance</span>
                            <div className="bja-score-bar">
                              <div
                                className="bja-score-fill"
                                style={{ width: `${analysis.relevance}%` }}
                                data-score={analysis.relevance >= 70 ? 'good' : analysis.relevance >= 40 ? 'medium' : 'low'}
                              />
                            </div>
                            <span className="bja-score-value">{analysis.relevance}%</span>
                          </div>
                          <div className="bja-score-item">
                            <span className="bja-score-label">Specificity</span>
                            <div className="bja-score-bar">
                              <div
                                className="bja-score-fill"
                                style={{ width: `${analysis.specificity}%` }}
                                data-score={analysis.specificity >= 70 ? 'good' : analysis.specificity >= 40 ? 'medium' : 'low'}
                              />
                            </div>
                            <span className="bja-score-value">{analysis.specificity}%</span>
                          </div>
                        </div>

                        {/* Analysis Summary */}
                        <div className="bja-summary">
                          <h4>Summary</h4>
                          <p>{analysis.summary}</p>
                        </div>

                        {/* Flags */}
                        {analysis.flags && analysis.flags.length > 0 && (
                          <div className="bja-flags">
                            <h4>
                              <AlertTriangle size={14} />
                              Potential Issues
                            </h4>
                            <ul>
                              {analysis.flags.map((flag, index) => (
                                <li key={index}>{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Suggestions */}
                        {analysis.suggestions && analysis.suggestions.length > 0 && (
                          <div className="bja-suggestions">
                            <h4>
                              <HelpCircle size={14} />
                              Suggestions for Review
                            </h4>
                            <ul>
                              {analysis.suggestions.map((suggestion, index) => (
                                <li key={index}>{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bja-quick-actions">
                          <button className="bja-action-approve">
                            <Check size={16} />
                            <span>Approve</span>
                          </button>
                          <button className="bja-action-view">
                            <Eye size={16} />
                            <span>View Full Booking</span>
                          </button>
                          <button className="bja-action-reject">
                            <X size={16} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bja-no-analysis">
                        <AlertCircle size={24} />
                        <p>Click "Analyze" to get AI-powered insights on this justification</p>
                        <button
                          className="bja-analyze-btn-lg"
                          onClick={() => analyzeBooking(booking)}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <Loader2 className="bja-spinner" size={18} />
                          ) : (
                            <Sparkles size={18} />
                          )}
                          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Justification'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Tips Section */}
      <div className="bja-tips glass-panel">
        <h3>
          <Sparkles size={16} />
          How AI Analysis Works
        </h3>
        <ul>
          <li><strong>Clarity:</strong> How well-explained is the purpose? Vague requests score lower.</li>
          <li><strong>Relevance:</strong> Does the equipment match the stated purpose and student's department?</li>
          <li><strong>Specificity:</strong> Are project details provided? Duration, deliverables, context?</li>
          <li><strong>Flags:</strong> Potential issues like mismatched equipment-purpose or unusually long loans.</li>
        </ul>
        <p className="bja-tip-note">AI recommendations are suggestions only. Always use your judgment for final decisions.</p>
      </div>
    </div>
  );
}
