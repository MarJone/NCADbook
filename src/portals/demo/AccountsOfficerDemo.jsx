import { Link } from 'react-router-dom';
import './DemoPortal.css';

export default function AccountsOfficerDemo() {
  // Mock financial data for demo
  const financialData = {
    totalAssetValue: 245600,
    totalDepreciation: 89300,
    currentBookValue: 156300,
    monthlyExpenditure: 3450
  };

  const equipmentSample = [
    { name: 'Canon EOS R5', cost: 4500, depreciation: 1800, bookValue: 2700, utilization: 75 },
    { name: 'Sony A7 III', cost: 3200, depreciation: 1600, bookValue: 1600, utilization: 82 },
    { name: 'MacBook Pro 16"', cost: 2800, depreciation: 1867, bookValue: 933, utilization: 68 }
  ];

  return (
    <div className="demo-portal accounts-officer-portal">
      <div className="demo-header">
        <div>
          <h1>💰 Accounts Officer Portal</h1>
          <p className="demo-subtitle">Demo Portal - Financial Reporting & Budget Analysis</p>
        </div>
        <Link to="/admin/role-management" className="btn btn-secondary">
          ← Back to Role Management
        </Link>
      </div>

      <div className="demo-info-banner">
        <h3>Role Purpose</h3>
        <p>
          <strong>For:</strong> Finance department staff requiring equipment cost data<br />
          <strong>Can:</strong> View costs, generate financial reports, export data, track depreciation<br />
          <strong>Cannot:</strong> Approve bookings, modify equipment, view student personal data
        </p>
      </div>

      <section className="demo-section">
        <h2>✅ Permissions & Access</h2>
        <div className="permissions-grid">
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>View ALL equipment with purchase costs</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Calculate GAAP-compliant depreciation</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Generate financial reports (depreciation, TCO)</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Export financial data (CSV/PDF)</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>Approve bookings or modify records</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>View student personal data or purposes</span>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>📊 Financial Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">€{financialData.totalAssetValue.toLocaleString()}</div>
            <div className="stat-label">Total Asset Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">€{financialData.totalDepreciation.toLocaleString()}</div>
            <div className="stat-label">Accumulated Depreciation</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">€{financialData.currentBookValue.toLocaleString()}</div>
            <div className="stat-label">Current Book Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">€{financialData.monthlyExpenditure.toLocaleString()}</div>
            <div className="stat-label">Monthly Expenditure</div>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>🧾 Sample Equipment Financial Data</h2>
        <p className="section-subtitle">Depreciation calculated using straight-line GAAP method</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Purchase Cost</th>
              <th>Depreciation</th>
              <th>Book Value</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            {equipmentSample.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>€{item.cost.toLocaleString()}</td>
                <td>€{item.depreciation.toLocaleString()}</td>
                <td>€{item.bookValue.toLocaleString()}</td>
                <td>{item.utilization}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="demo-section">
        <h2>📈 Available Reports</h2>
        <div className="report-grid">
          <div className="report-card">
            <div className="report-icon">📉</div>
            <h4>Depreciation Schedule</h4>
            <p>Equipment depreciation by category with current book values</p>
          </div>
          <div className="report-card">
            <div className="report-icon">💵</div>
            <h4>Total Cost of Ownership</h4>
            <p>Purchase + repairs + maintenance costs per equipment</p>
          </div>
          <div className="report-card">
            <div className="report-icon">🔮</div>
            <h4>Budget Forecast (3 Years)</h4>
            <p>Replacement forecasts with inflation adjustments</p>
          </div>
          <div className="report-card">
            <div className="report-icon">📊</div>
            <h4>Balance Sheet</h4>
            <p>Complete asset balance sheet for financial reporting</p>
          </div>
        </div>
      </section>

      <section className="demo-section use-cases">
        <h2>💡 Common Use Cases</h2>
        <div className="use-case-grid">
          <div className="use-case-card">
            <h4>Year-End Reporting</h4>
            <p>Generate depreciation schedules and balance sheets for annual financial statements</p>
          </div>
          <div className="use-case-card">
            <h4>Budget Allocation</h4>
            <p>Track departmental equipment spending against allocated budgets</p>
          </div>
          <div className="use-case-card">
            <h4>Audit Compliance</h4>
            <p>Provide complete audit trail of equipment purchases and disposal dates</p>
          </div>
        </div>
      </section>
    </div>
  );
}
