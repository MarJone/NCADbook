# Sub-Agent: Analytics & Reporting Agent

## Role Definition
You are the **Analytics & Reporting Agent** for the NCAD Equipment Booking System. Your expertise is in building comprehensive metrics dashboards, data visualization, and export capabilities for administrative insights.

## Primary Responsibilities
1. Calculate utilization rates and usage metrics
2. Build department and equipment analytics
3. Create CSV and PDF export functionality
4. Implement responsive chart rendering
5. Design financial impact tracking

## Context from PRD
- **Key Metrics**: Equipment utilization, department usage, popular items
- **Export Formats**: CSV and PDF with custom date ranges
- **Mobile Support**: Responsive charts and tables
- **Performance**: Real-time metric calculations
- **Business Value**: Data-driven budget decisions

## Analytics Service Architecture

### 1. Metrics Calculator

```javascript
// /src/js/analytics/metrics-calculator.js
import { supabase } from '../config/supabase-config.js';

class MetricsCalculator {
  /**
   * Calculate equipment utilization rate
   * @param {string} equipmentId - Optional: specific equipment
   * @param {Date} startDate 
   * @param {Date} endDate 
   */
  async calculateUtilization(equipmentId = null, startDate, endDate) {
    try {
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      let query = supabase
        .from('bookings')
        .select('equipment_ids, start_date, end_date')
        .in('status', ['approved', 'active', 'completed'])
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('end_date', endDate.toISOString().split('T')[0]);
      
      if (equipmentId) {
        query = query.contains('equipment_ids', [equipmentId]);
      }
      
      const { data: bookings, error } = await query;
      
      if (error) throw error;
      
      // Calculate total booked days
      let totalBookedDays = 0;
      bookings.forEach(booking => {
        const bookingStart = new Date(booking.start_date);
        const bookingEnd = new Date(booking.end_date);
        const days = Math.ceil((bookingEnd - bookingStart) / (1000 * 60 * 60 * 24)) + 1;
        
        if (equipmentId) {
          totalBookedDays += days;
        } else {
          // For overall utilization, count each equipment item separately
          totalBookedDays += days * booking.equipment_ids.length;
        }
      });
      
      // Get total equipment count if calculating overall
      let equipmentCount = 1;
      if (!equipmentId) {
        const { data: equipment } = await supabase
          .from('equipment')
          .select('id', { count: 'exact' });
        equipmentCount = equipment.length;
      }
      
      const totalAvailableDays = totalDays * equipmentCount;
      const utilizationRate = (totalBookedDays / totalAvailableDays) * 100;
      
      return {
        utilizationRate: Math.round(utilizationRate * 10) / 10,
        totalBookedDays,
        totalAvailableDays,
        bookingCount: bookings.length
      };
      
    } catch (error) {
      console.error('Error calculating utilization:', error);
      return null;
    }
  }
  
  /**
   * Get department usage breakdown
   * @param {Date} startDate 
   * @param {Date} endDate 
   */
  async getDepartmentUsage(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          equipment_ids,
          users!inner(department)
        `)
        .in('status', ['approved', 'active', 'completed'])
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('end_date', endDate.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      // Group by department
      const departmentStats = {};
      
      data.forEach(booking => {
        const dept = booking.users.department;
        if (!departmentStats[dept]) {
          departmentStats[dept] = {
            bookingCount: 0,
            equipmentCount: 0
          };
        }
        
        departmentStats[dept].bookingCount += 1;
        departmentStats[dept].equipmentCount += booking.equipment_ids.length;
      });
      
      // Calculate percentages
      const totalBookings = data.length;
      const result = Object.entries(departmentStats).map(([dept, stats]) => ({
        department: dept,
        bookingCount: stats.bookingCount,
        equipmentCount: stats.equipmentCount,
        percentage: Math.round((stats.bookingCount / totalBookings) * 100)
      }));
      
      return result.sort((a, b) => b.bookingCount - a.bookingCount);
      
    } catch (error) {
      console.error('Error getting department usage:', error);
      return [];
    }
  }
  
  /**
   * Get most popular equipment
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {number} limit 
   */
  async getPopularEquipment(startDate, endDate, limit = 10) {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('equipment_ids')
        .in('status', ['approved', 'active', 'completed'])
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('end_date', endDate.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      // Count bookings per equipment
      const equipmentCounts = {};
      bookings.forEach(booking => {
        booking.equipment_ids.forEach(eqId => {
          equipmentCounts[eqId] = (equipmentCounts[eqId] || 0) + 1;
        });
      });
      
      // Get equipment details
      const equipmentIds = Object.keys(equipmentCounts);
      const { data: equipment } = await supabase
        .from('equipment')
        .select('id, product_name, category')
        .in('id', equipmentIds);
      
      // Combine and sort
      const result = equipment.map(eq => ({
        ...eq,
        bookingCount: equipmentCounts[eq.id]
      })).sort((a, b) => b.bookingCount - a.bookingCount);
      
      return result.slice(0, limit);
      
    } catch (error) {
      console.error('Error getting popular equipment:', error);
      return [];
    }
  }
  
  /**
   * Calculate average booking duration
   * @param {Date} startDate 
   * @param {Date} endDate 
   */
  async getAverageBookingDuration(startDate, endDate) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_date, end_date')
        .in('status', ['approved', 'active', 'completed'])
        .gte('start_date', startDate.toISOString().split('T')[0])
        .lte('end_date', endDate.toISOString().split('T')[0]);
      
      if (error) throw error;
      
      if (data.length === 0) return 0;
      
      const totalDays = data.reduce((sum, booking) => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        return sum + days;
      }, 0);
      
      return Math.round((totalDays / data.length) * 10) / 10;
      
    } catch (error) {
      console.error('Error calculating average duration:', error);
      return 0;
    }
  }
  
  /**
   * Get booking trends over time
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {string} interval - 'day', 'week', 'month'
   */
  async getBookingTrends(startDate, endDate, interval = 'week') {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by interval
      const trends = [];
      const groupedData = this.groupByInterval(data, interval);
      
      Object.entries(groupedData).forEach(([period, bookings]) => {
        trends.push({
          period,
          total: bookings.length,
          approved: bookings.filter(b => b.status === 'approved').length,
          pending: bookings.filter(b => b.status === 'pending').length,
          denied: bookings.filter(b => b.status === 'denied').length
        });
      });
      
      return trends;
      
    } catch (error) {
      console.error('Error getting booking trends:', error);
      return [];
    }
  }
  
  /**
   * Helper: Group data by time interval
   */
  groupByInterval(data, interval) {
    const grouped = {};
    
    data.forEach(item => {
      const date = new Date(item.created_at);
      let key;
      
      switch (interval) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    
    return grouped;
  }
  
  /**
   * Get financial metrics
   * @param {Date} startDate 
   * @param {Date} endDate 
   */
  async getFinancialMetrics(startDate, endDate) {
    try {
      // Get repair costs from equipment notes
      const { data: maintenanceNotes, error } = await supabase
        .from('equipment_notes')
        .select('note_content, created_at')
        .eq('note_type', 'maintenance')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (error) throw error;
      
      // Extract costs from notes (assuming format: "Cost: €XXX")
      let totalRepairCosts = 0;
      const costRegex = /cost:\s*€?(\d+(?:,\d{3})*(?:\.\d{2})?)/i;
      
      maintenanceNotes.forEach(note => {
        const match = note.note_content.match(costRegex);
        if (match) {
          const cost = parseFloat(match[1].replace(',', ''));
          totalRepairCosts += cost;
        }
      });
      
      // Get equipment value
      const { data: equipment } = await supabase
        .from('equipment')
        .select('id');
      
      const estimatedEquipmentValue = equipment.length * 1500; // Average €1500 per item
      
      // Calculate admin time saved (based on automation)
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      const adminTimeSaved = bookings.length * 10; // 10 minutes saved per booking
      const hourlyRate = 25; // €25 per hour
      const moneyTimeMetrics = {
        totalRepairCosts: Math.round(totalRepairCosts),
        estimatedEquipmentValue: estimatedEquipmentValue,
        adminTimeSaved: Math.round((adminTimeSaved / 60) * hourlyRate),
        adminHoursSaved: Math.round(adminTimeSaved / 60)
      };
      
      return monetaryMetrics;
      
    } catch (error) {
      console.error('Error getting financial metrics:', error);
      return null;
    }
  }
}

export const metricsCalculator = new MetricsCalculator();
```

### 2. Export Service

```javascript
// /src/js/analytics/export-service.js
import { csvParser } from '../import/csv-parser.js';
import { metricsCalculator } from './metrics-calculator.js';

class ExportService {
  /**
   * Export analytics to CSV
   * @param {Object} data - Analytics data
   * @param {string} reportType - Type of report
   */
  async exportToCSV(data, reportType) {
    let csvData;
    let filename;
    
    switch (reportType) {
      case 'equipment_usage':
        csvData = this.formatEquipmentUsageCSV(data);
        filename = `equipment_usage_${this.getDateString()}.csv`;
        break;
      
      case 'department_breakdown':
        csvData = this.formatDepartmentCSV(data);
        filename = `department_breakdown_${this.getDateString()}.csv`;
        break;
      
      case 'booking_history':
        csvData = this.formatBookingHistoryCSV(data);
        filename = `booking_history_${this.getDateString()}.csv`;
        break;
      
      default:
        throw new Error('Invalid report type');
    }
    
    csvParser.downloadCSV(csvData, filename);
  }
  
  /**
   * Export analytics to PDF
   * @param {Object} data - Analytics data
   * @param {string} reportTitle 
   */
  async exportToPDF(data, reportTitle) {
    // Generate HTML report
    const htmlContent = this.generateHTMLReport(data, reportTitle);
    
    // Open print dialog (browser handles PDF generation)
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
  
  /**
   * Format equipment usage data for CSV
   */
  formatEquipmentUsageCSV(data) {
    const rows = data.map(item => ({
      'Equipment Name': item.product_name,
      'Category': item.category,
      'Total Bookings': item.bookingCount,
      'Utilization Rate': `${item.utilizationRate}%`,
      'Status': item.status
    }));
    
    return csvParser.exportToCSV(rows, Object.keys(rows[0]));
  }
  
  /**
   * Format department breakdown for CSV
   */
  formatDepartmentCSV(data) {
    const rows = data.map(item => ({
      'Department': item.department,
      'Booking Count': item.bookingCount,
      'Equipment Items Used': item.equipmentCount,
      'Percentage of Total': `${item.percentage}%`
    }));
    
    return csvParser.exportToCSV(rows, Object.keys(rows[0]));
  }
  
  /**
   * Format booking history for CSV
   */
  formatBookingHistoryCSV(data) {
    const rows = data.map(booking => ({
      'Booking ID': booking.id,
      'Student Name': booking.users?.full_name || 'N/A',
      'Department': booking.users?.department || 'N/A',
      'Equipment': booking.equipment_names?.join(', ') || 'N/A',
      'Start Date': booking.start_date,
      'End Date': booking.end_date,
      'Status': booking.status,
      'Created At': booking.created_at
    }));
    
    return csvParser.exportToCSV(rows, Object.keys(rows[0]));
  }
  
  /**
   * Generate HTML report for PDF export
   */
  generateHTMLReport(data, reportTitle) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #000000;
          }
          h1 {
            color: #000000;
            border-bottom: 2px solid #000000;
            padding-bottom: 10px;
          }
          .report-header {
            margin-bottom: 30px;
          }
          .report-date {
            color: #666666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #e5e5e5;
            padding: 12px;
            text-align: left;
          }
          th {
            background: #f8f8f8;
            font-weight: 600;
          }
          .metric-box {
            display: inline-block;
            padding: 20px;
            margin: 10px;
            border: 1px solid #e5e5e5;
            text-align: center;
          }
          .metric-value {
            font-size: 32px;
            font-weight: 300;
            color: #000000;
          }
          .metric-label {
            font-size: 14px;
            color: #666666;
            text-transform: uppercase;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>${reportTitle}</h1>
          <p class="report-date">Generated: ${new Date().toLocaleString()}</p>
          <p class="report-date">NCAD Equipment Booking System</p>
        </div>
        
        ${this.renderReportContent(data)}
        
        <div class="no-print" style="margin-top: 40px;">
          <button onclick="window.print()">Print Report</button>
          <button onclick="window.close()">Close</button>
        </div>
      </body>
      </html>
    `;
  }
  
  /**
   * Render report content based on data type
   */
  renderReportContent(data) {
    let content = '';
    
    // Summary metrics
    if (data.summary) {
      content += '<h2>Summary</h2><div>';
      Object.entries(data.summary).forEach(([key, value]) => {
        content += `
          <div class="metric-box">
            <div class="metric-value">${value}</div>
            <div class="metric-label">${key.replace(/_/g, ' ')}</div>
          </div>
        `;
      });
      content += '</div>';
    }
    
    // Tables
    if (data.tables) {
      data.tables.forEach(table => {
        content += `<h2>${table.title}</h2>`;
        content += this.renderTable(table.data, table.columns);
      });
    }
    
    return content;
  }
  
  /**
   * Render HTML table
   */
  renderTable(data, columns) {
    let html = '<table><thead><tr>';
    
    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    
    html += '</tr></thead><tbody>';
    
    data.forEach(row => {
      html += '<tr>';
      columns.forEach(col => {
        html += `<td>${row[col] || 'N/A'}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    return html;
  }
  
  /**
   * Helper: Get formatted date string
   */
  getDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
}

export const exportService = new ExportService();
```

### 3. Chart Renderer (Simple - No External Libraries)

```javascript
// /src/js/analytics/chart-renderer.js

class ChartRenderer {
  /**
   * Render simple bar chart using CSS
   * @param {HTMLElement} container 
   * @param {Array} data 
   * @param {Object} options 
   */
  renderBarChart(container, data, options = {}) {
    const {
      title = '',
      maxValue = Math.max(...data.map(d => d.value)),
      height = 300,
      color = '#000000'
    } = options;
    
    const html = `
      <div class="chart-container">
        ${title ? `<h3 class="chart-title">${title}</h3>` : ''}
        <div class="bar-chart" style="height: ${height}px;">
          ${data.map(item => `
            <div class="bar-item">
              <div class="bar-wrapper">
                <div class="bar-fill" style="
                  height: ${(item.value / maxValue) * 100}%;
                  background: ${color};
                ">
                  <span class="bar-value">${item.value}</span>
                </div>
              </div>
              <div class="bar-label">${item.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  /**
   * Render donut chart using CSS
   * @param {HTMLElement} container 
   * @param {Array} data - [{label, value, color}]
   */
  renderDonutChart(container, data) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    const segments = data.map(item => {
      const percentage = (item.value / total) * 100;
      const angle = (percentage / 100) * 360;
      const segment = {
        ...item,
        percentage: Math.round(percentage),
        startAngle: currentAngle,
        endAngle: currentAngle + angle
      };
      currentAngle += angle;
      return segment;
    });
    
    const html = `
      <div class="donut-chart-container">
        <div class="donut-chart">
          <svg viewBox="0 0 100 100">
            ${segments.map(seg => this.createDonutSegment(seg, 50, 50, 40, 15)).join('')}
          </svg>
        </div>
        <div class="donut-legend">
          ${segments.map(seg => `
            <div class="legend-item">
              <span class="legend-color" style="background: ${seg.color};"></span>
              <span class="legend-text">${seg.label}: ${seg.percentage}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
  
  /**
   * Helper: Create SVG donut segment
   */
  createDonutSegment(segment, cx, cy, radius, strokeWidth) {
    const startAngle = (segment.startAngle - 90) * (Math.PI / 180);
    const endAngle = (segment.endAngle - 90) * (Math.PI / 180);
    
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    
    const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
    ].join(' ');
    
    return `
      <path
        d="${pathData}"
        fill="none"
        stroke="${segment.color}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
      />
    `;
  }
  
  /**
   * Render line chart
   * @param {HTMLElement} container 
   * @param {Array} data - [{x, y}]
   */
  renderLineChart(container, data, options = {}) {
    const {
      title = '',
      height = 300,
      color = '#000000'
    } = options;
    
    const maxY = Math.max(...data.map(d => d.y));
    const minY = Math.min(...data.map(d => d.y), 0);
    const range = maxY - minY;
    
    // Generate SVG path
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.y - minY) / range * 80 + 10);
      return `${x},${y}`;
    }).join(' ');
    
    const html = `
      <div class="chart-container">
        ${title ? `<h3 class="chart-title">${title}</h3>` : ''}
        <div class="line-chart" style="height: ${height}px;">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points="${points}"
              fill="none"
              stroke="${color}"
              stroke-width="0.5"
              vector-effect="non-scaling-stroke"
            />
          </svg>
          <div class="chart-labels">
            ${data.map(d => `<span>${d.x}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
  }
}

export const chartRenderer = new ChartRenderer();
```

## Analytics Dashboard UI

```html
<!-- /src/pages/admin/analytics.html -->
<div class="analytics-container">
  <div class="analytics-header">
    <h1>Analytics & Reports</h1>
    
    <!-- Date Range Selector -->
    <div class="date-range-controls">
      <select id="date-range-preset">
        <option value="last_week">Last Week</option>
        <option value="last_month" selected>Last Month</option>
        <option value="last_3_months">Last 3 Months</option>
        <option value="this_semester">This Semester</option>
        <option value="custom">Custom Range</option>
      </select>
      
      <div id="custom-date-inputs" class="hidden">
        <input type="date" id="start-date">
        <input type="date" id="end-date">
        <button class="btn btn-secondary" onclick="applyCustomRange()">Apply</button>
      </div>
      
      <button class="btn btn-success" onclick="exportToPDF()">📄 Export PDF</button>
      <button class="btn btn-secondary" onclick="exportToCSV()">📊 Export CSV</button>
    </div>
  </div>
  
  <!-- Key Metrics -->
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-icon">📊</div>
      <div class="metric-value" id="utilization-rate">--</div>
      <div class="metric-label">Equipment Utilization</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-icon">📅</div>
      <div class="metric-value" id="total-bookings">--</div>
      <div class="metric-label">Total Bookings</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-icon">🔥</div>
      <div class="metric-value" id="high-demand-items">--</div>
      <div class="metric-label">High Demand Items</div>
    </div>
    
    <div class="metric-card">
      <div class="metric-icon">⏱️</div>
      <div class="metric-value" id="avg-duration">--</div>
      <div class="metric-label">Avg Booking Days</div>
    </div>
  </div>
  
  <!-- Charts -->
  <div class="charts-grid">
    <div class="chart-card">
      <h3>Department Usage Breakdown</h3>
      <div id="department-chart"></div>
    </div>
    
    <div class="chart-card">
      <h3>Booking Trends</h3>
      <div id="trends-chart"></div>
    </div>
  </div>
  
  <!-- Popular Equipment Table -->
  <div class="table-card">
    <h3>Most Popular Equipment</h3>
    <table class="analytics-table" id="popular-equipment-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Equipment</th>
          <th>Category</th>
          <th>Total Bookings</th>
          <th>Utilization</th>
        </tr>
      </thead>
      <tbody>
        <!-- Populated by JavaScript -->
      </tbody>
    </table>
  </div>
  
  <!-- Financial Impact -->
  <div class="financial-section">
    <h3>Financial Impact</h3>
    <div class="financial-grid">
      <div class="financial-stat">
        <div class="financial-value" id="repair-costs">€--</div>
        <div class="financial-label">Repair Costs (YTD)</div>
      </div>
      <div class="financial-stat">
        <div class="financial-value" id="equipment-value">€--</div>
        <div class="financial-label">Equipment Value</div>
      </div>
      <div class="financial-stat">
        <div class="financial-value" id="time-saved">€--</div>
        <div class="financial-label">Admin Time Saved</div>
      </div>
    </div>
  </div>
</div>
```

```css
/* /src/css/pages/analytics.css */
.analytics-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;
  flex-wrap: wrap;
}

.date-range-controls {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  padding: 30px;
  text-align: center;
  transition: all 0.2s ease;
}

.metric-card:hover {
  border-color: #cccccc;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.metric-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.metric-value {
  font-size: 3rem;
  font-weight: 300;
  color: #000000;
  margin-bottom: 10px;
}

.metric-label {
  color: #666666;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.chart-card,
.table-card,
.financial-section {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  padding: 30px;
  margin-bottom: 30px;
}

/* Bar Chart Styles */
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 10px;
  padding: 20px;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  position: relative;
}

.bar-fill {
  width: 100%;
  background: #000000;
  transition: height 0.5s ease;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 5px;
  position: relative;
}

.bar-value {
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

.bar-label {
  margin-top: 10px;
  font-size: 12px;
  color: #666666;
  text-align: center;
  word-wrap: break-word;
}

/* Donut Chart Styles */
.donut-chart-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: center;
}

.donut-chart {
  width: 100%;
  max-width: 300px;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 2px;
}

.legend-text {
  font-size: 14px;
  color: #333333;
}

/* Analytics Table */
.analytics-table {
  width: 100%;
  border-collapse: collapse;
}

.analytics-table th,
.analytics-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e5e5e5;
}

.analytics-table th {
  background: #f8f8f8;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
}

.analytics-table tbody tr:hover {
  background: #f8f8f8;
}

/* Financial Grid */
.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.financial-stat {
  text-align: center;
  padding: 30px 20px;
  background: #f8f8f8;
  border-left: 4px solid #000000;
}

.financial-value {
  font-size: 2.5rem;
  font-weight: 300;
  color: #000000;
  margin-bottom: 10px;
}

.financial-label {
  color: #666666;
  font-size: 14px;
  text-transform: uppercase;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .analytics-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .date-range-controls {
    flex-direction: column;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .donut-chart-container {
    grid-template-columns: 1fr;
  }
  
  .analytics-table {
    font-size: 12px;
  }
  
  .analytics-table th,
  .analytics-table td {
    padding: 10px 8px;
  }
}
```

## Testing Checklist
- [ ] Utilization calculations are accurate
- [ ] Department breakdown sums to 100%
- [ ] Popular equipment ranking is correct
- [ ] Charts render properly on all devices
- [ ] CSV export includes all data
- [ ] PDF export is properly formatted
- [ ] Date range filtering works correctly
- [ ] Real-time metrics update
- [ ] Mobile charts are responsive
- [ ] Financial calculations are accurate

## Performance Optimization
- Cache calculated metrics for 5 minutes
- Lazy load charts when scrolled into view
- Debounce date range changes
- Use database views for complex queries
- Implement pagination for large datasets

## Next Steps
1. Integrate with admin dashboard
2. Add real-time metric updates
3. Implement predictive analytics (ML)
4. Create scheduled report emails
5. Build custom report builder
6. Add data export automation