import { Link } from 'react-router-dom';
import PayrollCoordinatorPortal from '../payroll-coordinator/PayrollCoordinatorPortal';
import './DemoPortal.css';

export default function PayrollCoordinatorDemo() {
  return (
    <div className="demo-portal-wrapper">
      <div className="demo-header" style={{ padding: '1rem 2rem', background: '#9C27B0', color: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>Payroll Coordinator Role Demo</h2>
            <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9 }}>Staff cost center allocations</p>
          </div>
          <Link to="/admin/role-management" className="btn btn-secondary" style={{
            background: 'white',
            color: '#9C27B0',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            textDecoration: 'none'
          }}>
            ← Back to Role Management
          </Link>
        </div>
      </div>
      <PayrollCoordinatorPortal />
    </div>
  );
}
