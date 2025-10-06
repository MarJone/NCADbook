import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode';
import { useAuth } from '../../contexts/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    approvalRate: 0,
    popularEquipment: [],
    bookingsByDepartment: {},
    bookingsByStatus: {},
    filteredBookings: []
  });
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Data for filters
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Recalculate analytics when filters change
    if (allBookings.length > 0) {
      calculateAnalytics();
    }
  }, [filterDepartment, filterUser, filterStartDate, filterEndDate, allBookings]);

  const loadInitialData = async () => {
    try {
      const bookings = await demoMode.query('bookings');
      const equipment = await demoMode.query('equipment');
      const usersData = await demoMode.query('users');

      setAllBookings(bookings);
      setUsers(usersData);

      // Extract unique departments
      const uniqueDepts = [...new Set(usersData.map(u => u.department))].filter(Boolean);
      setDepartments(uniqueDepts);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = async () => {
    try {
      const equipment = await demoMode.query('equipment');

      // Apply filters
      let filteredBookings = [...allBookings];

      // Department admin: auto-filter to only see bookings for their department's equipment
      if (user && user.role === 'department_admin') {
        filteredBookings = filteredBookings.filter(b => {
          const equipmentItem = equipment.find(e => e.id === b.equipment_id);
          return equipmentItem?.department === user.department;
        });
      }

      // Filter by department (user selection)
      if (filterDepartment !== 'all') {
        filteredBookings = filteredBookings.filter(b => {
          const bookingUser = users.find(u => u.id === b.user_id);
          return bookingUser?.department === filterDepartment;
        });
      }

      // Filter by user
      if (filterUser !== 'all') {
        filteredBookings = filteredBookings.filter(b => b.user_id === filterUser);
      }

      // Filter by start date
      if (filterStartDate) {
        filteredBookings = filteredBookings.filter(b =>
          new Date(b.start_date) >= new Date(filterStartDate)
        );
      }

      // Filter by end date
      if (filterEndDate) {
        filteredBookings = filteredBookings.filter(b =>
          new Date(b.start_date) <= new Date(filterEndDate)
        );
      }

      // Calculate approval rate
      const totalNonPending = filteredBookings.filter(b => b.status !== 'pending').length;
      const approved = filteredBookings.filter(b => b.status === 'approved').length;
      const approvalRate = totalNonPending > 0 ? Math.round((approved / totalNonPending) * 100) : 0;

      // Count bookings by equipment
      const equipmentCounts = {};
      filteredBookings.forEach(b => {
        equipmentCounts[b.equipment_id] = (equipmentCounts[b.equipment_id] || 0) + 1;
      });

      // Get top 5 popular equipment
      const popularEquipment = Object.entries(equipmentCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([equipId, count]) => {
          const equip = equipment.find(e => e.id === equipId);
          return {
            name: equip?.product_name || 'Unknown',
            count
          };
        });

      // Bookings by department
      const bookingsByDepartment = {};
      for (const booking of filteredBookings) {
        const user = users.find(u => u.id === booking.user_id);
        const dept = user?.department || 'Unknown';
        bookingsByDepartment[dept] = (bookingsByDepartment[dept] || 0) + 1;
      }

      // Bookings by status
      const bookingsByStatus = {};
      filteredBookings.forEach(b => {
        bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1;
      });

      setAnalytics({
        totalBookings: filteredBookings.length,
        approvalRate,
        popularEquipment,
        bookingsByDepartment,
        bookingsByStatus,
        filteredBookings
      });
    } catch (error) {
      console.error('Failed to calculate analytics:', error);
    }
  };

  const exportToPDF = async () => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Purple theme colors
      const primaryPurple = [156, 39, 176]; // #9C27B0
      const lightPurple = [243, 229, 245]; // #F3E5F5
      const darkGray = [26, 26, 26];
      const mediumGray = [84, 110, 122];

      // Header with purple gradient background
      doc.setFillColor(...primaryPurple);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // NCAD Logo/Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('NCAD Equipment Booking System', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text('Analytics & Reports', pageWidth / 2, 30, { align: 'center' });

      // Report metadata
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Generated: ${new Date().toLocaleString('en-IE')}`, pageWidth / 2, 38, { align: 'center' });

      // Filter information box
      let yPos = 55;
      doc.setFillColor(...lightPurple);
      doc.roundedRect(14, yPos, pageWidth - 28, 25, 2, 2, 'F');

      doc.setTextColor(...darkGray);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Applied Filters:', 20, yPos + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      let filterText = [];
      if (filterDepartment !== 'all') filterText.push(`Department: ${filterDepartment}`);
      if (filterUser !== 'all') {
        const selectedUser = users.find(u => u.id === filterUser);
        filterText.push(`User: ${selectedUser?.full_name || 'Unknown'}`);
      }
      if (filterStartDate) filterText.push(`From: ${new Date(filterStartDate).toLocaleDateString('en-IE')}`);
      if (filterEndDate) filterText.push(`To: ${new Date(filterEndDate).toLocaleDateString('en-IE')}`);

      if (filterText.length === 0) {
        filterText.push('No filters applied - showing all data');
      }

      doc.text(filterText.join(' • '), 20, yPos + 15);

      // Summary statistics
      yPos = 90;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryPurple);
      doc.text('Summary Statistics', 20, yPos);

      yPos += 10;
      doc.autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: [
          ['Total Bookings', analytics.totalBookings.toString()],
          ['Approval Rate', `${analytics.approvalRate}%`],
          ['Pending Bookings', (analytics.bookingsByStatus['pending'] || 0).toString()],
          ['Approved Bookings', (analytics.bookingsByStatus['approved'] || 0).toString()],
          ['Rejected Bookings', (analytics.bookingsByStatus['rejected'] || 0).toString()]
        ],
        theme: 'grid',
        headStyles: {
          fillColor: primaryPurple,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 20, right: 20 }
      });

      // Popular Equipment
      yPos = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryPurple);
      doc.text('Top 5 Popular Equipment', 20, yPos);

      yPos += 5;
      const popularEquipData = analytics.popularEquipment.map(item => [
        item.name,
        item.count.toString(),
        `${Math.round((item.count / analytics.totalBookings) * 100)}%`
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Equipment Name', 'Bookings', 'Usage %']],
        body: popularEquipData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryPurple,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 20, right: 20 }
      });

      // Bookings by Department
      yPos = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryPurple);
      doc.text('Bookings by Department', 20, yPos);

      yPos += 5;
      const deptData = Object.entries(analytics.bookingsByDepartment).map(([dept, count]) => [
        dept,
        count.toString(),
        `${Math.round((count / analytics.totalBookings) * 100)}%`
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Department', 'Bookings', 'Percentage']],
        body: deptData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryPurple,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 20, right: 20 }
      });

      // Bookings by Status
      yPos = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryPurple);
      doc.text('Bookings by Status', 20, yPos);

      yPos += 5;
      const statusData = Object.entries(analytics.bookingsByStatus).map(([status, count]) => [
        status.charAt(0).toUpperCase() + status.slice(1),
        count.toString(),
        `${Math.round((count / analytics.totalBookings) * 100)}%`
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Status', 'Count', 'Percentage']],
        body: statusData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryPurple,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: darkGray
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        margin: { left: 20, right: 20 }
      });

      // Footer on each page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...mediumGray);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `NCAD Equipment Booking System - Confidential`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `NCAD_Analytics_Report_${timestamp}.pdf`;

      // Save PDF
      doc.save(filename);

      alert('PDF report generated successfully!');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    }
  };

  const exportToCSV = () => {
    try {
      const equipment = {};

      // Create CSV header
      let csv = 'Booking ID,User,Department,Equipment,Start Date,End Date,Status,Created\n';

      // Add data rows
      analytics.filteredBookings.forEach(booking => {
        const user = users.find(u => u.id === booking.user_id);
        const equipName = equipment[booking.equipment_id] || 'Unknown';

        csv += `${booking.id},"${user?.full_name || 'Unknown'}","${user?.department || 'Unknown'}","${equipName}",${booking.start_date},${booking.end_date},${booking.status},${booking.created_at}\n`;
      });

      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const resetFilters = () => {
    setFilterDepartment('all');
    setFilterUser('all');
    setFilterStartDate('');
    setFilterEndDate('');
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div>
          <h2>Analytics & Reports</h2>
          <p className="subtitle">Filter and export booking statistics</p>
        </div>
        <div className="analytics-actions">
          <button onClick={exportToCSV} className="btn btn-secondary">
            📊 Export CSV
          </button>
          <button onClick={exportToPDF} className="btn btn-primary">
            📄 Generate PDF Report
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="analytics-filters">
        <h3>Filters</h3>
        <div className="filter-grid">
          <div className="filter-group">
            <label htmlFor="filter-department">Department</label>
            <select
              id="filter-department"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="select-input"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-user">User</label>
            <select
              id="filter-user"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="select-input"
            >
              <option value="all">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.department})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="filter-start-date">Start Date</label>
            <input
              id="filter-start-date"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-end-date">End Date</label>
            <input
              id="filter-end-date"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="filter-group">
            <label>&nbsp;</label>
            <button onClick={resetFilters} className="btn btn-secondary btn-reset">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon" style={{ background: 'var(--master-bg-tertiary)', color: 'var(--master-accent-primary)' }}>📊</div>
          <div className="stat-content">
            <h3>{analytics.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon" style={{ background: '#F3E5F5', color: '#7B1FA2' }}>✓</div>
          <div className="stat-content">
            <h3>{analytics.approvalRate}%</h3>
            <p>Approval Rate</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Popular Equipment</h3>
          <div className="chart-list">
            {analytics.popularEquipment.length > 0 ? (
              analytics.popularEquipment.map((item, index) => (
                <div key={index} className="chart-item">
                  <span className="item-name">{item.name}</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(item.count / analytics.totalBookings) * 100}%`,
                        background: 'var(--master-accent-primary)'
                      }}
                    ></div>
                  </div>
                  <span className="item-count">{item.count} bookings</span>
                </div>
              ))
            ) : (
              <p className="empty-message">No data available</p>
            )}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Bookings by Department</h3>
          <div className="chart-list">
            {Object.entries(analytics.bookingsByDepartment).length > 0 ? (
              Object.entries(analytics.bookingsByDepartment).map(([dept, count]) => (
                <div key={dept} className="chart-item">
                  <span className="item-name">{dept}</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(count / analytics.totalBookings) * 100}%`,
                        background: 'var(--master-accent-primary)'
                      }}
                    ></div>
                  </div>
                  <span className="item-count">{count}</span>
                </div>
              ))
            ) : (
              <p className="empty-message">No data available</p>
            )}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Bookings by Status</h3>
          <div className="chart-list">
            {Object.entries(analytics.bookingsByStatus).length > 0 ? (
              Object.entries(analytics.bookingsByStatus).map(([status, count]) => (
                <div key={status} className="chart-item">
                  <span className="item-name">{status}</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(count / analytics.totalBookings) * 100}%`,
                        background: 'var(--master-accent-primary)'
                      }}
                    ></div>
                  </div>
                  <span className="item-count">{count}</span>
                </div>
              ))
            ) : (
              <p className="empty-message">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
