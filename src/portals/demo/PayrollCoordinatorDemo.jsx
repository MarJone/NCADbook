import { Link } from 'react-router-dom';
import './DemoPortal.css';

export default function PayrollCoordinatorDemo() {
  const workloadData = [
    { admin: 'John Smith', dept: 'Product Design', hours: 32.5, efficiency: 'Excellent' },
    { admin: 'Sarah Jones', dept: 'Communication Design', hours: 28.0, efficiency: 'Good' },
    { admin: 'Mike Brown', dept: 'Illustration', hours: 35.5, efficiency: 'Excellent' }
  ];

  const costCenters = [
    { dept: 'Product Design', allocated: 40, actual: 38, variance: -2 },
    { dept: 'Communication Design', allocated: 35, actual: 37, variance: +2 },
    { dept: 'Illustration', allocated: 25, actual: 25, variance: 0 }
  ];

  return (
    <div className="demo-portal payroll-coordinator-portal">
      <div className="demo-header">
        <div>
          <h1>⏱️ Payroll Coordinator Portal</h1>
          <p className="demo-subtitle">Demo Portal - Time Tracking & Cost Center Allocation</p>
        </div>
        <Link to="/admin/role-management" className="btn btn-secondary">
          ← Back to Role Management
        </Link>
      </div>

      <div className="demo-info-banner">
        <h3>Role Purpose</h3>
        <p>
          <strong>For:</strong> HR/Payroll staff tracking admin time allocation<br />
          <strong>Can:</strong> View time tracking data, manage cost centers, generate payroll reports<br />
          <strong>Cannot:</strong> View student bookings, equipment costs, or modify bookings
        </p>
      </div>

      <section className="demo-section">
        <h2>✅ Permissions & Access</h2>
        <div className="permissions-grid">
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>View admin time tracking (anonymized)</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Manage staff cost center allocations</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Generate workload and efficiency reports</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Export timekeeping data for payroll</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>View student personal data or bookings</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>View equipment costs or financial data</span>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>📊 Admin Workload Summary (This Month)</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Admin</th>
              <th>Department</th>
              <th>Hours Logged</th>
              <th>Efficiency Rating</th>
            </tr>
          </thead>
          <tbody>
            {workloadData.map((admin, idx) => (
              <tr key={idx}>
                <td>{admin.admin}</td>
                <td>{admin.dept}</td>
                <td>{admin.hours} hrs</td>
                <td>
                  <span className={`status-badge status-${admin.efficiency.toLowerCase()}`}>
                    {admin.efficiency}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="demo-section">
        <h2>🎯 Cost Center Allocation vs. Actual</h2>
        <p className="section-subtitle">Planned allocation must sum to 100% - system validates automatically</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Allocated %</th>
              <th>Actual %</th>
              <th>Variance</th>
            </tr>
          </thead>
          <tbody>
            {costCenters.map((center, idx) => (
              <tr key={idx}>
                <td>{center.dept}</td>
                <td>{center.allocated}%</td>
                <td>{center.actual}%</td>
                <td className={center.variance === 0 ? '' : center.variance > 0 ? 'text-success' : 'text-danger'}>
                  {center.variance > 0 ? '+' : ''}{center.variance}%
                </td>
              </tr>
            ))}
            <tr style={{fontWeight: 'bold', borderTop: '2px solid var(--border-color)'}}>
              <td>TOTAL</td>
              <td>100%</td>
              <td>100%</td>
              <td>✓</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="demo-section">
        <h2>📈 Available Reports</h2>
        <div className="report-grid">
          <div className="report-card">
            <div className="report-icon">⏰</div>
            <h4>Monthly Timesheet</h4>
            <p>Hours by admin, department, and task category for payroll processing</p>
          </div>
          <div className="report-card">
            <div className="report-icon">💼</div>
            <h4>Cost Center Report</h4>
            <p>Allocation vs. actual with variance analysis for budgeting</p>
          </div>
          <div className="report-card">
            <div className="report-icon">📊</div>
            <h4>Efficiency Metrics</h4>
            <p>Bookings processed per hour for performance reviews</p>
          </div>
          <div className="report-card">
            <div className="report-icon">📑</div>
            <h4>Payroll Export</h4>
            <p>CSV export formatted for payroll system integration</p>
          </div>
        </div>
      </section>

      <section className="demo-section use-cases">
        <h2>💡 Common Use Cases</h2>
        <div className="use-case-grid">
          <div className="use-case-card">
            <h4>Payroll Processing</h4>
            <p>Export monthly time data for accurate departmental cost allocation in payroll system</p>
          </div>
          <div className="use-case-card">
            <h4>Workload Balancing</h4>
            <p>Identify overloaded admins and redistribute work across departments</p>
          </div>
          <div className="use-case-card">
            <h4>Budget Attribution</h4>
            <p>Charge departments proportionally based on actual admin time consumed</p>
          </div>
        </div>
      </section>
    </div>
  );
}
