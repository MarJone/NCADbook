// Export Service - Handles CSV and PDF export functionality

class ExportService {
  /**
   * Export data to CSV format
   * @param {Array} data - Array of objects to export
   * @param {string} filename - Name of the file (without extension)
   * @param {Array} columns - Optional array of column configurations { key, label }
   */
  exportToCSV(data, filename, columns = null) {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // If columns not provided, use all keys from first object
    const cols = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

    // Create CSV header
    const header = cols.map(col => this.escapeCSVValue(col.label)).join(',');

    // Create CSV rows
    const rows = data.map(row => {
      return cols.map(col => {
        const value = this.getNestedValue(row, col.key);
        return this.escapeCSVValue(value);
      }).join(',');
    });

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Create and download file
    this.downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * Export bookings data to CSV
   * @param {Array} bookings - Array of booking objects
   * @param {string} filename - Name of the file
   */
  exportBookingsToCSV(bookings, filename = 'bookings') {
    const columns = [
      { key: 'equipment.product_name', label: 'Equipment' },
      { key: 'equipment.category', label: 'Category' },
      { key: 'start_date', label: 'Start Date' },
      { key: 'end_date', label: 'End Date' },
      { key: 'status', label: 'Status' },
      { key: 'purpose', label: 'Purpose' },
      { key: 'created_at', label: 'Requested Date' }
    ];

    const formattedData = bookings.map(booking => ({
      ...booking,
      start_date: this.formatDate(booking.start_date),
      end_date: this.formatDate(booking.end_date),
      created_at: this.formatDate(booking.created_at)
    }));

    this.exportToCSV(formattedData, filename, columns);
  }

  /**
   * Export equipment data to CSV
   * @param {Array} equipment - Array of equipment objects
   * @param {string} filename - Name of the file
   */
  exportEquipmentToCSV(equipment, filename = 'equipment') {
    const columns = [
      { key: 'product_name', label: 'Product Name' },
      { key: 'category', label: 'Category' },
      { key: 'department', label: 'Department' },
      { key: 'status', label: 'Status' },
      { key: 'tracking_number', label: 'Tracking Number' },
      { key: 'description', label: 'Description' }
    ];

    this.exportToCSV(equipment, filename, columns);
  }

  /**
   * Export to PDF (simple text-based PDF)
   * Note: For production, consider using jsPDF or pdfmake library
   * @param {string} content - HTML or text content to export
   * @param {string} filename - Name of the file
   */
  exportToPDF(content, filename) {
    // Create a printable page
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
              font-weight: bold;
            }
            h1 {
              color: #333;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .no-print {
              margin: 20px 0;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button onclick="window.print()">Print / Save as PDF</button>
            <button onclick="window.close()">Close</button>
          </div>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  /**
   * Export bookings to PDF
   * @param {Array} bookings - Array of booking objects
   * @param {string} title - Title of the PDF
   */
  exportBookingsToPDF(bookings, title = 'My Bookings Report') {
    const tableRows = bookings.map(booking => `
      <tr>
        <td>${booking.equipment?.product_name || 'Unknown'}</td>
        <td>${booking.equipment?.category || 'N/A'}</td>
        <td>${this.formatDate(booking.start_date)}</td>
        <td>${this.formatDate(booking.end_date)}</td>
        <td><strong>${booking.status}</strong></td>
      </tr>
    `).join('');

    const content = `
      <h1>${title}</h1>
      <p><strong>Generated:</strong> ${this.formatDate(new Date())}</p>
      <p><strong>Total Bookings:</strong> ${bookings.length}</p>
      <table>
        <thead>
          <tr>
            <th>Equipment</th>
            <th>Category</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    `;

    this.exportToPDF(content, title.replace(/\s+/g, '_'));
  }

  /**
   * Helper: Escape CSV values
   * @param {any} value - Value to escape
   * @returns {string} - Escaped value
   */
  escapeCSVValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Helper: Get nested object value by string path
   * @param {object} obj - Object to search
   * @param {string} path - Dot-separated path (e.g., 'equipment.product_name')
   * @returns {any} - Value at path or empty string
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }

  /**
   * Helper: Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} - Formatted date
   */
  formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Helper: Download file
   * @param {string} content - File content
   * @param {string} filename - File name
   * @param {string} mimeType - MIME type
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
