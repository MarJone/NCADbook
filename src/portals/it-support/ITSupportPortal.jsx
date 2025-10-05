import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode.js';

export default function ITSupportPortal() {
  const [equipment, setEquipment] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadData();
    generateSystemLogs();
  }, []);

  const loadData = async () => {
    const equipmentData = await demoMode.query('equipment');
    setEquipment(equipmentData.slice(0, 10));
  };

  const generateSystemLogs = () => {
    const logEntries = [
      { time: '2024-03-15 14:23:12', type: 'INFO', user: 'commdesign.student1@student.ncad.ie', action: 'Equipment booking created', details: 'Canon EOS R5' },
      { time: '2024-03-15 14:18:45', type: 'WARNING', user: 'admin.media@ncad.ie', action: 'Equipment status changed', details: 'Sony A7IV → Maintenance' },
      { time: '2024-03-15 13:55:23', type: 'INFO', user: 'staff.product@ncad.ie', action: 'User login successful', details: 'Staff portal access' },
      { time: '2024-03-15 13:42:09', type: 'ERROR', user: 'media.student5@student.ncad.ie', action: 'Booking conflict detected', details: 'MacBook Pro M3 already booked' },
      { time: '2024-03-15 13:30:17', type: 'INFO', user: 'admin.commdesign@ncad.ie', action: 'Equipment added', details: 'New DSLR camera added to catalog' },
      { time: '2024-03-15 12:15:33', type: 'WARNING', user: 'system', action: 'Scheduled maintenance', details: 'Database backup completed' },
    ];
    setLogs(logEntries);
  };

  const equipmentStats = {
    total: 150,
    available: 98,
    booked: 42,
    maintenance: 8,
    outOfService: 2
  };

  return (
    <div className="portal-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="portal-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#9C27B0', marginBottom: '0.5rem' }}>🔧 IT Support Portal</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Equipment management, system logs, and technical administration
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
          <li>✅ Manage equipment (add, edit, set maintenance status)</li>
          <li>✅ View system logs and audit trails</li>
          <li>✅ Monitor booking conflicts and errors</li>
          <li>✅ Access technical diagnostics</li>
          <li>❌ Cannot reset user passwords (security restriction)</li>
        </ul>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Equipment Status Overview</h2>
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#2196F3', padding: '1.5rem', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Total Equipment</p>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{equipmentStats.total}</p>
        </div>
        <div style={{ background: '#4CAF50', padding: '1.5rem', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Available</p>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{equipmentStats.available}</p>
        </div>
        <div style={{ background: '#FF9800', padding: '1.5rem', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Booked</p>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{equipmentStats.booked}</p>
        </div>
        <div style={{ background: '#9C27B0', padding: '1.5rem', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Maintenance</p>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{equipmentStats.maintenance}</p>
        </div>
        <div style={{ background: '#f44336', padding: '1.5rem', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Out of Service</p>
          <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold' }}>{equipmentStats.outOfService}</p>
        </div>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>System Activity Logs</h2>
      <div style={{
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '2rem'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#9C27B0', color: 'white' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Timestamp</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>User</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Action</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem', color: '#666' }}>{log.time}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: log.type === 'ERROR' ? '#f44336' : log.type === 'WARNING' ? '#FF9800' : '#4CAF50',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    {log.type}
                  </span>
                </td>
                <td style={{ padding: '0.75rem' }}>{log.user}</td>
                <td style={{ padding: '0.75rem' }}>{log.action}</td>
                <td style={{ padding: '0.75rem', color: '#666' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
          📊 Export System Logs
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
          🔧 Run Diagnostics
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
          ⚙️ System Settings
        </button>
      </div>
    </div>
  );
}
