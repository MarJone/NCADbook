import { useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * QRGenerator - Generates QR codes for equipment with configurable options
 *
 * @param {Object} props
 * @param {string} props.equipmentId - Equipment ID to encode
 * @param {string} props.type - Type of item ('equipment' or 'kit')
 * @param {number} props.size - QR code size in pixels (default: 128)
 * @param {string} props.level - Error correction level: L, M, Q, H (default: H for durability)
 * @param {boolean} props.includeMargin - Include quiet zone margin (default: true)
 * @param {string} props.fgColor - Foreground color (default: black)
 * @param {string} props.bgColor - Background color (default: white)
 * @param {function} props.onDownload - Callback when QR is downloaded
 */
export default function QRGenerator({
  equipmentId,
  type = 'equipment',
  size = 128,
  level = 'H',
  includeMargin = true,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  onDownload,
  className = '',
  showDownloadButton = false
}) {
  const qrRef = useRef(null);

  // Create minimal data payload for QR code
  const qrData = JSON.stringify({
    id: equipmentId,
    type: type,
    v: 1  // Version for future compatibility
  });

  // Download QR code as SVG
  const downloadSVG = useCallback(() => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${type}-${equipmentId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onDownload?.('svg', equipmentId);
  }, [equipmentId, type, onDownload]);

  // Download QR code as PNG (higher resolution for printing)
  const downloadPNG = useCallback((scale = 4) => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scaledSize = size * scale;

    canvas.width = scaledSize;
    canvas.height = scaledSize;

    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, scaledSize, scaledSize);

      // Draw QR code
      ctx.drawImage(img, 0, 0, scaledSize, scaledSize);

      // Create download link
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `qr-${type}-${equipmentId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      onDownload?.('png', equipmentId);
    };

    img.src = url;
  }, [equipmentId, type, size, bgColor, onDownload]);

  // Get SVG data URL for embedding in other components
  const getSVGDataUrl = useCallback(() => {
    if (!qrRef.current) return null;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return null;

    const svgData = new XMLSerializer().serializeToString(svg);
    return `data:image/svg+xml;base64,${btoa(svgData)}`;
  }, []);

  return (
    <div className={`qr-generator ${className}`} ref={qrRef}>
      <QRCodeSVG
        value={qrData}
        size={size}
        level={level}
        includeMargin={includeMargin}
        fgColor={fgColor}
        bgColor={bgColor}
      />

      {showDownloadButton && (
        <div className="qr-generator__actions">
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={downloadSVG}
            aria-label="Download QR code as SVG"
          >
            SVG
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => downloadPNG(4)}
            aria-label="Download QR code as PNG (high resolution)"
          >
            PNG
          </button>
        </div>
      )}
    </div>
  );
}

// Export utility functions for use in other components
export { QRCodeSVG };
