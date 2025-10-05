import { useState, useEffect } from 'react';
import { demoMode } from '../../mocks/demo-mode.js';

export default function ViewOnlyStaffPortal() {
  const [equipment, setEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    const data = await demoMode.query('equipment');
    setEquipment(data.slice(0, 20)); // Show first 20 items
  };

  const filteredEquipment = equipment.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="portal-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="portal-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#9C27B0', marginBottom: '0.5rem' }}>👁️ View-Only Staff Portal</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Read-only access to equipment catalog. No booking permissions.
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
          <li>✅ Can view equipment catalog</li>
          <li>✅ Can view equipment details and availability</li>
          <li>❌ Cannot create bookings</li>
          <li>❌ Cannot modify equipment</li>
          <li>❌ Cannot access admin features</li>
        </ul>
      </div>

      <div className="search-section" style={{ marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="🔍 Search equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: '2px solid #9C27B0',
            borderRadius: '8px'
          }}
        />
      </div>

      <div className="equipment-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredEquipment.map(item => (
          <div key={item.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            background: 'white'
          }}>
            <img
              src={item.link_to_image || '/placeholder-equipment.png'}
              alt={item.product_name}
              style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}
            />
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.product_name}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>
              {item.description?.substring(0, 100)}...
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem'
            }}>
              <span style={{
                padding: '0.25rem 0.75rem',
                background: item.status === 'available' ? '#4CAF50' : '#FF9800',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}>
                {item.status || 'available'}
              </span>
              <button
                disabled
                style={{
                  padding: '0.5rem 1rem',
                  background: '#ccc',
                  color: '#666',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'not-allowed'
                }}
              >
                🔒 Booking Disabled
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>No equipment found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
