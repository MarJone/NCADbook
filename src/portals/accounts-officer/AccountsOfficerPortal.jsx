import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode.js';

export default function AccountsOfficerPortal() {
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    const equipmentData = await demoMode.query('equipment');
    const bookingsData = await demoMode.query('bookings');

    setEquipment(equipmentData.slice(0, 15));
    setBookings(bookingsData.slice(0, 10));

    // Calculate mock total cost
    const total = equipmentData.reduce((sum, item) => sum + (parseFloat(item.purchase_price) || 0), 0);
    setTotalCost(total);
  };

  const departmentCosts = [
    { dept: 'Communication Design', cost: 45230, bookings: 156 },
    { dept: 'Product Design', cost: 32100, bookings: 89 },
    { dept: 'Media', cost: 58900, bookings: 203 },
    { dept: 'Painting', cost: 12400, bookings: 34 },
    { dept: 'Sculpture', cost: 28700, bookings: 67 }
  ];

  return (
    <div className="portal-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="portal-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#9C27B0', marginBottom: '0.5rem' }}>💰 Accounts Officer Portal</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Financial overview, equipment costs, and department budgets
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
          <li>✅ View equipment costs and purchase prices</li>
          <li>✅ Export financial reports (CSV/PDF)</li>
          <li>✅ Access all department budgets</li>
          <li>✅ View booking-related costs</li>
          <li>❌ Cannot modify equipment or bookings</li>
        </ul>
      </div>

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
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Total Equipment Value</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>€{totalCost.toLocaleString()}</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '1.5rem',
          borderRadius: '8px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>YTD Bookings</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>549</p>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '1.5rem',
          borderRadius: '8px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Avg Cost per Booking</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>€{(totalCost / 549).toFixed(2)}</p>
        </div>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Department Cost Breakdown</h2>
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
              <th style={{ padding: '1rem', textAlign: 'right' }}>Equipment Value</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Total Bookings</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Avg per Booking</th>
            </tr>
          </thead>
          <tbody>
            {departmentCosts.map((dept, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>{dept.dept}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>€{dept.cost.toLocaleString()}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{dept.bookings}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>€{(dept.cost / dept.bookings).toFixed(2)}</td>
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
          📊 Export Financial Report (PDF)
        </button>
        <button style={{
          padding: '0.75rem 2rem',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          📥 Export to Excel (CSV)
        </button>
      </div>
    </div>
  );
}
