import { useRef, forwardRef, useImperativeHandle } from 'react';
import QRGenerator from './QRGenerator';

/**
 * EquipmentLabel - Printable equipment label with QR code
 *
 * Label specifications (based on printing best practices):
 * - Size: 8.5 × 5.5 cm (business card format)
 * - QR Code: 3 × 3 cm with error correction level H (30% damage tolerance)
 * - Lamination: Matte finish recommended
 * - Minimum 4 module quiet zone around QR
 *
 * @param {Object} props
 * @param {Object} props.equipment - Equipment data object
 * @param {string} props.equipment.id - Equipment ID
 * @param {string} props.equipment.product_name - Product name
 * @param {string} props.equipment.tracking_number - Tracking number
 * @param {string} props.equipment.category - Equipment category
 * @param {string} props.equipment.department - Department name
 * @param {string} props.logoUrl - URL to department/institution logo
 * @param {string} props.variant - Label variant: 'standard' | 'compact' | 'large'
 * @param {boolean} props.showBorder - Show cut guides border
 */
const EquipmentLabel = forwardRef(function EquipmentLabel({
  equipment,
  logoUrl = '/images/ncad-logo.svg',
  variant = 'standard',
  showBorder = true,
  className = ''
}, ref) {
  const labelRef = useRef(null);

  // Expose print function to parent
  useImperativeHandle(ref, () => ({
    print: () => {
      const content = labelRef.current;
      if (!content) return;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Equipment Label - ${equipment.product_name}</title>
          <style>
            @page {
              size: 85mm 55mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            ${getLabelStyles()}
          </style>
        </head>
        <body>
          ${content.outerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    },
    getElement: () => labelRef.current
  }));

  // Get size configuration based on variant
  const getQRSize = () => {
    switch (variant) {
      case 'compact': return 80;
      case 'large': return 150;
      default: return 113; // ~3cm at 96 DPI
    }
  };

  // Format tracking number for display (show partial for security)
  const formatTrackingNumber = (trackingNumber) => {
    if (!trackingNumber) return 'N/A';
    // Show format like "EQ-****-0142" for partial privacy
    if (trackingNumber.length > 8) {
      return `${trackingNumber.slice(0, 3)}****${trackingNumber.slice(-4)}`;
    }
    return trackingNumber;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'camera': '📷',
      'video': '🎬',
      'audio': '🎤',
      'lighting': '💡',
      'grip': '🔧',
      'computer': '💻',
      'accessory': '🎒',
      'default': '📦'
    };
    return icons[category?.toLowerCase()] || icons.default;
  };

  if (!equipment) {
    return (
      <div className={`equipment-label equipment-label--empty ${className}`}>
        <p>No equipment data provided</p>
      </div>
    );
  }

  return (
    <div
      ref={labelRef}
      className={`equipment-label equipment-label--${variant} ${showBorder ? 'equipment-label--bordered' : ''} ${className}`}
      data-equipment-id={equipment.id}
    >
      {/* Header */}
      <div className="equipment-label__header">
        {logoUrl && (
          <img
            src={logoUrl}
            alt="NCAD"
            className="equipment-label__logo"
          />
        )}
        <span className="equipment-label__title">EQUIPMENT LABEL</span>
      </div>

      {/* Main Content */}
      <div className="equipment-label__content">
        {/* QR Code */}
        <div className="equipment-label__qr">
          <QRGenerator
            equipmentId={equipment.id?.toString() || equipment.tracking_number}
            type="equipment"
            size={getQRSize()}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Equipment Info */}
        <div className="equipment-label__info">
          <h2 className="equipment-label__name">
            {equipment.product_name || 'Unknown Equipment'}
          </h2>

          <div className="equipment-label__category">
            <span className="equipment-label__category-icon">
              {getCategoryIcon(equipment.category)}
            </span>
            <span className="equipment-label__category-text">
              {equipment.category?.toUpperCase() || 'EQUIPMENT'}
            </span>
          </div>

          <div className="equipment-label__details">
            <div className="equipment-label__detail">
              <span className="equipment-label__detail-label">ID:</span>
              <span className="equipment-label__detail-value">
                {formatTrackingNumber(equipment.tracking_number) || `EQ-${equipment.id}`}
              </span>
            </div>
            <div className="equipment-label__detail">
              <span className="equipment-label__detail-label">Dept:</span>
              <span className="equipment-label__detail-value">
                {equipment.department || 'General'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="equipment-label__footer">
        <span>Scan to verify</span>
        <span className="equipment-label__separator">•</span>
        <span>Report issues to equipment@ncad.ie</span>
      </div>
    </div>
  );
});

// CSS styles for the label (inline for print compatibility)
function getLabelStyles() {
  return `
    .equipment-label {
      width: 85mm;
      height: 55mm;
      padding: 3mm;
      box-sizing: border-box;
      background: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .equipment-label--bordered {
      border: 1px dashed #ccc;
    }

    .equipment-label__header {
      display: flex;
      align-items: center;
      gap: 2mm;
      padding-bottom: 2mm;
      border-bottom: 0.5mm solid #333;
      margin-bottom: 2mm;
    }

    .equipment-label__logo {
      height: 6mm;
      width: auto;
    }

    .equipment-label__title {
      font-size: 8pt;
      font-weight: 600;
      color: #333;
      letter-spacing: 0.5px;
    }

    .equipment-label__content {
      display: flex;
      gap: 3mm;
      flex: 1;
      align-items: center;
    }

    .equipment-label__qr {
      flex-shrink: 0;
    }

    .equipment-label__qr svg {
      display: block;
    }

    .equipment-label__info {
      flex: 1;
      min-width: 0;
    }

    .equipment-label__name {
      font-size: 11pt;
      font-weight: 700;
      color: #000;
      margin: 0 0 1mm 0;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .equipment-label__category {
      display: flex;
      align-items: center;
      gap: 1mm;
      margin-bottom: 2mm;
    }

    .equipment-label__category-icon {
      font-size: 10pt;
    }

    .equipment-label__category-text {
      font-size: 7pt;
      font-weight: 600;
      color: #666;
      letter-spacing: 0.5px;
    }

    .equipment-label__details {
      display: flex;
      flex-direction: column;
      gap: 1mm;
    }

    .equipment-label__detail {
      display: flex;
      gap: 1mm;
      font-size: 8pt;
    }

    .equipment-label__detail-label {
      font-weight: 600;
      color: #666;
    }

    .equipment-label__detail-value {
      color: #333;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    }

    .equipment-label__footer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1mm;
      padding-top: 2mm;
      border-top: 0.25mm solid #ddd;
      font-size: 6pt;
      color: #999;
    }

    .equipment-label__separator {
      color: #ccc;
    }

    /* Compact variant */
    .equipment-label--compact {
      width: 60mm;
      height: 40mm;
      padding: 2mm;
    }

    .equipment-label--compact .equipment-label__name {
      font-size: 9pt;
    }

    .equipment-label--compact .equipment-label__footer {
      font-size: 5pt;
    }

    /* Large variant */
    .equipment-label--large {
      width: 100mm;
      height: 70mm;
      padding: 4mm;
    }

    .equipment-label--large .equipment-label__name {
      font-size: 14pt;
    }

    @media print {
      .equipment-label {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  `;
}

export default EquipmentLabel;

// Export a batch printing utility
export function printLabels(equipmentList, logoUrl) {
  if (!equipmentList || equipmentList.length === 0) return;

  const printWindow = window.open('', '_blank');
  const labelsHtml = equipmentList.map(equipment => `
    <div class="equipment-label equipment-label--standard equipment-label--bordered" style="page-break-after: always;">
      <div class="equipment-label__header">
        ${logoUrl ? `<img src="${logoUrl}" alt="NCAD" class="equipment-label__logo">` : ''}
        <span class="equipment-label__title">EQUIPMENT LABEL</span>
      </div>
      <div class="equipment-label__content">
        <div class="equipment-label__qr">
          <!-- QR code would be rendered here -->
          <div style="width: 113px; height: 113px; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">
            QR: ${equipment.id}
          </div>
        </div>
        <div class="equipment-label__info">
          <h2 class="equipment-label__name">${equipment.product_name || 'Unknown'}</h2>
          <div class="equipment-label__category">
            <span class="equipment-label__category-text">${(equipment.category || 'EQUIPMENT').toUpperCase()}</span>
          </div>
          <div class="equipment-label__details">
            <div class="equipment-label__detail">
              <span class="equipment-label__detail-label">ID:</span>
              <span class="equipment-label__detail-value">${equipment.tracking_number || `EQ-${equipment.id}`}</span>
            </div>
            <div class="equipment-label__detail">
              <span class="equipment-label__detail-label">Dept:</span>
              <span class="equipment-label__detail-value">${equipment.department || 'General'}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="equipment-label__footer">
        <span>Scan to verify</span>
        <span class="equipment-label__separator">•</span>
        <span>Report issues to equipment@ncad.ie</span>
      </div>
    </div>
  `).join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Equipment Labels Batch Print</title>
      <style>
        @page {
          size: 85mm 55mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        ${getLabelStyles()}
      </style>
    </head>
    <body>
      ${labelsHtml}
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
