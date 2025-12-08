import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

/**
 * QRScanner - Scans QR codes using camera or USB barcode scanner
 *
 * Supports:
 * - Webcam/phone camera scanning
 * - USB/Bluetooth barcode scanner input (keyboard emulation)
 * - Manual ID entry fallback
 *
 * @param {Object} props
 * @param {function} props.onScan - Callback when QR/barcode is scanned: (data, source) => void
 * @param {function} props.onError - Callback on scan error
 * @param {boolean} props.enableCamera - Enable camera scanning (default: true)
 * @param {boolean} props.enableManualEntry - Enable manual ID input (default: true)
 * @param {string} props.placeholder - Placeholder for manual input
 * @param {boolean} props.autoFocus - Auto-focus manual input for USB scanner (default: true)
 */
export default function QRScanner({
  onScan,
  onError,
  enableCamera = true,
  enableManualEntry = true,
  placeholder = 'Scan barcode or enter equipment ID...',
  autoFocus = true,
  className = ''
}) {
  const [mode, setMode] = useState('idle'); // 'idle' | 'camera' | 'manual'
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [lastScanned, setLastScanned] = useState(null);

  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const manualInputRef = useRef(null);
  const barcodeBufferRef = useRef('');
  const barcodeTimeoutRef = useRef(null);

  // Handle USB barcode scanner input (keyboard emulation)
  // USB scanners typically send characters rapidly followed by Enter
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only capture if we're in manual mode or idle, and manual entry is enabled
      if (!enableManualEntry) return;
      if (mode === 'camera') return;

      // Check if input is going to a form element
      const activeElement = document.activeElement;
      const isFormElement = activeElement?.tagName === 'INPUT' ||
                           activeElement?.tagName === 'TEXTAREA' ||
                           activeElement?.tagName === 'SELECT';

      // If focused on our input, let it handle normally
      if (activeElement === manualInputRef.current) return;

      // Ignore if focused on other form elements
      if (isFormElement) return;

      // Clear previous timeout
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }

      // Enter key - process the buffer
      if (e.key === 'Enter' && barcodeBufferRef.current.length > 0) {
        e.preventDefault();
        const scannedData = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = '';
        processScannedData(scannedData, 'usb_scanner');
        return;
      }

      // Printable characters - add to buffer
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBufferRef.current += e.key;

        // Clear buffer after 100ms of inactivity (USB scanners are fast)
        barcodeTimeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = '';
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [mode, enableManualEntry]);

  // Auto-focus manual input when mode changes
  useEffect(() => {
    if (mode === 'manual' && autoFocus && manualInputRef.current) {
      manualInputRef.current.focus();
    }
  }, [mode, autoFocus]);

  // Process scanned data
  const processScannedData = useCallback((data, source) => {
    try {
      setError(null);

      // Try to parse as JSON (our QR format)
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        // Not JSON - treat as plain equipment ID
        parsedData = { id: data, type: 'equipment', v: 1 };
      }

      // Validate the parsed data
      if (!parsedData.id) {
        throw new Error('Invalid QR code: missing equipment ID');
      }

      setLastScanned({
        data: parsedData,
        source,
        timestamp: new Date()
      });

      onScan?.(parsedData, source);
    } catch (err) {
      const errorMsg = err.message || 'Failed to process scanned data';
      setError(errorMsg);
      onError?.(errorMsg, data);
    }
  }, [onScan, onError]);

  // Start camera scanning
  const startCameraScanning = useCallback(async () => {
    if (!enableCamera) return;

    setMode('camera');
    setIsScanning(true);
    setError(null);

    try {
      // Initialize Html5Qrcode
      html5QrCodeRef.current = new Html5Qrcode('qr-scanner-region');

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' }, // Prefer back camera
        config,
        (decodedText) => {
          // Successful scan
          processScannedData(decodedText, 'camera');
          // Optionally stop after successful scan
          // stopCameraScanning();
        },
        (errorMessage) => {
          // Ignore continuous scan errors (normal while searching)
          // Only log actual errors
          if (!errorMessage.includes('No QR code found')) {
            console.debug('QR scan:', errorMessage);
          }
        }
      );
    } catch (err) {
      setError(err.message || 'Failed to start camera');
      setIsScanning(false);
      setMode('idle');
      onError?.(err.message);
    }
  }, [enableCamera, processScannedData, onError]);

  // Stop camera scanning
  const stopCameraScanning = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
    setMode('idle');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Handle manual input submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processScannedData(manualInput.trim(), 'manual');
      setManualInput('');
    }
  };

  // Handle manual input change
  const handleManualInputChange = (e) => {
    setManualInput(e.target.value);
    setError(null);
  };

  // Handle manual input keydown (for USB scanner Enter key)
  const handleManualInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSubmit(e);
    }
  };

  return (
    <div className={`qr-scanner ${className}`} ref={scannerRef}>
      {/* Mode Selection */}
      <div className="qr-scanner__modes">
        {enableCamera && (
          <button
            type="button"
            className={`qr-scanner__mode-btn ${mode === 'camera' ? 'qr-scanner__mode-btn--active' : ''}`}
            onClick={mode === 'camera' ? stopCameraScanning : startCameraScanning}
            aria-pressed={mode === 'camera'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {mode === 'camera' ? 'Stop Camera' : 'Use Camera'}
          </button>
        )}

        {enableManualEntry && (
          <button
            type="button"
            className={`qr-scanner__mode-btn ${mode === 'manual' ? 'qr-scanner__mode-btn--active' : ''}`}
            onClick={() => setMode(mode === 'manual' ? 'idle' : 'manual')}
            aria-pressed={mode === 'manual'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Manual Entry / USB Scanner
          </button>
        )}
      </div>

      {/* Camera Scanner Region */}
      {mode === 'camera' && (
        <div className="qr-scanner__camera">
          <div id="qr-scanner-region" className="qr-scanner__viewport" />
          <p className="qr-scanner__hint">Position the QR code within the frame</p>
        </div>
      )}

      {/* Manual Entry Form */}
      {(mode === 'manual' || mode === 'idle') && enableManualEntry && (
        <form className="qr-scanner__manual" onSubmit={handleManualSubmit}>
          <div className="qr-scanner__input-wrapper">
            <input
              ref={manualInputRef}
              type="text"
              className="qr-scanner__input"
              value={manualInput}
              onChange={handleManualInputChange}
              onKeyDown={handleManualInputKeyDown}
              placeholder={placeholder}
              aria-label="Equipment ID or scanned barcode"
              autoComplete="off"
            />
            <button
              type="submit"
              className="qr-scanner__submit"
              disabled={!manualInput.trim()}
              aria-label="Submit equipment ID"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </div>
          <p className="qr-scanner__hint">
            USB scanner ready - scan barcode or type ID manually
          </p>
        </form>
      )}

      {/* Error Display */}
      {error && (
        <div className="qr-scanner__error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Last Scanned Display */}
      {lastScanned && (
        <div className="qr-scanner__last-scanned">
          <span className="qr-scanner__last-scanned-label">Last scanned:</span>
          <span className="qr-scanner__last-scanned-id">{lastScanned.data.id}</span>
          <span className="qr-scanner__last-scanned-source">({lastScanned.source})</span>
        </div>
      )}
    </div>
  );
}
