// Export Service - Handles CSV, PDF, and Excel export functionality
import * as XLSX from 'xlsx';

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

  /**
   * Export analytics data to Excel (XLSX) format
   * @param {Object} analyticsData - Analytics data object containing metrics
   * @param {Object} filters - Filter information for the report
   * @param {string} filename - Name of the file (without extension)
   */
  exportAnalyticsToExcel(analyticsData, filters = {}, filename = 'analytics') {
    try {
      const {
        totalBookings = 0,
        approvalRate = 0,
        popularEquipment = [],
        bookingsByDepartment = {},
        bookingsByStatus = {},
        filteredBookings = []
      } = analyticsData;

      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // ===== SHEET 1: Summary Statistics =====
      const summaryData = [
        ['NCAD Equipment Booking System - Analytics Report'],
        ['Generated:', new Date().toLocaleString('en-IE')],
        [],
        ['Applied Filters:'],
        ['Department:', filters.department || 'All Departments'],
        ['User:', filters.user || 'All Users'],
        ['Date Range:', filters.startDate && filters.endDate
          ? `${new Date(filters.startDate).toLocaleDateString('en-IE')} - ${new Date(filters.endDate).toLocaleDateString('en-IE')}`
          : 'All Dates'],
        [],
        ['Summary Statistics'],
        ['Metric', 'Value'],
        ['Total Bookings', totalBookings],
        ['Approval Rate', `${approvalRate}%`],
        ['Pending Bookings', bookingsByStatus['pending'] || 0],
        ['Approved Bookings', bookingsByStatus['approved'] || 0],
        ['Rejected Bookings', bookingsByStatus['rejected'] || 0],
        ['Completed Bookings', bookingsByStatus['completed'] || 0]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

      // Set column widths for summary sheet
      summarySheet['!cols'] = [
        { wch: 25 },
        { wch: 30 }
      ];

      // Style the header row (make it bold by merging cells)
      summarySheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } } // Merge title cells
      ];

      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // ===== SHEET 2: Popular Equipment =====
      const popularEquipmentData = [
        ['Top Equipment by Bookings'],
        [],
        ['Rank', 'Equipment Name', 'Number of Bookings', 'Usage Percentage'],
        ...popularEquipment.map((item, index) => [
          index + 1,
          item.name,
          item.count,
          `${Math.round((item.count / totalBookings) * 100)}%`
        ])
      ];

      const popularSheet = XLSX.utils.aoa_to_sheet(popularEquipmentData);
      popularSheet['!cols'] = [
        { wch: 8 },
        { wch: 40 },
        { wch: 20 },
        { wch: 18 }
      ];

      XLSX.utils.book_append_sheet(workbook, popularSheet, 'Popular Equipment');

      // ===== SHEET 3: Bookings by Department =====
      const departmentData = [
        ['Bookings by Department'],
        [],
        ['Department', 'Number of Bookings', 'Percentage'],
        ...Object.entries(bookingsByDepartment).map(([dept, count]) => [
          dept,
          count,
          `${Math.round((count / totalBookings) * 100)}%`
        ])
      ];

      const deptSheet = XLSX.utils.aoa_to_sheet(departmentData);
      deptSheet['!cols'] = [
        { wch: 30 },
        { wch: 20 },
        { wch: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, deptSheet, 'By Department');

      // ===== SHEET 4: Bookings by Status =====
      const statusData = [
        ['Bookings by Status'],
        [],
        ['Status', 'Count', 'Percentage'],
        ...Object.entries(bookingsByStatus).map(([status, count]) => [
          status.charAt(0).toUpperCase() + status.slice(1),
          count,
          `${Math.round((count / totalBookings) * 100)}%`
        ])
      ];

      const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
      statusSheet['!cols'] = [
        { wch: 20 },
        { wch: 15 },
        { wch: 15 }
      ];

      XLSX.utils.book_append_sheet(workbook, statusSheet, 'By Status');

      // ===== SHEET 5: Detailed Bookings Data =====
      if (filteredBookings && filteredBookings.length > 0) {
        const detailedData = [
          ['All Bookings (Detailed)'],
          [],
          ['Booking ID', 'User', 'Department', 'Equipment', 'Start Date', 'End Date', 'Status', 'Created Date']
        ];

        const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
        detailedSheet['!cols'] = [
          { wch: 12 },
          { wch: 25 },
          { wch: 20 },
          { wch: 35 },
          { wch: 15 },
          { wch: 15 },
          { wch: 12 },
          { wch: 18 }
        ];

        XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Detailed Data');
      }

      // Generate filename with date range
      const timestamp = new Date().toISOString().split('T')[0];
      let finalFilename = `${filename}_${timestamp}`;

      if (filters.startDate && filters.endDate) {
        const startStr = new Date(filters.startDate).toISOString().split('T')[0];
        const endStr = new Date(filters.endDate).toISOString().split('T')[0];
        finalFilename = `${filename}_${startStr}_to_${endStr}`;
      }

      // Write file
      XLSX.writeFile(workbook, `${finalFilename}.xlsx`);

      return true;
    } catch (error) {
      console.error('Failed to export to Excel:', error);
      throw error;
    }
  }

  /**
   * Export bookings data to Excel format
   * @param {Array} bookings - Array of booking objects with equipment and user data
   * @param {Array} users - Array of user objects
   * @param {Array} equipment - Array of equipment objects
   * @param {string} filename - Name of the file (without extension)
   */
  exportBookingsToExcel(bookings, users, equipment, filename = 'bookings') {
    try {
      const workbook = XLSX.utils.book_new();

      // Prepare data for export
      const bookingsData = [
        ['Booking ID', 'User', 'Department', 'Equipment', 'Start Date', 'End Date', 'Status', 'Purpose', 'Created Date']
      ];

      bookings.forEach(booking => {
        const user = users.find(u => u.id === booking.user_id);
        const equipItem = equipment.find(e => e.id === booking.equipment_id);

        bookingsData.push([
          booking.id,
          user?.full_name || 'Unknown',
          user?.department || 'Unknown',
          equipItem?.product_name || 'Unknown',
          this.formatDate(booking.start_date),
          this.formatDate(booking.end_date),
          booking.status,
          booking.purpose || '',
          this.formatDate(booking.created_at)
        ]);
      });

      const worksheet = XLSX.utils.aoa_to_sheet(bookingsData);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 12 },
        { wch: 25 },
        { wch: 20 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 30 },
        { wch: 18 }
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `${filename}_${timestamp}.xlsx`);

      return true;
    } catch (error) {
      console.error('Failed to export bookings to Excel:', error);
      throw error;
    }
  }
}

export const exportService = new ExportService();
