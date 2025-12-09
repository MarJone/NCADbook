import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  RotateCcw,
  Save,
  X,
  AlertTriangle,
  Wrench,
  ThumbsUp,
  Ban,
  FileText,
  ChevronDown,
  History,
  Trash2
} from 'lucide-react';
import { assessEquipmentCondition } from '../../services/ai.service.js';

/**
 * ConditionAssessment - AI-powered equipment condition assessment
 *
 * Allows admins to photograph or upload images of equipment
 * and receive AI-powered condition assessments via local LLM vision model.
 */
export default function ConditionAssessment() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState(null);
  const [equipmentInfo, setEquipmentInfo] = useState({
    name: '',
    category: '',
    previousCondition: ''
  });
  const [showHistory, setShowHistory] = useState(false);
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Condition rating configurations
  const conditionRatings = {
    normal: {
      label: 'Normal',
      icon: ThumbsUp,
      color: 'var(--semantic-success)',
      bgColor: 'rgba(34, 197, 94, 0.1)',
      description: 'Equipment is in good working condition'
    },
    minor_damage: {
      label: 'Minor Damage',
      icon: AlertTriangle,
      color: 'var(--semantic-warning)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      description: 'Minor wear or damage, still functional'
    },
    major_damage: {
      label: 'Major Damage',
      icon: Ban,
      color: 'var(--semantic-error)',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      description: 'Significant damage, may need repair'
    }
  };

  // Action recommendations
  const actionRecommendations = {
    none: { label: 'No Action Needed', color: 'var(--semantic-success)' },
    note: { label: 'Add Note', color: 'var(--semantic-info)' },
    maintenance: { label: 'Schedule Maintenance', color: 'var(--semantic-warning)' },
    out_of_service: { label: 'Mark Out of Service', color: 'var(--semantic-error)' }
  };

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setImagePreview(reader.result);
      setAssessment(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1280, height: 720 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setError(null);
    } catch (err) {
      setError('Could not access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setImage(imageData);
    setImagePreview(imageData);
    setAssessment(null);
    stopCamera();
  }, [stopCamera]);

  // Clear current image
  const clearImage = useCallback(() => {
    setImage(null);
    setImagePreview(null);
    setAssessment(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Run AI assessment
  const runAssessment = useCallback(async () => {
    if (!image || isAssessing) return;

    setIsAssessing(true);
    setError(null);
    setAssessment(null);
    setProgress({ stage: 'Preparing image...', percent: 10 });

    try {
      // Simulate progress updates
      const progressStages = [
        { stage: 'Analyzing image...', percent: 30 },
        { stage: 'Detecting condition...', percent: 60 },
        { stage: 'Generating assessment...', percent: 85 },
      ];

      let stageIndex = 0;
      const progressInterval = setInterval(() => {
        if (stageIndex < progressStages.length) {
          setProgress(progressStages[stageIndex]);
          stageIndex++;
        }
      }, 600);

      const result = await assessEquipmentCondition(image, equipmentInfo);
      clearInterval(progressInterval);

      if (result.success) {
        setProgress({ stage: 'Complete!', percent: 100 });
        setAssessment(result.assessment);

        // Add to history
        setAssessmentHistory(prev => [{
          image: imagePreview,
          assessment: result.assessment,
          equipmentInfo: { ...equipmentInfo },
          timestamp: new Date(),
          source: result.source
        }, ...prev.slice(0, 9)]);
      } else {
        throw new Error(result.error || 'Assessment failed');
      }
    } catch (err) {
      setError(err.message);
      setProgress({ stage: '', percent: 0 });
    } finally {
      setIsAssessing(false);
    }
  }, [image, isAssessing, equipmentInfo, imagePreview]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Get condition config
  const getConditionConfig = (rating) => {
    return conditionRatings[rating] || conditionRatings.normal;
  };

  // Get action config
  const getActionConfig = (action) => {
    return actionRecommendations[action] || actionRecommendations.none;
  };

  return (
    <div className="condition-assessment-container">
      <div className="ca-header">
        <div className="ca-header-icon">
          <Camera size={32} />
        </div>
        <div>
          <h1>AI Condition Assessment</h1>
          <p>Analyze equipment condition with AI-powered vision</p>
        </div>
        <button
          className="ca-history-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          <History size={18} />
          <span>History ({assessmentHistory.length})</span>
        </button>
      </div>

      <div className="ca-content">
        {/* Left Column - Image Capture/Upload */}
        <div className="ca-capture-section glass-panel">
          <h3>Equipment Image</h3>

          {/* Equipment Info Fields */}
          <div className="ca-equipment-info">
            <div className="ca-input-group">
              <label>Equipment Name (optional)</label>
              <input
                type="text"
                value={equipmentInfo.name}
                onChange={(e) => setEquipmentInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Canon EOS R5"
              />
            </div>
            <div className="ca-input-row">
              <div className="ca-input-group">
                <label>Category</label>
                <select
                  value={equipmentInfo.category}
                  onChange={(e) => setEquipmentInfo(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="">Select category</option>
                  <option value="camera">Camera</option>
                  <option value="lens">Lens</option>
                  <option value="audio">Audio</option>
                  <option value="lighting">Lighting</option>
                  <option value="grip">Grip/Support</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="ca-input-group">
                <label>Previous Condition</label>
                <select
                  value={equipmentInfo.previousCondition}
                  onChange={(e) => setEquipmentInfo(prev => ({ ...prev, previousCondition: e.target.value }))}
                >
                  <option value="">Unknown</option>
                  <option value="normal">Normal</option>
                  <option value="minor_damage">Minor Damage</option>
                  <option value="major_damage">Major Damage</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image Preview Area */}
          <div className="ca-preview-area">
            {cameraActive ? (
              <div className="ca-camera-view">
                <video ref={videoRef} autoPlay playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="ca-camera-controls">
                  <button className="ca-capture-btn" onClick={capturePhoto}>
                    <div className="ca-capture-btn-inner" />
                  </button>
                  <button className="ca-cancel-btn" onClick={stopCamera}>
                    <X size={20} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : imagePreview ? (
              <div className="ca-image-preview">
                <img src={imagePreview} alt="Equipment preview" />
                <button className="ca-clear-btn" onClick={clearImage}>
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="ca-upload-placeholder">
                <ImageIcon size={48} />
                <p>Upload or capture an image of the equipment</p>
                <div className="ca-upload-actions">
                  <button className="ca-btn primary" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={18} />
                    Upload Image
                  </button>
                  <button className="ca-btn secondary" onClick={startCamera}>
                    <Camera size={18} />
                    Take Photo
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>

          {/* Assess Button */}
          {imagePreview && !cameraActive && (
            <button
              className="ca-assess-btn"
              onClick={runAssessment}
              disabled={isAssessing}
            >
              {isAssessing ? (
                <>
                  <Loader2 className="ca-spinner" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Run AI Assessment
                </>
              )}
            </button>
          )}

          {/* Progress Indicator */}
          {isAssessing && (
            <div className="ca-progress">
              <div className="ca-progress-bar">
                <div
                  className="ca-progress-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="ca-progress-text">{progress.stage}</span>
            </div>
          )}
        </div>

        {/* Right Column - Assessment Results */}
        <div className="ca-results-section glass-panel">
          <h3>Assessment Results</h3>

          {/* Error Display */}
          {error && (
            <div className="ca-error">
              <AlertCircle size={20} />
              <div>
                <strong>Assessment Error</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Assessment Results */}
          {assessment ? (
            <div className="ca-assessment-results">
              {/* Condition Rating */}
              <div
                className="ca-condition-badge"
                style={{
                  backgroundColor: getConditionConfig(assessment.condition_rating || assessment.condition)?.bgColor,
                  borderColor: getConditionConfig(assessment.condition_rating || assessment.condition)?.color
                }}
              >
                {(() => {
                  const config = getConditionConfig(assessment.condition_rating || assessment.condition);
                  const Icon = config.icon;
                  return (
                    <>
                      <Icon size={24} style={{ color: config.color }} />
                      <div>
                        <span className="ca-condition-label" style={{ color: config.color }}>
                          {config.label}
                        </span>
                        <span className="ca-condition-desc">{config.description}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Confidence Score */}
              {assessment.confidence && (
                <div className="ca-confidence">
                  <span>Confidence</span>
                  <div className="ca-confidence-bar">
                    <div
                      className="ca-confidence-fill"
                      style={{ width: `${assessment.confidence * 100}%` }}
                    />
                  </div>
                  <span className="ca-confidence-value">
                    {Math.round(assessment.confidence * 100)}%
                  </span>
                </div>
              )}

              {/* Description */}
              {assessment.description && (
                <div className="ca-description">
                  <FileText size={16} />
                  <p>{assessment.description}</p>
                </div>
              )}

              {/* Visible Issues */}
              {assessment.visible_issues?.length > 0 && (
                <div className="ca-issues">
                  <h4>
                    <AlertTriangle size={16} />
                    Visible Issues
                  </h4>
                  <ul>
                    {assessment.visible_issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Affected Components */}
              {assessment.affected_components?.length > 0 && (
                <div className="ca-components">
                  <h4>Affected Components</h4>
                  <div className="ca-component-tags">
                    {assessment.affected_components.map((component, index) => (
                      <span key={index} className="ca-component-tag">
                        {component}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              {assessment.recommended_action && (
                <div className="ca-recommended-action">
                  <Wrench size={16} />
                  <span>Recommended Action:</span>
                  <span
                    className="ca-action-badge"
                    style={{ color: getActionConfig(assessment.recommended_action).color }}
                  >
                    {getActionConfig(assessment.recommended_action).label}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="ca-action-buttons">
                <button className="ca-btn primary">
                  <Save size={16} />
                  Save to Equipment Record
                </button>
                <button className="ca-btn secondary" onClick={clearImage}>
                  <RotateCcw size={16} />
                  New Assessment
                </button>
              </div>
            </div>
          ) : (
            <div className="ca-no-results">
              <Sparkles size={48} />
              <p>Upload or capture an equipment image to get an AI-powered condition assessment</p>
              <ul>
                <li>Take a clear photo of the equipment</li>
                <li>Include any visible damage or wear</li>
                <li>AI will analyze and suggest actions</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Assessment History Panel */}
      {showHistory && assessmentHistory.length > 0 && (
        <div className="ca-history-panel glass-panel">
          <div className="ca-history-header">
            <h3>Assessment History</h3>
            <button
              className="ca-clear-history"
              onClick={() => setAssessmentHistory([])}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
          <div className="ca-history-list">
            {assessmentHistory.map((item, index) => {
              const config = getConditionConfig(item.assessment.condition_rating || item.assessment.condition);
              return (
                <div key={index} className="ca-history-item">
                  <img src={item.image} alt="Assessment" className="ca-history-thumb" />
                  <div className="ca-history-details">
                    <span className="ca-history-name">
                      {item.equipmentInfo.name || 'Unknown Equipment'}
                    </span>
                    <span
                      className="ca-history-condition"
                      style={{ color: config.color }}
                    >
                      {config.label}
                    </span>
                    <span className="ca-history-time">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
