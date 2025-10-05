import { useState } from 'react';

export default function BudgetManagerPortal() {
  const budgetData = [
    { dept: 'Communication Design', allocated: 125000, spent: 98400, forecast: 115000, variance: 10000 },
    { dept: 'Product Design', allocated: 95000, spent: 82300, forecast: 91000, variance: 4000 },
    { dept: 'Media', allocated: 140000, spent: 132100, forecast: 138500, variance: 1500 },
    { dept: 'Painting', allocated: 65000, spent: 48200, forecast: 58000, variance: 7000 },
    { dept: 'Sculpture', allocated: 85000, spent: 71500, forecast: 79000, variance: 6000 },
  ];

  const quarterlySpend = [
    { quarter: 'Q1 2024', amount: 98500 },
    { quarter: 'Q2 2024', amount: 112300 },
    { quarter: 'Q3 2024', amount: 125700 },
    { quarter: 'Q4 2024 (Forecast)', amount: 95200 }
  ];

  const totalAllocated = budgetData.reduce((sum, dept) => sum + dept.allocated, 0);
  const totalSpent = budgetData.reduce((sum, dept) => sum + dept.spent, 0);
  const totalForecast = budgetData.reduce((sum, dept) => sum + dept.forecast, 0);

  return (
    <div className="portal-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="portal-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#9C27B0', marginBottom: '0.5rem' }}>📈 Budget Manager Portal</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Department budgets, cost forecasting, and financial planning
        </p>
      </div>

      <div className="permissions-notice" style={{
        background: '#E1BEE7',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        border: '2px solid #9C27B0'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#6A1B9A' }}>Your Permissions:</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>✅ View all department budgets and spending</li>
          <li>✅ Forecast future costs based on usage trends</li>
          <li>✅ Export budget reports (PDF/Excel)</li>
          <li>✅ Track variance and budget health</li>
          <li>❌ Cannot modify budget allocations (requires Finance Director approval)</li>
        </ul>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Budget Summary</h2>
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '1.5rem',
          borderRadius: '8px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Total Allocated</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>€{totalAllocated.toLocaleString()}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '1.5rem',
          borderRadius: '8px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>YTD Spent</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>€{totalSpent.toLocaleString()}</p>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
            {((totalSpent / totalAllocated) * 100).toFixed(1)}% of budget
          </p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '1.5rem',
          borderRadius: '8px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Forecasted Year-End</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>€{totalForecast.toLocaleString()}</p>
          <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
            €{(totalAllocated - totalForecast).toLocaleString()} under budget
          </p>
        </div>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Department Budget Breakdown</h2>
      <div style={{
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#9C27B0', color: 'white' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Allocated</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>YTD Spent</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Forecast</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Variance</th>
              <th style={{ padding: '1rem', textAlign: 'center' }}>Health</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.map((dept, idx) => {
              const percentSpent = (dept.spent / dept.allocated * 100).toFixed(1);
              const health = dept.variance > 5000 ? 'Good' : dept.variance > 0 ? 'Fair' : 'At Risk';
              const healthColor = dept.variance > 5000 ? '#4CAF50' : dept.variance > 0 ? '#FF9800' : '#f44336';

              return (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{dept.dept}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>€{dept.allocated.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    €{dept.spent.toLocaleString()}
                    <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '0.5rem' }}>
                      ({percentSpent}%)
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>€{dept.forecast.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: dept.variance > 0 ? '#4CAF50' : '#f44336' }}>
                    €{dept.variance.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: healthColor,
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '0.85rem'
                    }}>
                      {health}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Quarterly Spending Trend</h2>
      <div style={{
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        {quarterlySpend.map((q, idx) => {
          const maxAmount = Math.max(...quarterlySpend.map(x => x.amount));
          const barWidth = (q.amount / maxAmount * 100);

          return (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 'bold' }}>{q.quarter}</span>
                <span style={{ color: '#666' }}>€{q.amount.toLocaleString()}</span>
              </div>
              <div style={{ background: '#eee', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${barWidth}%`,
                  height: '100%',
                  background: idx === quarterlySpend.length - 1
                    ? 'linear-gradient(90deg, #9C27B0, #CE93D8)'
                    : 'linear-gradient(90deg, #4CAF50, #81C784)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button style={{
          padding: '0.75rem 2rem',
          background: '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          marginRight: '1rem'
        }}>
          📊 Generate Budget Report (PDF)
        </button>
        <button style={{
          padding: '0.75rem 2rem',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer',
          marginRight: '1rem'
        }}>
          📥 Export to Excel
        </button>
        <button style={{
          padding: '0.75rem 2rem',
          background: '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          🔮 Run Forecast Model
        </button>
      </div>
    </div>
  );
}
