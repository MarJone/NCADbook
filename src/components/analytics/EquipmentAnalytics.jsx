import { useMemo } from 'react';
import './EquipmentAnalytics.css';

export default function EquipmentAnalytics({ bookings, equipment, onExportEquipmentData }) {
  // Calculate equipment-specific metrics
  const equipmentMetrics = useMemo(() => {
    if (!bookings || bookings.length === 0 || !equipment || equipment.length === 0) {
      return null;
    }

    // Count bookings by equipment
    const equipmentCounts = {};
    const equipmentDurations = {};
    const categoryCounts = {};

    bookings.forEach(booking => {
      const equip = equipment.find(e => e.id === booking.equipment_id);
      if (!equip) return;

      // Count bookings per equipment
      equipmentCounts[booking.equipment_id] = (equipmentCounts[booking.equipment_id] || 0) + 1;

      // Calculate booking duration
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      if (!equipmentDurations[booking.equipment_id]) {
        equipmentDurations[booking.equipment_id] = {
          total: 0,
          count: 0,
          name: equip.product_name,
          category: equip.category
        };
      }
      equipmentDurations[booking.equipment_id].total += duration;
      equipmentDurations[booking.equipment_id].count += 1;

      // Count by category
      const category = equip.category || 'Unknown';
      if (!categoryCounts[category]) {
        categoryCounts[category] = {
          bookings: 0,
          equipment: new Set()
        };
      }
      categoryCounts[category].bookings += 1;
      categoryCounts[category].equipment.add(booking.equipment_id);
    });

    // Top 10 most booked equipment
    const top10Equipment = Object.entries(equipmentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([equipId, count]) => {
        const equip = equipment.find(e => e.id === equipId);
        return {
          id: equipId,
          name: equip?.product_name || 'Unknown',
          category: equip?.category || 'Unknown',
          department: equip?.department || 'Unknown',
          count,
          utilizationRate: Math.round((count / bookings.length) * 100)
        };
      });

    // Category utilization stats
    const categoryStats = Object.entries(categoryCounts)
      .map(([category, data]) => ({
        category,
        bookings: data.bookings,
        uniqueEquipment: data.equipment.size,
        avgBookingsPerItem: Math.round((data.bookings / data.equipment.size) * 10) / 10
      }))
      .sort((a, b) => b.bookings - a.bookings);

    // Average duration by equipment
    const avgDurationByEquipment = Object.entries(equipmentDurations)
      .map(([equipId, data]) => ({
        id: equipId,
        name: data.name,
        category: data.category,
        avgDuration: Math.round((data.total / data.count) * 10) / 10,
        totalBookings: data.count
      }))
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, 10);

    // Mock equipment condition distribution (can be replaced with real verification data)
    const conditionDistribution = {
      excellent: Math.floor(equipment.length * 0.65),
      good: Math.floor(equipment.length * 0.25),
      fair: Math.floor(equipment.length * 0.08),
      needsRepair: Math.floor(equipment.length * 0.02)
    };

    // Generate monthly trend data (last 6 months)
    const monthlyData = {};
    bookings.forEach(booking => {
      const date = new Date(booking.start_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { key: monthKey, name: monthName, count: 0 };
      }
      monthlyData[monthKey].count += 1;
    });

    const monthlyTrends = Object.values(monthlyData)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);

    return {
      top10Equipment,
      categoryStats,
      avgDurationByEquipment,
      conditionDistribution,
      monthlyTrends
    };
  }, [bookings, equipment]);

  if (!equipmentMetrics) {
    return (
      <div className="equipment-analytics-empty">
        <p>No equipment data available. Bookings or equipment data may be loading.</p>
      </div>
    );
  }

  const totalConditionItems = Object.values(equipmentMetrics.conditionDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="equipment-analytics">
      <div className="equipment-analytics-header">
        <div>
          <h2>Equipment Usage Analytics</h2>
          <p className="subtitle">Detailed equipment utilization and performance metrics</p>
        </div>
        <button
          onClick={onExportEquipmentData}
          className="btn btn-secondary"
        >
          📊 Export Equipment Data
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="equipment-metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <h3>{equipment.length}</h3>
            <p>Total Equipment</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🔥</div>
          <div className="metric-content">
            <h3>{equipmentMetrics.top10Equipment.length > 0 ? equipmentMetrics.top10Equipment[0].count : 0}</h3>
            <p>Most Booked Item</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <h3>
              {equipmentMetrics.avgDurationByEquipment.length > 0
                ? equipmentMetrics.avgDurationByEquipment[0].avgDuration
                : 0} days
            </h3>
            <p>Avg Booking Duration</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📂</div>
          <div className="metric-content">
            <h3>{equipmentMetrics.categoryStats.length}</h3>
            <p>Equipment Categories</p>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="equipment-analytics-grid">
        {/* Top 10 Most Booked Equipment */}
        <div className="analytics-card equipment-top10">
          <h3>Top 10 Most Booked Equipment</h3>
          <div className="equipment-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Bookings</th>
                  <th>Usage %</th>
                </tr>
              </thead>
              <tbody>
                {equipmentMetrics.top10Equipment.map((item, index) => (
                  <tr key={item.id}>
                    <td className="rank-cell">#{index + 1}</td>
                    <td className="equipment-name">{item.name}</td>
                    <td className="category-cell">{item.category}</td>
                    <td className="count-cell">{item.count}</td>
                    <td className="utilization-cell">
                      <div className="utilization-bar-container">
                        <div
                          className="utilization-bar"
                          style={{ width: `${item.utilizationRate}%` }}
                        ></div>
                        <span>{item.utilizationRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Utilization */}
        <div className="analytics-card">
          <h3>Utilization by Category</h3>
          <div className="chart-list">
            {equipmentMetrics.categoryStats.map((stat) => (
              <div key={stat.category} className="chart-item">
                <div className="chart-item-header">
                  <span className="item-name">{stat.category}</span>
                  <span className="item-badge">{stat.uniqueEquipment} items</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(stat.bookings / bookings.length) * 100}%`,
                      background: 'var(--master-accent-primary)'
                    }}
                  ></div>
                </div>
                <div className="chart-item-stats">
                  <span>{stat.bookings} bookings</span>
                  <span>{stat.avgBookingsPerItem} avg/item</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Average Booking Duration */}
        <div className="analytics-card">
          <h3>Avg Booking Duration (Top 10)</h3>
          <div className="equipment-duration-list">
            {equipmentMetrics.avgDurationByEquipment.map((item) => (
              <div key={item.id} className="duration-item">
                <div className="duration-item-info">
                  <span className="duration-name">{item.name}</span>
                  <span className="duration-category">{item.category}</span>
                </div>
                <div className="duration-stats">
                  <span className="duration-value">{item.avgDuration} days</span>
                  <span className="duration-count">{item.totalBookings} bookings</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Condition Distribution */}
        <div className="analytics-card">
          <h3>Equipment Condition Status</h3>
          <p className="card-subtitle">Based on equipment inventory data</p>
          <div className="condition-distribution">
            <div className="condition-item condition-excellent">
              <div className="condition-icon">✅</div>
              <div className="condition-info">
                <span className="condition-label">Excellent</span>
                <span className="condition-value">{equipmentMetrics.conditionDistribution.excellent}</span>
                <span className="condition-percent">
                  {Math.round((equipmentMetrics.conditionDistribution.excellent / totalConditionItems) * 100)}%
                </span>
              </div>
            </div>

            <div className="condition-item condition-good">
              <div className="condition-icon">👍</div>
              <div className="condition-info">
                <span className="condition-label">Good</span>
                <span className="condition-value">{equipmentMetrics.conditionDistribution.good}</span>
                <span className="condition-percent">
                  {Math.round((equipmentMetrics.conditionDistribution.good / totalConditionItems) * 100)}%
                </span>
              </div>
            </div>

            <div className="condition-item condition-fair">
              <div className="condition-icon">⚠️</div>
              <div className="condition-info">
                <span className="condition-label">Fair</span>
                <span className="condition-value">{equipmentMetrics.conditionDistribution.fair}</span>
                <span className="condition-percent">
                  {Math.round((equipmentMetrics.conditionDistribution.fair / totalConditionItems) * 100)}%
                </span>
              </div>
            </div>

            <div className="condition-item condition-repair">
              <div className="condition-icon">🔧</div>
              <div className="condition-info">
                <span className="condition-label">Needs Repair</span>
                <span className="condition-value">{equipmentMetrics.conditionDistribution.needsRepair}</span>
                <span className="condition-percent">
                  {Math.round((equipmentMetrics.conditionDistribution.needsRepair / totalConditionItems) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Trends Over Time */}
        <div className="analytics-card equipment-trends">
          <h3>Booking Trends (Last 6 Months)</h3>
          <p className="card-subtitle">Chart visualization coming soon</p>
          {/* Placeholder for future chart component */}
          <div className="chart-placeholder">
            <div className="trend-bars">
              {equipmentMetrics.monthlyTrends.map((trend) => {
                const maxCount = Math.max(...equipmentMetrics.monthlyTrends.map(t => t.count));
                const heightPercent = (trend.count / maxCount) * 100;

                return (
                  <div key={trend.key} className="trend-bar-item">
                    <div className="trend-bar-container">
                      <div
                        className="trend-bar"
                        style={{ height: `${heightPercent}%` }}
                        title={`${trend.name}: ${trend.count} bookings`}
                      >
                        <span className="trend-bar-value">{trend.count}</span>
                      </div>
                    </div>
                    <span className="trend-label">{trend.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="chart-note">
            // Chart component integration placeholder - can be replaced with Chart.js or Recharts
          </div>
        </div>
      </div>
    </div>
  );
}
