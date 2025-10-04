import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import './DemoPortal.css';

export default function ViewOnlyStaffDemo() {
  const [equipment, setEquipment] = useState([]);
  const [bookingStats, setBookingStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      // Load equipment (student view - no sensitive fields)
      const { data: equipmentData } = await supabase
        .from('equipment_student_view')
        .select('*')
        .limit(10);

      setEquipment(equipmentData || []);

      // Load booking statistics (anonymized)
      const { data: statsData } = await supabase
        .from('bookings')
        .select('status')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const stats = (statsData || []).reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {});

      setBookingStats(stats);
    } catch (error) {
      console.error('Error loading demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="demo-loading">Loading View-Only Staff Portal...</div>;

  return (
    <div className="demo-portal view-only-staff-portal">
      <div className="demo-header">
        <div>
          <h1>👀 View-Only Staff Portal</h1>
          <p className="demo-subtitle">Demo Portal - Faculty Equipment Visibility</p>
        </div>
        <Link to="/admin/role-management" className="btn btn-secondary">
          ← Back to Role Management
        </Link>
      </div>

      <div className="demo-info-banner">
        <h3>Role Purpose</h3>
        <p>
          <strong>For:</strong> Teaching faculty who need equipment visibility for course planning<br />
          <strong>Can:</strong> View equipment catalog, check availability, see booking statistics<br />
          <strong>Cannot:</strong> Create bookings, approve bookings, view student personal data, see costs
        </p>
      </div>

      {/* Permissions Summary */}
      <section className="demo-section">
        <h2>✅ Permissions & Access</h2>
        <div className="permissions-grid">
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>View equipment catalog (basic fields)</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>Check equipment availability calendar</span>
          </div>
          <div className="permission-item allowed">
            <span className="permission-icon">✓</span>
            <span>View department booking statistics</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>Create bookings or approve requests</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>View tracking numbers or costs</span>
          </div>
          <div className="permission-item denied">
            <span className="permission-icon">✗</span>
            <span>View student personal data</span>
          </div>
        </div>
      </section>

      {/* Equipment Catalog */}
      <section className="demo-section">
        <h2>📦 Equipment Catalog (Student View)</h2>
        <p className="section-subtitle">Staff see the same basic catalog as students - no sensitive data</p>
        <div className="equipment-grid">
          {equipment.slice(0, 6).map(item => (
            <div key={item.id} className="equipment-card">
              <div className="equipment-image-placeholder">
                {item.image_url ? '📷' : '📦'}
              </div>
              <h4>{item.product_name}</h4>
              <p className="equipment-category">{item.category}</p>
              <span className={`status-badge status-${item.status}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Statistics */}
      <section className="demo-section">
        <h2>📊 Department Booking Statistics (Last 30 Days)</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{bookingStats.pending || 0}</div>
            <div className="stat-label">Pending Requests</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{bookingStats.approved || 0}</div>
            <div className="stat-label">Approved Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{bookingStats.completed || 0}</div>
            <div className="stat-label">Completed Returns</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{equipment.filter(e => e.status === 'available').length}</div>
            <div className="stat-label">Currently Available</div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="demo-section use-cases">
        <h2>💡 Common Use Cases</h2>
        <div className="use-case-grid">
          <div className="use-case-card">
            <h4>Course Planning</h4>
            <p>Faculty planning course schedules can check equipment availability before assigning projects</p>
          </div>
          <div className="use-case-card">
            <h4>Student Advising</h4>
            <p>Lecturers can advise students on equipment options and availability for their projects</p>
          </div>
          <div className="use-case-card">
            <h4>Workshop Coordination</h4>
            <p>Instructors can verify critical equipment is available for class workshops</p>
          </div>
        </div>
      </section>
    </div>
  );
}
