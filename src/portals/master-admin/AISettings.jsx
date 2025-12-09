import { useState, useEffect } from 'react';
import { getAllAISettings, updateAISetting, testOllamaConnection } from '../../services/aiSettings.service';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import './AISettings.css';

export default function AISettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
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

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await getAllAISettings();

      // Parse settings from API response
      settings.forEach(setting => {
        const value = typeof setting.setting_value === 'string'
          ? JSON.parse(setting.setting_value)
          : setting.setting_value;

        switch (setting.setting_key) {
          case 'ollama_enabled':
            setOllamaEnabled(value.enabled);
            setOllamaEndpoint(value.endpoint);
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
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      showToast('Failed to load AI settings', 'error');
    } finally {
      setLoading(false);
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

        {/* Model Selection */}
        <section className="settings-section">
          <div className="section-header">
            <h3>Model Selection</h3>
          </div>
          <p className="section-description">
            Choose which models to use for different AI tasks. Make sure these models are pulled in Ollama.
          </p>

          <div className="settings-form">
            <div className="form-group">
              <label htmlFor="model-text">Text Model</label>
              <input
                type="text"
                id="model-text"
                value={defaultModels.text}
                onChange={(e) => setDefaultModels({ ...defaultModels, text: e.target.value })}
                placeholder="mistral-small"
                disabled={!ollamaEnabled}
              />
              <small className="form-hint">
                Used for natural language queries, analytics insights, and text generation
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="model-vision">Vision Model</label>
              <input
                type="text"
                id="model-vision"
                value={defaultModels.vision}
                onChange={(e) => setDefaultModels({ ...defaultModels, vision: e.target.value })}
                placeholder="llava:13b"
                disabled={!ollamaEnabled}
              />
              <small className="form-hint">
                Used for damage detection, photo verification, and visual analysis
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="model-fast">Fast Model</label>
              <input
                type="text"
                id="model-fast"
                value={defaultModels.fast}
                onChange={(e) => setDefaultModels({ ...defaultModels, fast: e.target.value })}
                placeholder="llama3.1:8b"
                disabled={!ollamaEnabled}
              />
              <small className="form-hint">
                Used for quick queries, smart search suggestions, and real-time features
              </small>
            </div>
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
