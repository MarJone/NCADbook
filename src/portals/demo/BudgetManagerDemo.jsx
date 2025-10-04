import { Link } from 'react-router-dom';
import './DemoPortal.css';

export default function BudgetManagerDemo() {
  const roiData = [
    { equipment: 'Canon EOS R5', cost: 4500, utilization: 180, roi: 200, category: 'Excellent' },
    { equipment: 'Sony A7 III', cost: 3200, utilization: 160, roi: 175, category: 'Excellent' },
    { equipment: 'MacBook Pro', cost: 2800, utilization: 90, roi: 68, category: 'Fair' }
  ];

  const replacementPriority = [
    { equipment: 'Canon 5D Mark III', age: 8.5, score: 8.75, recommendation: 'Replace Immediately' },
    { equipment: 'Sony A7 II', age: 6.2, score: 7.20, recommendation: 'Budget Next FY' },
    { equipment: 'MacBook Pro 2019', age: 4.8, score: 5.50, recommendation: 'Monitor 12-24 months' }
  ];

  return (
    <div className="demo-portal budget-manager-portal">
      <div className="demo-header">
        <div>
          <h1>📊 Budget Manager Portal</h1>
          <p className="demo-subtitle">Demo Portal - Strategic Planning & ROI Analytics</p>
        </div>
        <Link to="/admin/role-management" className="btn btn-secondary">
          ← Back to Role Management
        </Link>
      </div>

      <div className="demo-info-banner">
        <h3>Role Purpose</h3>
        <p>
          <strong>For:</strong> Department heads and financial planners<br />
          <strong>Can:</strong> View ROI analytics, run replacement priority matrix, forecast budgets<br />
          <strong>Cannot:</strong> Approve bookings, modify equipment, access detailed student data
        </p>
      </div>

      <section className="demo-section">
        <h2>✅ Permissions & Access</h2>
        <div className="permissions-grid">
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>View financial and utilization data</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Run ROI calculator (usage × rental rate)</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Generate replacement priority matrix</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Multi-year budget forecasting</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>Approve bookings (operational decisions)</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>Modify equipment records or costs</span>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>💎 Equipment ROI Analysis</h2>
        <p className="section-subtitle">ROI = (Utilization Days × Market Rental Rate - Total Cost) / Total Cost</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Total Cost</th>
              <th>Days Booked (2 yrs)</th>
              <th>ROI %</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {roiData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.equipment}</td>
                <td>€{item.cost.toLocaleString()}</td>
                <td>{item.utilization}</td>
                <td>{item.roi}%</td>
                <td>
                  <span className={`status-badge status-${item.category.toLowerCase()}`}>
                    {item.category}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="demo-section">
        <h2>🎯 Replacement Priority Matrix</h2>
        <p className="section-subtitle">Weighted scoring: Age (25%), Repair Costs (35%), Demand (25%), Condition (15%)</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Age (years)</th>
              <th>Priority Score</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {replacementPriority.map((item, idx) => (
              <tr key={idx}>
                <td>{item.equipment}</td>
                <td>{item.age}</td>
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <div style={{
                      width: '100px',
                      height: '8px',
                      background: '#e0e0e0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${(item.score / 10) * 100}%`,
                        height: '100%',
                        background: item.score >= 7.5 ? '#f44336' : item.score >= 5 ? '#ff9800' : '#4caf50'
                      }}></div>
                    </div>
                    <span>{item.score}/10</span>
                  </div>
                </td>
                <td>{item.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="demo-section">
        <h2>🔮 Budget Forecast (Next 3 Years)</h2>
        <div className="financial-grid">
          <div className="financial-card">
            <h4>📅 Fiscal Year 2026</h4>
            <div className="financial-row">
              <span className="financial-label">Replacements</span>
              <span className="financial-value">3 items</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Estimated Cost</span>
              <span className="financial-value">€12,500</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Maintenance</span>
              <span className="financial-value">€2,800</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Total Forecast</span>
              <span className="financial-value">€15,300</span>
            </div>
          </div>

          <div className="financial-card">
            <h4>📅 Fiscal Year 2027</h4>
            <div className="financial-row">
              <span className="financial-label">Replacements</span>
              <span className="financial-value">5 items</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Estimated Cost</span>
              <span className="financial-value">€18,200</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Maintenance</span>
              <span className="financial-value">€2,900</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Total Forecast</span>
              <span className="financial-value">€21,100</span>
            </div>
          </div>

          <div className="financial-card">
            <h4>📅 Fiscal Year 2028</h4>
            <div className="financial-row">
              <span className="financial-label">Replacements</span>
              <span className="financial-value">4 items</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Estimated Cost</span>
              <span className="financial-value">€15,800</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Maintenance</span>
              <span className="financial-value">€3,000</span>
            </div>
            <div className="financial-row">
              <span className="financial-label">Total Forecast</span>
              <span className="financial-value">€18,800</span>
            </div>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>📈 Available Reports</h2>
        <div className="report-grid">
          <div className="report-card">
            <div className="report-icon">💰</div>
            <h4>ROI Rankings</h4>
            <p>Equipment ROI sorted by performance for investment decisions</p>
          </div>
          <div className="report-card">
            <div className="report-icon">🎯</div>
            <h4>Replacement Priority</h4>
            <p>Weighted scoring matrix with actionable recommendations</p>
          </div>
          <div className="report-card">
            <div className="report-icon">🔮</div>
            <h4>3-Year Budget Forecast</h4>
            <p>Replacement and maintenance forecasts with inflation</p>
          </div>
          <div className="report-card">
            <div className="report-icon">🔄</div>
            <h4>Sharing Optimizer</h4>
            <p>Find underutilized equipment for cross-dept sharing</p>
          </div>
        </div>
      </section>

      <section className="demo-section use-cases">
        <h2>💡 Common Use Cases</h2>
        <div className="use-case-grid">
          <div className="use-case-card">
            <h4>Budget Planning</h4>
            <p>Use 3-year forecasts to request budget allocations with data-driven justification</p>
          </div>
          <div className="use-case-card">
            <h4>Investment Decisions</h4>
            <p>Compare ROI across equipment to prioritize purchases and avoid duplicates</p>
          </div>
          <div className="use-case-card">
            <h4>Cost Savings</h4>
            <p>Identify cross-department sharing opportunities to save €20,000+ annually</p>
          </div>
        </div>
      </section>
    </div>
  );
}
