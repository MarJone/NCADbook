import { useState, useEffect, useCallback } from 'react';
import {
  getAllAISettings,
  updateAISetting,
  testOllamaConnection,
  getInstalledModels,
  getModelRecommendations,
  pullModel,
  deleteModel,
  cancelModelDownload,
  MODEL_TASKS,
  VRAM_PRESETS,
  AVAILABLE_MODELS,
  detectGPUInfo,
  estimateVRAMUsage
} from '../../services/aiSettings.service';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import {
  MessageSquare,
  Eye,
  Zap,
  RefreshCw,
  Sparkles,
  HardDrive,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Code,
  Brain,
  Monitor,
  Info,
  Download,
  Trash2,
  X,
  Package
} from 'lucide-react';
import './AISettings.css';

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Helper function to format ETA in seconds
function formatETA(seconds) {
  if (seconds < 0) return '--';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

export default function AISettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Settings state
  const [ollamaEnabled, setOllamaEnabled] = useState(true);
  const [ollamaEndpoint, setOllamaEndpoint] = useState('http://localhost:11434');
  const [defaultModels, setDefaultModels] = useState({
    text: 'mistral-small',
    vision: 'llava:13b',
    fast: 'llama3.1:8b'
  });
  const [cloudFallback, setCloudFallback] = useState({
    enabled: false,
    provider: '',
    api_key: ''
  });
  const [batchSchedule, setBatchSchedule] = useState({
    anomaly_detection: '02:00',
    demand_forecast: '03:00',
    maintenance_schedule: '04:00'
  });

  // Model management state
  const [installedModels, setInstalledModels] = useState([]);
  const [showAllModels, setShowAllModels] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  // VRAM configuration state
  const [vram, setVram] = useState(8);
  const [gpuInfo, setGpuInfo] = useState(null);
  const [vramUsage, setVramUsage] = useState(null);
  const [autoDetected, setAutoDetected] = useState(false);

  // Model download state
  const [downloadingModel, setDownloadingModel] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState({ percent: 0, status: '' });
  const [deletingModel, setDeletingModel] = useState(null);
  const [showModelLibrary, setShowModelLibrary] = useState(false);
  const [modelCategory, setModelCategory] = useState('all');
  const [modelSearch, setModelSearch] = useState('');

  useEffect(() => {
    loadSettings();
    // Try to detect GPU on mount
    const detected = detectGPUInfo();
    setGpuInfo(detected);
    if (detected.detected && detected.vram) {
      setVram(detected.vram);
      setAutoDetected(true);
    }
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await getAllAISettings();
      let endpoint = 'http://localhost:11434';

      // Parse settings from API response
      settings.forEach(setting => {
        const value = typeof setting.setting_value === 'string'
          ? JSON.parse(setting.setting_value)
          : setting.setting_value;

        switch (setting.setting_key) {
          case 'ollama_enabled':
            setOllamaEnabled(value.enabled);
            setOllamaEndpoint(value.endpoint);
            endpoint = value.endpoint;
            break;
          case 'default_model':
            setDefaultModels(value);
            break;
          case 'cloud_fallback':
            setCloudFallback(value);
            break;
          case 'batch_schedule':
            setBatchSchedule(value);
            break;
        }
      });

      // Fetch installed models
      await fetchInstalledModels(endpoint);
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      showToast('Failed to load AI settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstalledModels = useCallback(async (endpoint = ollamaEndpoint) => {
    setLoadingModels(true);
    try {
      const models = await getInstalledModels(endpoint);
      setInstalledModels(models);
      return models;
    } catch (error) {
      console.error('Failed to fetch models:', error);
      showToast('Failed to fetch installed models', 'error');
      return [];
    } finally {
      setLoadingModels(false);
    }
  }, [ollamaEndpoint, showToast]);

  const handleRecommendModels = useCallback(() => {
    if (installedModels.length === 0) {
      showToast('No models found. Please refresh the model list first.', 'warning');
      return;
    }

    const recs = getModelRecommendations(installedModels, vram);
    setRecommendations(recs);

    // Apply recommendations
    const newModels = { ...defaultModels };
    if (recs.text) newModels.text = recs.text.name;
    if (recs.vision) newModels.vision = recs.vision.name;
    if (recs.fast) newModels.fast = recs.fast.name;
    setDefaultModels(newModels);

    // Update VRAM usage estimate
    const usage = estimateVRAMUsage(newModels, installedModels);
    setVramUsage(usage);

    showToast(`Model recommendations applied for ${vram}GB VRAM!`, 'success');
  }, [installedModels, defaultModels, vram, showToast]);

  // Update VRAM usage when models change
  useEffect(() => {
    if (installedModels.length > 0 && (defaultModels.text || defaultModels.vision || defaultModels.fast)) {
      const usage = estimateVRAMUsage(defaultModels, installedModels);
      setVramUsage(usage);
    }
  }, [defaultModels, installedModels]);

  // Filter models by capability for dropdowns
  const getModelsForTask = useCallback((task) => {
    const taskConfig = MODEL_TASKS[task];
    if (!taskConfig) return installedModels;

    return installedModels.filter(model => {
      // For vision, require vision capability
      if (task === 'vision') {
        return model.capabilities.includes('vision');
      }
      // For text/fast, exclude embedding models
      return model.capabilities.includes('text') && !model.capabilities.includes('embedding');
    });
  }, [installedModels]);

  // Get icon for task
  const getTaskIcon = (task) => {
    switch (task) {
      case 'text': return MessageSquare;
      case 'vision': return Eye;
      case 'fast': return Zap;
      default: return Cpu;
    }
  };

  // Get capability icon
  const getCapabilityIcon = (cap) => {
    switch (cap) {
      case 'text':
      case 'chat': return MessageSquare;
      case 'vision':
      case 'image-analysis': return Eye;
      case 'code': return Code;
      case 'reasoning':
      case 'analysis': return Brain;
      case 'fast': return Zap;
      case 'embedding': return Database;
      default: return Cpu;
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testOllamaConnection(ollamaEndpoint);
      if (result.success) {
        showToast(`Connection successful! Found ${result.modelCount || 0} models`, 'success');
      } else {
        showToast(`Connection failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      showToast('Connection test failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Save all settings
      await updateAISetting('ollama_enabled', {
        enabled: ollamaEnabled,
        endpoint: ollamaEndpoint
      }, user.id);

      await updateAISetting('default_model', defaultModels, user.id);
      await updateAISetting('cloud_fallback', cloudFallback, user.id);
      await updateAISetting('batch_schedule', batchSchedule, user.id);

      showToast('AI settings saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      showToast('Failed to save AI settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle model download
  const handleDownloadModel = useCallback(async (modelName) => {
    if (downloadingModel) {
      showToast('Please wait for current download to complete', 'warning');
      return;
    }

    setDownloadingModel(modelName);
    setDownloadProgress({ percent: 0, status: 'Starting download...', speed: 0, eta: -1 });

    try {
      const result = await pullModel(modelName, ollamaEndpoint, (progress) => {
        setDownloadProgress({
          percent: progress.percent || 0,
          status: progress.status || 'Downloading...',
          completed: progress.completed || 0,
          total: progress.total || 0,
          speed: progress.speed || 0,
          eta: progress.eta ?? -1,
          layer: progress.layer || '',
          warning: progress.warning || null
        });
      });

      if (result.success) {
        showToast(`Successfully downloaded ${modelName}!`, 'success');
        // Refresh installed models
        await fetchInstalledModels();
      } else if (result.cancelled) {
        showToast(`Download of ${modelName} was cancelled`, 'info');
      } else {
        showToast(`Failed to download ${modelName}: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Download failed:', error);
      showToast(`Download failed: ${error.message}`, 'error');
    } finally {
      setDownloadingModel(null);
      setDownloadProgress({ percent: 0, status: '', speed: 0, eta: -1 });
    }
  }, [downloadingModel, ollamaEndpoint, fetchInstalledModels, showToast]);

  // Handle cancel download
  const handleCancelDownload = useCallback(() => {
    if (downloadingModel) {
      cancelModelDownload(downloadingModel);
      showToast('Cancelling download...', 'info');
    }
  }, [downloadingModel, showToast]);

  // Handle model deletion
  const handleDeleteModel = useCallback(async (modelName) => {
    if (deletingModel) return;

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${modelName}"? This cannot be undone.`)) {
      return;
    }

    setDeletingModel(modelName);

    try {
      const result = await deleteModel(modelName, ollamaEndpoint);

      if (result.success) {
        showToast(`Successfully deleted ${modelName}`, 'success');
        // Refresh installed models
        await fetchInstalledModels();
      } else {
        showToast(`Failed to delete ${modelName}: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      showToast(`Delete failed: ${error.message}`, 'error');
    } finally {
      setDeletingModel(null);
    }
  }, [deletingModel, ollamaEndpoint, fetchInstalledModels, showToast]);

  // Check if model is installed
  const isModelInstalled = useCallback((modelName) => {
    return installedModels.some(m => m.name === modelName || m.name === `${modelName}:latest`);
  }, [installedModels]);

  // Get VRAM label for current setting
  const getVramLabel = () => {
    const preset = VRAM_PRESETS.find(p => p.value === vram);
    return preset ? preset.label : `${vram} GB`;
  };

  if (loading) {
    return (
      <div className="ai-settings">
        <h2>AI Settings</h2>
        <div className="loading-state">
          <p>Loading AI settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-settings">
      <div className="settings-header">
        <div>
          <h2>AI Settings</h2>
          <p className="settings-subtitle">
            Configure local LLM (Ollama) integration and AI-powered features for equipment management.
          </p>
        </div>
      </div>

      <div className="settings-sections">
        {/* Ollama Configuration */}
        <section className="settings-section">
          <div className="section-header">
            <h3>Ollama Configuration</h3>
            <div className="section-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={ollamaEnabled}
                  onChange={(e) => setOllamaEnabled(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className={`toggle-label ${ollamaEnabled ? 'enabled' : 'disabled'}`}>
                {ollamaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <p className="section-description">
            Ollama runs locally on your server to provide AI-powered features without sending data to external services.
          </p>

          {ollamaEnabled && (
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="ollama-endpoint">Ollama Endpoint</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="ollama-endpoint"
                    value={ollamaEndpoint}
                    onChange={(e) => setOllamaEndpoint(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                  <button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="btn-test"
                  >
                    {testing ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
                <small className="form-hint">
                  URL where Ollama is running. Default: http://localhost:11434
                </small>
              </div>
            </div>
          )}
        </section>

        {/* Installed Models */}
        <section className="settings-section">
          <div className="section-header">
            <h3>Installed Models</h3>
            <button
              onClick={() => fetchInstalledModels()}
              disabled={loadingModels || !ollamaEnabled}
              className="btn-refresh"
            >
              <RefreshCw size={16} className={loadingModels ? 'spinning' : ''} />
              {loadingModels ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="section-description">
            Models currently available in your Ollama installation. Pull new models using <code>ollama pull model-name</code>.
          </p>

          {installedModels.length > 0 ? (
            <div className="installed-models">
              <div className="models-summary">
                <span className="models-count">
                  <HardDrive size={16} />
                  {installedModels.length} models installed
                </span>
                <button
                  className="btn-toggle-models"
                  onClick={() => setShowAllModels(!showAllModels)}
                >
                  {showAllModels ? 'Show Less' : 'Show All'}
                  {showAllModels ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              <div className={`models-list ${showAllModels ? 'expanded' : ''}`}>
                {(showAllModels ? installedModels : installedModels.slice(0, 4)).map(model => (
                  <div key={model.name} className="model-card">
                    <div className="model-card-header">
                      <span className="model-name">{model.displayName}</span>
                      <span className="model-size">{model.size}</span>
                    </div>
                    <div className="model-capabilities">
                      {model.capabilities.map(cap => {
                        const Icon = getCapabilityIcon(cap);
                        return (
                          <span key={cap} className={`capability-tag ${cap}`} title={cap}>
                            <Icon size={12} />
                            {cap}
                          </span>
                        );
                      })}
                    </div>
                    {model.description && (
                      <p className="model-description">{model.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-models">
              {loadingModels ? (
                <p>Loading models...</p>
              ) : ollamaEnabled ? (
                <p>No models found. Make sure Ollama is running and has models installed.</p>
              ) : (
                <p>Enable Ollama to view installed models.</p>
              )}
            </div>
          )}
        </section>

        {/* Model Library */}
        <section className="settings-section model-library-section">
          <div className="section-header">
            <h3>
              <Package size={20} />
              Model Library
              <span className="model-count">
                {AVAILABLE_MODELS.length} models
              </span>
            </h3>
            <button
              className="btn-toggle-library"
              onClick={() => setShowModelLibrary(!showModelLibrary)}
            >
              {showModelLibrary ? 'Hide Library' : 'Browse Models'}
              {showModelLibrary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          <p className="section-description">
            Download models directly from Ollama. Models are filtered by your VRAM configuration ({getVramLabel()}).
          </p>

          {/* Download Progress */}
          {downloadingModel && (
            <div className="download-progress-card">
              <div className="download-progress-header">
                <Download size={18} className="spinning" />
                <span>Downloading {downloadingModel}</span>
                <button
                  className="btn-cancel-download"
                  onClick={handleCancelDownload}
                  title="Cancel download"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Progress bar with animation */}
              <div className="download-progress-bar">
                <div
                  className="download-progress-fill"
                  style={{ width: `${downloadProgress.percent}%` }}
                />
              </div>

              {/* Main status row */}
              <div className="download-progress-info">
                <span className="download-status">
                  {downloadProgress.status}
                  {downloadProgress.layer && (
                    <span className="download-layer"> ({downloadProgress.layer})</span>
                  )}
                </span>
                <span className="download-percent">{downloadProgress.percent}%</span>
              </div>

              {/* Detailed stats row */}
              <div className="download-progress-details">
                {/* File size */}
                {downloadProgress.total > 0 && (
                  <span className="download-size">
                    {formatBytes(downloadProgress.completed)} / {formatBytes(downloadProgress.total)}
                  </span>
                )}

                {/* Speed */}
                {downloadProgress.speed > 0 && (
                  <span className="download-speed">
                    {formatBytes(downloadProgress.speed)}/s
                  </span>
                )}

                {/* ETA */}
                {downloadProgress.eta > 0 && (
                  <span className="download-eta">
                    ~{formatETA(downloadProgress.eta)} remaining
                  </span>
                )}
              </div>

              {/* Warning message */}
              {downloadProgress.warning && (
                <div className="download-warning">
                  <AlertCircle size={14} />
                  <span>{downloadProgress.warning}</span>
                </div>
              )}
            </div>
          )}

          {showModelLibrary && (
            <>
              {/* Category Filter & Search */}
              <div className="model-library-filters">
                <div className="category-filters">
                  {[
                    { id: 'all', label: 'All Models', icon: Package },
                    { id: 'fast', label: 'Fast', icon: Zap },
                    { id: 'standard', label: 'Standard', icon: MessageSquare },
                    { id: 'large', label: 'Large', icon: Brain },
                    { id: 'xlarge', label: 'XL', icon: Database },
                    { id: 'vision', label: 'Vision', icon: Eye },
                    { id: 'code', label: 'Code', icon: Code },
                    { id: 'embedding', label: 'Embed', icon: HardDrive },
                    { id: 'specialized', label: 'Special', icon: Sparkles }
                  ].map(cat => {
                    const Icon = cat.icon;
                    const count = cat.id === 'all'
                      ? AVAILABLE_MODELS.filter(m => (m.sizeBytes / (1024 * 1024 * 1024)) * 1.2 <= vram).length
                      : AVAILABLE_MODELS.filter(m => m.category === cat.id && (m.sizeBytes / (1024 * 1024 * 1024)) * 1.2 <= vram).length;
                    return (
                      <button
                        key={cat.id}
                        className={`category-filter-btn ${modelCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setModelCategory(cat.id)}
                        disabled={count === 0}
                      >
                        <Icon size={14} />
                        {cat.label}
                        <span className="filter-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="model-search">
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="model-search-input"
                  />
                  {modelSearch && (
                    <button
                      className="clear-search"
                      onClick={() => setModelSearch('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="model-library-grid">
                {AVAILABLE_MODELS
                  .filter(model => {
                    // Filter by VRAM - show models that fit
                    const modelVramNeeded = (model.sizeBytes / (1024 * 1024 * 1024)) * 1.2;
                    if (modelVramNeeded > vram) return false;
                    // Filter by category
                    if (modelCategory !== 'all' && model.category !== modelCategory) return false;
                    // Filter by search
                    if (modelSearch) {
                      const search = modelSearch.toLowerCase();
                      return (
                        model.displayName.toLowerCase().includes(search) ||
                        model.name.toLowerCase().includes(search) ||
                        model.description.toLowerCase().includes(search) ||
                        model.capabilities.some(c => c.toLowerCase().includes(search))
                      );
                    }
                    return true;
                  })
                  .map(model => {
                    const installed = isModelInstalled(model.name);
                    const isDownloading = downloadingModel === model.name;
                    const isDeleting = deletingModel === model.name;

                    return (
                      <div
                        key={model.name}
                        className={`library-model-card ${installed ? 'installed' : ''} ${isDownloading ? 'downloading' : ''}`}
                      >
                        <div className="library-model-header">
                          <span className="library-model-name">{model.displayName}</span>
                          <span className="library-model-size">{model.size}</span>
                        </div>

                        <p className="library-model-description">{model.description}</p>

                        <div className="library-model-capabilities">
                          {model.capabilities.slice(0, 3).map(cap => {
                            const Icon = getCapabilityIcon(cap);
                            return (
                              <span key={cap} className={`capability-tag ${cap}`}>
                                <Icon size={12} />
                                {cap}
                              </span>
                            );
                          })}
                        </div>

                        <div className="library-model-actions">
                          {installed ? (
                            <>
                              <span className="installed-badge">
                                <Check size={14} />
                                Installed
                              </span>
                              <button
                                className="btn-delete-model"
                                onClick={() => handleDeleteModel(model.name)}
                                disabled={isDeleting}
                                title="Delete model"
                              >
                                {isDeleting ? (
                                  <RefreshCw size={14} className="spinning" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn-download-model"
                              onClick={() => handleDownloadModel(model.name)}
                              disabled={isDownloading || downloadingModel !== null}
                            >
                              {isDownloading ? (
                                <>
                                  <RefreshCw size={14} className="spinning" />
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <Download size={14} />
                                  Download
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {AVAILABLE_MODELS.filter(m => {
                const modelVramNeeded = (m.sizeBytes / (1024 * 1024 * 1024)) * 1.2;
                if (modelVramNeeded > vram) return false;
                if (modelCategory !== 'all' && m.category !== modelCategory) return false;
                if (modelSearch) {
                  const search = modelSearch.toLowerCase();
                  return (
                    m.displayName.toLowerCase().includes(search) ||
                    m.name.toLowerCase().includes(search) ||
                    m.description.toLowerCase().includes(search)
                  );
                }
                return true;
              }).length === 0 && (
                <div className="no-compatible-models">
                  <AlertCircle size={20} />
                  {modelSearch ? (
                    <p>No models found matching "{modelSearch}". Try a different search term.</p>
                  ) : (
                    <>
                      <p>No compatible models found for your {getVramLabel()} VRAM configuration.</p>
                      <p>Try increasing your VRAM setting to see more models.</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        {/* GPU & VRAM Configuration */}
        <section className="settings-section vram-section">
          <div className="section-header">
            <h3>
              <Monitor size={20} />
              GPU & VRAM Configuration
            </h3>
          </div>
          <p className="section-description">
            Configure your available VRAM to get optimized model recommendations. Models are sized to fit your GPU memory.
          </p>

          <div className="vram-config">
            {/* GPU Detection Display */}
            {gpuInfo && (
              <div className="gpu-info-card">
                <div className="gpu-info-header">
                  <Cpu size={18} />
                  <span>Detected GPU</span>
                  {autoDetected && (
                    <span className="auto-detected-badge">
                      <Check size={12} />
                      Auto-detected
                    </span>
                  )}
                </div>
                <div className="gpu-info-content">
                  <p className="gpu-renderer">{gpuInfo.renderer}</p>
                  {gpuInfo.detected && (
                    <p className="gpu-vram-detected">
                      Estimated VRAM: <strong>{gpuInfo.vram} GB</strong>
                    </p>
                  )}
                  {!gpuInfo.detected && (
                    <p className="gpu-vram-unknown">
                      <Info size={14} />
                      VRAM could not be auto-detected. Please select manually below.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* VRAM Selector */}
            <div className="form-group vram-selector">
              <label htmlFor="vram-select">
                Available VRAM
                {autoDetected && <span className="label-hint">(Override auto-detected value)</span>}
              </label>
              <select
                id="vram-select"
                value={vram}
                onChange={(e) => {
                  setVram(Number(e.target.value));
                  setAutoDetected(false);
                  setRecommendations(null); // Clear recommendations when VRAM changes
                }}
                className="vram-dropdown"
              >
                {VRAM_PRESETS.map(preset => (
                  <option key={preset.value} value={preset.value}>
                    {preset.label} - {preset.description}
                  </option>
                ))}
              </select>
              <small className="form-hint">
                Select your GPU's VRAM to ensure recommended models fit in memory. Leave headroom for the OS and other apps.
              </small>
            </div>

            {/* VRAM Usage Estimate */}
            {vramUsage && vramUsage.total > 0 && (
              <div className="vram-usage-card">
                <div className="vram-usage-header">
                  <HardDrive size={18} />
                  <span>Estimated VRAM Usage</span>
                </div>
                <div className="vram-usage-bars">
                  <div className="vram-bar-container">
                    <div className="vram-bar-label">
                      <span>Max Single Model</span>
                      <span>{vramUsage.total.toFixed(1)} GB / {vram} GB</span>
                    </div>
                    <div className="vram-bar">
                      <div
                        className={`vram-bar-fill ${vramUsage.total > vram * 0.9 ? 'warning' : vramUsage.total > vram * 0.75 ? 'caution' : 'ok'}`}
                        style={{ width: `${Math.min((vramUsage.total / vram) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  {vramUsage.maxConcurrent > vramUsage.total && (
                    <div className="vram-bar-container">
                      <div className="vram-bar-label">
                        <span>Text + Vision (concurrent)</span>
                        <span>{vramUsage.maxConcurrent.toFixed(1)} GB / {vram} GB</span>
                      </div>
                      <div className="vram-bar">
                        <div
                          className={`vram-bar-fill ${vramUsage.maxConcurrent > vram ? 'error' : vramUsage.maxConcurrent > vram * 0.9 ? 'warning' : 'ok'}`}
                          style={{ width: `${Math.min((vramUsage.maxConcurrent / vram) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {vramUsage.total > vram * 0.9 && (
                  <p className="vram-warning">
                    <AlertCircle size={14} />
                    Selected models may be tight on VRAM. Consider smaller models for smoother performance.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Model Selection */}
        <section className="settings-section">
          <div className="section-header">
            <h3>Model Selection</h3>
            <button
              onClick={handleRecommendModels}
              disabled={!ollamaEnabled || installedModels.length === 0}
              className="btn-recommend"
            >
              <Sparkles size={16} />
              Recommend Models
            </button>
          </div>
          <p className="section-description">
            Assign models to different AI tasks. The recommendation system will suggest optimal models based on capabilities and size.
          </p>

          {recommendations && (
            <div className="recommendations-applied">
              <Check size={16} />
              <span>Recommendations applied based on your installed models</span>
            </div>
          )}

          <div className="settings-form model-selection-form">
            {['text', 'vision', 'fast'].map(task => {
              const TaskIcon = getTaskIcon(task);
              const taskConfig = MODEL_TASKS[task];
              const availableModels = getModelsForTask(task);
              const currentModel = installedModels.find(m => m.name === defaultModels[task]);
              const isRecommended = recommendations && recommendations[task]?.name === defaultModels[task];

              return (
                <div key={task} className="form-group model-selector">
                  <label htmlFor={`model-${task}`}>
                    <TaskIcon size={18} />
                    {taskConfig?.label || task}
                    {isRecommended && (
                      <span className="recommended-badge">
                        <Sparkles size={12} />
                        Recommended
                      </span>
                    )}
                  </label>

                  <div className="model-select-wrapper">
                    <select
                      id={`model-${task}`}
                      value={defaultModels[task]}
                      onChange={(e) => {
                        setDefaultModels({ ...defaultModels, [task]: e.target.value });
                        setRecommendations(null); // Clear recommendations when model manually changed
                      }}
                      disabled={!ollamaEnabled}
                      className={availableModels.length === 0 ? 'no-options' : ''}
                    >
                      {availableModels.length === 0 ? (
                        <option value="">No compatible models found</option>
                      ) : (
                        <>
                          <option value="">Select a model...</option>
                          {availableModels.map(model => (
                            <option key={model.name} value={model.name}>
                              {model.displayName} ({model.size})
                            </option>
                          ))}
                        </>
                      )}
                    </select>

                    {currentModel && (
                      <div className="selected-model-info">
                        <span className="model-params">{currentModel.parameterSize}</span>
                        <span className="model-quant">{currentModel.quantization}</span>
                      </div>
                    )}
                  </div>

                  <small className="form-hint">
                    {taskConfig?.description}
                  </small>

                  {availableModels.length === 0 && task === 'vision' && (
                    <small className="form-hint warning">
                      <AlertCircle size={14} />
                      No vision models found. Install one with: <code>ollama pull llava</code>
                    </small>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Cloud Fallback */}
        <section className="settings-section">
          <div className="section-header">
            <h3>Cloud Fallback</h3>
            <div className="section-toggle">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={cloudFallback.enabled}
                  onChange={(e) => setCloudFallback({ ...cloudFallback, enabled: e.target.checked })}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className={`toggle-label ${cloudFallback.enabled ? 'enabled' : 'disabled'}`}>
                {cloudFallback.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <p className="section-description">
            Use a cloud AI provider as backup when Ollama is unavailable or for models not available locally.
          </p>

          {cloudFallback.enabled && (
            <div className="settings-form">
              <div className="form-group">
                <label htmlFor="cloud-provider">Cloud Provider</label>
                <select
                  id="cloud-provider"
                  value={cloudFallback.provider}
                  onChange={(e) => setCloudFallback({ ...cloudFallback, provider: e.target.value })}
                >
                  <option value="">Select Provider</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="google">Google AI</option>
                </select>
                <small className="form-hint">
                  Choose your preferred cloud AI provider
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="cloud-api-key">API Key</label>
                <input
                  type="password"
                  id="cloud-api-key"
                  value={cloudFallback.api_key}
                  onChange={(e) => setCloudFallback({ ...cloudFallback, api_key: e.target.value })}
                  placeholder="Enter API key..."
                />
                <small className="form-hint warning">
                  API key is stored encrypted. Never share this key publicly.
                </small>
              </div>
            </div>
          )}
        </section>

        {/* Batch Jobs Schedule */}
        <section className="settings-section">
          <div className="section-header">
            <h3>Batch Job Schedule</h3>
          </div>
          <p className="section-description">
            Configure when automated AI tasks should run (24-hour format). These run during off-peak hours.
          </p>

          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="schedule-anomaly">Anomaly Detection</label>
              <input
                type="time"
                id="schedule-anomaly"
                value={batchSchedule.anomaly_detection}
                onChange={(e) => setBatchSchedule({ ...batchSchedule, anomaly_detection: e.target.value })}
                disabled={!ollamaEnabled}
              />
              <small className="form-hint">
                Scans booking patterns for unusual activity and potential issues
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="schedule-forecast">Demand Forecasting</label>
              <input
                type="time"
                id="schedule-forecast"
                value={batchSchedule.demand_forecast}
                onChange={(e) => setBatchSchedule({ ...batchSchedule, demand_forecast: e.target.value })}
                disabled={!ollamaEnabled}
              />
              <small className="form-hint">
                Predicts equipment demand trends and usage patterns
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="schedule-maintenance">Maintenance Scheduling</label>
              <input
                type="time"
                id="schedule-maintenance"
                value={batchSchedule.maintenance_schedule}
                onChange={(e) => setBatchSchedule({ ...batchSchedule, maintenance_schedule: e.target.value })}
                disabled={!ollamaEnabled}
              />
              <small className="form-hint">
                Analyzes equipment usage to suggest optimal maintenance windows
              </small>
            </div>
          </div>
        </section>
      </div>

      {/* Save Button */}
      <div className="settings-actions">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-save"
        >
          {saving ? 'Saving...' : 'Save AI Settings'}
        </button>
      </div>

      {/* Information Panel */}
      <div className="settings-info-panel">
        <h4>About AI Features</h4>
        <div className="info-grid">
          <div className="info-item">
            <h5>Smart Search</h5>
            <p>Natural language queries to find equipment (e.g., "cameras for outdoor shooting")</p>
          </div>
          <div className="info-item">
            <h5>Damage Detection</h5>
            <p>Automatic analysis of return photos to identify equipment damage</p>
          </div>
          <div className="info-item">
            <h5>Usage Insights</h5>
            <p>AI-generated analytics about equipment utilization and booking patterns</p>
          </div>
          <div className="info-item">
            <h5>Predictive Maintenance</h5>
            <p>Forecasts when equipment may need servicing based on usage patterns</p>
          </div>
          <div className="info-item">
            <h5>Smart Recommendations</h5>
            <p>Suggests relevant equipment to students based on their project needs</p>
          </div>
          <div className="info-item">
            <h5>Anomaly Detection</h5>
            <p>Identifies unusual booking patterns or potential equipment abuse</p>
          </div>
        </div>

        <div className="info-warning">
          <strong>Privacy Note:</strong> All AI processing happens locally on your server when using Ollama.
          No equipment data or student information is sent to external services unless you enable cloud fallback.
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
