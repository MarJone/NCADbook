import { useState } from 'react';

export default function PayrollCoordinatorPortal() {
  const staffAllocations = [
    { id: 1, name: 'Sarah Johnson', role: 'Department Admin', dept: 'Communication Design', hours: 35, costCenter: 'CC-001', allocation: '100%' },
    { id: 2, name: 'Mark Williams', role: 'Department Admin', dept: 'Product Design', hours: 35, costCenter: 'CC-002', allocation: '100%' },
    { id: 3, name: 'Anna Collins', role: 'Staff', dept: 'Communication Design', hours: 20, costCenter: 'CC-001', allocation: '60%' },
    { id: 4, name: 'Brian Hughes', role: 'Staff', dept: 'Product Design', hours: 15, costCenter: 'CC-002', allocation: '40%' },
    { id: 5, name: 'Lisa O\'Brien', role: 'Department Admin', dept: 'Media', hours: 28, costCenter: 'CC-003', allocation: '80%' },
    { id: 6, name: 'Fiona McCarthy', role: 'Staff', dept: 'Media', hours: 25, costCenter: 'CC-003', allocation: '70%' },
  ];

  const costCenters = [
    { code: 'CC-001', name: 'Communication Design', budget: 125000, allocated: 118500, staff: 5 },
    { code: 'CC-002', name: 'Product Design', budget: 95000, allocated: 87200, staff: 4 },
    { code: 'CC-003', name: 'Media Department', budget: 140000, allocated: 132000, staff: 6 },
    { code: 'CC-004', name: 'Sculpture & Applied Materials', budget: 78000, allocated: 71500, staff: 3 },
  ];

  return (
    <div className="portal-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="portal-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#9C27B0', marginBottom: '0.5rem' }}>📊 Payroll Coordinator Portal</h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Staff cost center allocations and payroll data management
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
          <li>✅ View staff cost center allocations</li>
          <li>✅ Export payroll data for finance system</li>
          <li>✅ Track staff hours across departments</li>
          <li>✅ Generate allocation reports</li>
          <li>❌ Cannot modify cost center budgets</li>
        </ul>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Cost Center Overview</h2>
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
              <th style={{ padding: '1rem', textAlign: 'left' }}>Cost Center</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Budget</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Allocated</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Remaining</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Staff Count</th>
            </tr>
          </thead>
          <tbody>
            {costCenters.map((cc) => {
              const remaining = cc.budget - cc.allocated;
              const percentUsed = (cc.allocated / cc.budget * 100).toFixed(1);
              return (
                <tr key={cc.code} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{cc.code}</td>
                  <td style={{ padding: '1rem' }}>{cc.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>€{cc.budget.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>€{cc.allocated.toLocaleString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', color: remaining > 0 ? '#4CAF50' : '#f44336' }}>
                    €{remaining.toLocaleString()} ({percentUsed}%)
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{cc.staff}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>Staff Allocations</h2>
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
              <th style={{ padding: '1rem', textAlign: 'left' }}>Staff Member</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Department</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Hours/Week</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Cost Center</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Allocation %</th>
            </tr>
          </thead>
          <tbody>
            {staffAllocations.map((staff) => (
              <tr key={staff.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{staff.name}</td>
                <td style={{ padding: '1rem' }}>{staff.role}</td>
                <td style={{ padding: '1rem' }}>{staff.dept}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{staff.hours}h</td>
                <td style={{ padding: '1rem' }}>{staff.costCenter}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: '#4CAF50',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.85rem'
                  }}>
                    {staff.allocation}
                  </span>
                </td>
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
          📊 Export Payroll Report
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
          📥 Export Allocation Data (CSV)
        </button>
      </div>
    </div>
  );
}
