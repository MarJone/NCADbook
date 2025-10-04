import { Link } from 'react-router-dom';
import './DemoPortal.css';

export default function ITSupportDemo() {
  const equipmentHealth = [
    { name: 'Canon EOS R5', score: 85, status: 'Excellent', openTickets: 0, maintenanceOverdue: 0 },
    { name: 'Sony A7 III', score: 65, status: 'Good', openTickets: 1, maintenanceOverdue: 0 },
    { name: 'MacBook Pro 16"', score: 45, status: 'Fair', openTickets: 2, maintenanceOverdue: 1 }
  ];

  const recentTickets = [
    { equipment: 'Canon EOS R5', issue: 'Lens mount loose', priority: 'High', status: 'In Progress' },
    { equipment: 'Sony A7 III', issue: 'Battery not holding charge', priority: 'Medium', status: 'Open' },
    { equipment: 'MacBook Pro 16"', issue: 'Software update needed', priority: 'Low', status: 'Resolved' }
  ];

  return (
    <div className="demo-portal it-support-portal">
      <div className="demo-header">
        <div>
          <h1>🔧 IT Support Technician Portal</h1>
          <p className="demo-subtitle">Demo Portal - Asset Lifecycle & Help Desk Integration</p>
        </div>
        <Link to="/admin/role-management" className="btn btn-secondary">
          ← Back to Role Management
        </Link>
      </div>

      <div className="demo-info-banner">
        <h3>Role Purpose</h3>
        <p>
          <strong>For:</strong> IT department managing equipment lifecycle<br />
          <strong>Can:</strong> Create tickets, schedule maintenance, track compliance, view technical specs<br />
          <strong>Cannot:</strong> Approve student bookings or view financial cost data
        </p>
      </div>

      <section className="demo-section">
        <h2>✅ Permissions & Access</h2>
        <div className="permissions-grid">
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>View ALL technical data (serial numbers, MAC addresses)</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Create and manage IT help desk tickets</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Schedule preventive maintenance</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Update IT compliance status</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>Approve student bookings</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>View financial cost data (purchase prices)</span>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>🏥 Equipment Health Dashboard</h2>
        <p className="section-subtitle">Health scoring (0-100) based on compliance, tickets, and maintenance status</p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Health Score</th>
              <th>Status</th>
              <th>Open Tickets</th>
              <th>Overdue Maintenance</th>
            </tr>
          </thead>
          <tbody>
            {equipmentHealth.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
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
                        width: `${item.score}%`,
                        height: '100%',
                        background: item.score >= 80 ? '#4caf50' : item.score >= 60 ? '#ff9800' : '#f44336'
                      }}></div>
                    </div>
                    <span>{item.score}/100</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.openTickets}</td>
                <td>{item.maintenanceOverdue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="demo-section">
        <h2>🎫 Recent IT Tickets</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Issue</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentTickets.map((ticket, idx) => (
              <tr key={idx}>
                <td>{ticket.equipment}</td>
                <td>{ticket.issue}</td>
                <td>
                  <span className={`status-badge status-${ticket.priority.toLowerCase()}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>{ticket.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="demo-section">
        <h2>📈 Available Reports</h2>
        <div className="report-grid">
          <div className="report-card">
            <div className="report-icon">🏥</div>
            <h4>Equipment Health Report</h4>
            <p>Complete health scoring with recommended actions</p>
          </div>
          <div className="report-card">
            <div className="report-icon">🎫</div>
            <h4>Ticket Analytics</h4>
            <p>Failure rates, resolution times, recurring issues</p>
          </div>
          <div className="report-card">
            <div className="report-icon">🔧</div>
            <h4>Maintenance Schedule</h4>
            <p>Overdue and upcoming preventive maintenance</p>
          </div>
          <div className="report-card">
            <div className="report-icon">✅</div>
            <h4>Compliance Dashboard</h4>
            <p>IT security compliance status by category</p>
          </div>
        </div>
      </section>

      <section className="demo-section use-cases">
        <h2>💡 Common Use Cases</h2>
        <div className="use-case-grid">
          <div className="use-case-card">
            <h4>Proactive Maintenance</h4>
            <p>Schedule preventive maintenance to reduce emergency repairs by 30%</p>
          </div>
          <div className="use-case-card">
            <h4>Failure Tracking</h4>
            <p>Identify recurring issues and inform replacement decisions with data</p>
          </div>
          <div className="use-case-card">
            <h4>Compliance Audits</h4>
            <p>Track IT security compliance for institutional audit requirements</p>
          </div>
        </div>
      </section>
    </div>
  );
}
