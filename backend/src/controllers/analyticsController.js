import { query } from '../config/database.js';

/**
 * Get analytics dashboard data
 * GET /api/analytics/dashboard
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { start_date, end_date, department } = req.query;

    // Build date filter
    let dateFilter = '';
    const params = [];
    let paramCount = 1;

    if (start_date) {
      dateFilter += ` AND b.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      dateFilter += ` AND b.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    // Department filter based on role
    let deptFilter = '';
    if (req.user.role === 'department_admin') {
      deptFilter = ` AND e.department = $${paramCount}`;
      params.push(req.user.department);
      paramCount++;
    } else if (department) {
      deptFilter = ` AND e.department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    // 1. Total bookings count
    const totalBookingsResult = await query(`
      SELECT COUNT(*) as total
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateFilter} ${deptFilter}
    `, params);

    // 2. Bookings by status
    const bookingsByStatusResult = await query(`
      SELECT
        b.status,
        COUNT(*) as count
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateFilter} ${deptFilter}
      GROUP BY b.status
      ORDER BY count DESC
    `, params);

    // 3. Most booked equipment
    const mostBookedResult = await query(`
      SELECT
        e.id,
        e.product_name,
        e.category,
        e.department,
        COUNT(b.id) as booking_count
      FROM equipment e
      LEFT JOIN bookings b ON e.id = b.equipment_id ${dateFilter.replace('b.created_at', 'b.created_at')}
      WHERE 1=1 ${deptFilter}
      GROUP BY e.id, e.product_name, e.category, e.department
      ORDER BY booking_count DESC
      LIMIT 10
    `, params);

    // 4. Bookings by department
    const bookingsByDeptResult = await query(`
      SELECT
        e.department,
        COUNT(b.id) as booking_count
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateFilter} ${deptFilter}
      GROUP BY e.department
      ORDER BY booking_count DESC
    `, params);

    // 5. Bookings by category
    const bookingsByCategoryResult = await query(`
      SELECT
        e.category,
        COUNT(b.id) as booking_count
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateFilter} ${deptFilter}
      GROUP BY e.category
      ORDER BY booking_count DESC
    `, params);

    // 6. Equipment utilization (available vs booked)
    const equipmentStatusResult = await query(`
      SELECT
        status,
        COUNT(*) as count
      FROM equipment
      WHERE 1=1 ${deptFilter.replace('e.department', 'department')}
      GROUP BY status
    `, deptFilter ? [params[params.length - 1]] : []);

    // 7. Active users (users with bookings)
    const activeUsersResult = await query(`
      SELECT COUNT(DISTINCT b.user_id) as count
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateFilter} ${deptFilter}
    `, params);

    // 8. Average booking duration
    const avgDurationResult = await query(`
      SELECT
        AVG(EXTRACT(DAY FROM (b.end_date - b.start_date))) as avg_days
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE b.status IN ('approved', 'completed') ${dateFilter} ${deptFilter}
    `, params);

    // 9. Bookings over time (last 30 days or custom range)
    const bookingsOverTimeResult = await query(`
      SELECT
        DATE(b.created_at) as date,
        COUNT(*) as count
      FROM bookings b
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateFilter} ${deptFilter}
      GROUP BY DATE(b.created_at)
      ORDER BY date ASC
    `, params);

    // 10. Top users by booking count
    const topUsersResult = await query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.department,
        COUNT(b.id) as booking_count
      FROM users u
      JOIN bookings b ON u.id = b.user_id
      JOIN equipment e ON b.equipment_id = e.id
      WHERE 1=1 ${dateFilter} ${deptFilter}
      GROUP BY u.id, u.full_name, u.email, u.department
      ORDER BY booking_count DESC
      LIMIT 10
    `, params);

    // Compile analytics response
    const analytics = {
      summary: {
        total_bookings: parseInt(totalBookingsResult.rows[0].total),
        active_users: parseInt(activeUsersResult.rows[0].count),
        average_booking_duration_days: parseFloat(avgDurationResult.rows[0].avg_days) || 0,
      },
      bookings_by_status: bookingsByStatusResult.rows,
      most_booked_equipment: mostBookedResult.rows,
      bookings_by_department: bookingsByDeptResult.rows,
      bookings_by_category: bookingsByCategoryResult.rows,
      equipment_status: equipmentStatusResult.rows,
      bookings_over_time: bookingsOverTimeResult.rows,
      top_users: topUsersResult.rows,
      filters: {
        start_date: start_date || null,
        end_date: end_date || null,
        department: department || (req.user.role === 'department_admin' ? req.user.department : null)
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

/**
 * Export analytics to CSV
 * GET /api/analytics/export/csv
 */
export const exportCSV = async (req, res) => {
  try {
    const { start_date, end_date, department, type = 'bookings' } = req.query;

    let csvData = '';
    let filename = 'export.csv';

    // Build filters
    let dateFilter = '';
    const params = [];
    let paramCount = 1;

    if (start_date) {
      dateFilter += ` AND b.created_at >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      dateFilter += ` AND b.created_at <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    let deptFilter = '';
    if (req.user.role === 'department_admin') {
      deptFilter = ` AND e.department = $${paramCount}`;
      params.push(req.user.department);
      paramCount++;
    } else if (department) {
      deptFilter = ` AND e.department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    if (type === 'bookings') {
      // Export bookings data
      const result = await query(`
        SELECT
          b.id,
          b.created_at,
          b.start_date,
          b.end_date,
          b.status,
          b.purpose,
          u.full_name as user_name,
          u.email as user_email,
          u.department as user_department,
          e.product_name as equipment_name,
          e.category as equipment_category,
          e.department as equipment_department,
          e.tracking_number
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN equipment e ON b.equipment_id = e.id
        WHERE 1=1 ${dateFilter} ${deptFilter}
        ORDER BY b.created_at DESC
      `, params);

      // Build CSV
      const headers = [
        'ID', 'Created At', 'Start Date', 'End Date', 'Status', 'Purpose',
        'User Name', 'User Email', 'User Department',
        'Equipment Name', 'Equipment Category', 'Equipment Department', 'Tracking Number'
      ];

      csvData = headers.join(',') + '\n';

      result.rows.forEach(row => {
        const values = [
          row.id,
          new Date(row.created_at).toISOString(),
          row.start_date,
          row.end_date,
          row.status,
          `"${(row.purpose || '').replace(/"/g, '""')}"`, // Escape quotes
          `"${row.user_name}"`,
          row.user_email,
          row.user_department,
          `"${row.equipment_name}"`,
          row.equipment_category,
          row.equipment_department,
          row.tracking_number || ''
        ];
        csvData += values.join(',') + '\n';
      });

      filename = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'equipment') {
      // Export equipment data
      const equipmentParams = deptFilter ? [params[params.length - 1]] : [];
      const result = await query(`
        SELECT
          e.id,
          e.product_name,
          e.tracking_number,
          e.description,
          e.category,
          e.department,
          e.status,
          e.created_at,
          COUNT(b.id) as total_bookings
        FROM equipment e
        LEFT JOIN bookings b ON e.id = b.equipment_id
        WHERE 1=1 ${deptFilter}
        GROUP BY e.id, e.product_name, e.tracking_number, e.description, e.category, e.department, e.status, e.created_at
        ORDER BY total_bookings DESC
      `, equipmentParams);

      const headers = [
        'ID', 'Product Name', 'Tracking Number', 'Description',
        'Category', 'Department', 'Status', 'Created At', 'Total Bookings'
      ];

      csvData = headers.join(',') + '\n';

      result.rows.forEach(row => {
        const values = [
          row.id,
          `"${row.product_name}"`,
          row.tracking_number || '',
          `"${(row.description || '').replace(/"/g, '""')}"`,
          row.category,
          row.department,
          row.status,
          new Date(row.created_at).toISOString(),
          row.total_bookings
        ];
        csvData += values.join(',') + '\n';
      });

      filename = `equipment_export_${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
};

/**
 * Get equipment utilization report
 * GET /api/analytics/utilization
 */
export const getEquipmentUtilization = async (req, res) => {
  try {
    const { start_date, end_date, department } = req.query;

    let dateFilter = '';
    const params = [];
    let paramCount = 1;

    if (start_date) {
      dateFilter += ` AND b.start_date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      dateFilter += ` AND b.end_date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    let deptFilter = '';
    if (req.user.role === 'department_admin') {
      deptFilter = ` AND e.department = $${paramCount}`;
      params.push(req.user.department);
      paramCount++;
    } else if (department) {
      deptFilter = ` AND e.department = $${paramCount}`;
      params.push(department);
      paramCount++;
    }

    const result = await query(`
      SELECT
        e.id,
        e.product_name,
        e.category,
        e.department,
        e.status,
        COUNT(CASE WHEN b.status IN ('approved', 'completed') THEN 1 END) as approved_bookings,
        COUNT(CASE WHEN b.status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN b.status = 'denied' THEN 1 END) as denied_bookings,
        COUNT(b.id) as total_bookings,
        SUM(CASE
          WHEN b.status IN ('approved', 'completed')
          THEN EXTRACT(DAY FROM (b.end_date - b.start_date))
          ELSE 0
        END) as total_days_booked
      FROM equipment e
      LEFT JOIN bookings b ON e.id = b.equipment_id ${dateFilter}
      WHERE 1=1 ${deptFilter}
      GROUP BY e.id, e.product_name, e.category, e.department, e.status
      ORDER BY total_bookings DESC
    `, params);

    res.json({
      utilization: result.rows,
      total_equipment: result.rows.length
    });
  } catch (error) {
    console.error('Get utilization error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment utilization' });
  }
};
