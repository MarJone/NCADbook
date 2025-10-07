const fs = require('fs');

const demoData = `// Complete demo data for NCADbook system
export const demoUsers = [
  { id: '1', email: 'master@ncad.ie', password: 'master123', first_name: 'Master', surname: 'Admin', full_name: 'Master Admin', role: 'master_admin', department: 'Administration', created_at: '2024-01-01' },
  { id: '2', email: 'admin@ncad.ie', password: 'admin123', first_name: 'Admin', surname: 'User', full_name: 'Admin User', role: 'admin', department: 'Moving Image', created_at: '2024-01-01' },
  { id: '3', email: 'staff@ncad.ie', password: 'staff123', first_name: 'Staff', surname: 'Member', full_name: 'Staff Member', role: 'staff', department: 'Moving Image', created_at: '2024-01-01' },
  { id: '4', email: 'demo@ncad.ie', password: 'demo123', first_name: 'Demo', surname: 'Student', full_name: 'Demo Student', role: 'student', department: 'Moving Image', created_at: '2024-01-01' },
];

export const demoEquipment = [
  { id: 'eq1', product_name: 'Canon EOS R5', tracking_number: 'CAM-R5-001', category: 'Camera', description: 'Professional mirrorless camera with 8K video', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/canon-r5.jpg', requires_justification: true },
  { id: 'eq2', product_name: 'Sony FX3', tracking_number: 'CAM-FX3-001', category: 'Camera', description: 'Cinema Line full-frame camera', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/sony-fx3.jpg', requires_justification: true },
  { id: 'eq3', product_name: 'MacBook Pro 16" M2', tracking_number: 'LAP-MBP-001', category: 'Computer', description: '32GB RAM, 1TB SSD', department: 'Graphic Design', status: 'available', link_to_image: '/images/equipment/macbook.jpg', requires_justification: false },
  { id: 'eq4', product_name: 'DJI Ronin RS 3', tracking_number: 'SUP-RS3-001', category: 'Support', description: 'Camera gimbal stabilizer', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/gimbal.jpg', requires_justification: false },
  { id: 'eq5', product_name: 'Aputure 300d II', tracking_number: 'LIGHT-AP300-001', category: 'Lighting', description: 'LED light', department: 'Moving Image', status: 'available', link_to_image: '/images/equipment/light.jpg', requires_justification: false },
];

export const demoSpaces = [
  { id: 'sp1', name: 'Studio A', capacity: 20, description: 'Main film studio with lighting grid', department: 'Moving Image', equipment_available: 'Green screen, lighting grid', status: 'available', hourly_booking: true },
  { id: 'sp2', name: 'Edit Suite 1', capacity: 4, description: 'Video editing room', department: 'Moving Image', equipment_available: 'Mac Studio, monitors', status: 'available', hourly_booking: true },
];

export const demoBookings = [
  { id: 'bk1', user_id: '4', equipment_id: 'eq1', start_date: '2025-10-05', end_date: '2025-10-08', status: 'pending', purpose: 'Final year film project', created_at: '2025-10-01T10:00:00Z' },
];

export const demoSpaceBookings = [];

export const demoFeatureFlags = [
  { id: 'ff1', name: 'room_booking', enabled: true, description: 'Enable room/space booking for staff', required_role: 'staff' },
  { id: 'ff2', name: 'analytics_export', enabled: true, description: 'Enable analytics export', required_role: 'admin' },
];

export const demoEquipmentNotes = [];
`;

fs.writeFileSync('src/mocks/demo-data.js', demoData);
console.log('Demo data created successfully');
