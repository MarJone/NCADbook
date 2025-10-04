// Phase 8 Demo Data - 10 Departments, 150 Users, 150 Equipment
// Aligned with new department structure in departments.js

import { DEPARTMENTS } from '../config/departments.js';

// ===== USERS (150 total) =====
export const phase8Users = [
  // Master Admin (1)
  { id: '1', email: 'master@ncad.ie', password: 'master123', first_name: 'Master', surname: 'Admin', full_name: 'Master Admin', role: 'master_admin', department: 'COMMUNICATION_DESIGN', created_at: '2024-01-01' },

  // Department Admins (13 total - Media has 3 admins)
  { id: '2', email: 'admin.commdesign@ncad.ie', password: 'admin123', first_name: 'Sarah', surname: 'Johnson', full_name: 'Sarah Johnson', role: 'department_admin', managed_department_id: 'sa_comm_design', department: 'COMMUNICATION_DESIGN', created_at: '2024-01-15' },
  { id: '3', email: 'admin.product@ncad.ie', password: 'admin123', first_name: 'Mark', surname: 'Williams', full_name: 'Mark Williams', role: 'department_admin', managed_department_id: 'sa_product', department: 'PRODUCT_DESIGN', created_at: '2024-01-15' },
  { id: '4', email: 'admin.painting@ncad.ie', password: 'admin123', first_name: 'Emma', surname: 'Clarke', full_name: 'Emma Clarke', role: 'department_admin', managed_department_id: 'sa_painting', department: 'PAINTING', created_at: '2024-01-15' },
  { id: '5', email: 'admin.print@ncad.ie', password: 'admin123', first_name: 'Robert', surname: 'Taylor', full_name: 'Robert Taylor', role: 'department_admin', managed_department_id: 'sa_print', department: 'PRINT', created_at: '2024-01-15' },

  // Media Department - 3 Admins (Photography, Video, Physical Computing)
  { id: '6', email: 'admin.media.photo@ncad.ie', password: 'admin123', first_name: 'Lisa', surname: 'O\'Brien', full_name: 'Lisa O\'Brien', role: 'department_admin', managed_department_id: 'sa_media', department: 'MEDIA', media_role: 'Photography Admin', created_at: '2024-01-15' },
  { id: '7', email: 'admin.media.video@ncad.ie', password: 'admin123', first_name: 'David', surname: 'Murphy', full_name: 'David Murphy', role: 'department_admin', managed_department_id: 'sa_media', department: 'MEDIA', media_role: 'Video Studio Admin', created_at: '2024-01-15' },
  { id: '8', email: 'admin.media.physcomp@ncad.ie', password: 'admin123', first_name: 'Jennifer', surname: 'Walsh', full_name: 'Jennifer Walsh', role: 'department_admin', managed_department_id: 'sa_media', department: 'MEDIA', media_role: 'Physical Computing Admin', created_at: '2024-01-15' },

  { id: '9', email: 'admin.sculpture@ncad.ie', password: 'admin123', first_name: 'Thomas', surname: 'Anderson', full_name: 'Thomas Anderson', role: 'department_admin', managed_department_id: 'sa_sculpture', department: 'SCULPTURE_APPLIED_MATERIALS', created_at: '2024-01-15' },
  { id: '10', email: 'admin.education@ncad.ie', password: 'admin123', first_name: 'Patricia', surname: 'Moore', full_name: 'Patricia Moore', role: 'department_admin', managed_department_id: 'sa_education', department: 'EDUCATION', created_at: '2024-01-15' },
  { id: '11', email: 'admin.visualculture@ncad.ie', password: 'admin123', first_name: 'Michael', surname: 'Brown', full_name: 'Michael Brown', role: 'department_admin', managed_department_id: 'sa_visual_culture', department: 'VISUAL_CULTURE', created_at: '2024-01-15' },
  { id: '12', email: 'admin.fy.ground@ncad.ie', password: 'admin123', first_name: 'Helen', surname: 'Ryan', full_name: 'Helen Ryan', role: 'department_admin', managed_department_id: 'sa_fy_ground', department: 'FIRST_YEAR_GROUND_FLOOR', created_at: '2024-01-15' },
  { id: '13', email: 'admin.fy.top@ncad.ie', password: 'admin123', first_name: 'James', surname: 'Kelly', full_name: 'James Kelly', role: 'department_admin', managed_department_id: 'sa_fy_top', department: 'FIRST_YEAR_TOP_FLOOR', created_at: '2024-01-15' },

  // Staff Members (10 total - 1 per department)
  { id: '14', email: 'staff.commdesign@ncad.ie', password: 'staff123', first_name: 'Anna', surname: 'Collins', full_name: 'Anna Collins', role: 'staff', department: 'COMMUNICATION_DESIGN', managed_department_id: 'sa_comm_design', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: true, can_export_data: true, can_request_access: true, email_notifications: true, modified_by: 'admin.commdesign@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '15', email: 'staff.product@ncad.ie', password: 'staff123', first_name: 'Brian', surname: 'Hughes', full_name: 'Brian Hughes', role: 'staff', department: 'PRODUCT_DESIGN', managed_department_id: 'sa_product', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.product@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '16', email: 'staff.painting@ncad.ie', password: 'staff123', first_name: 'Claire', surname: 'Doyle', full_name: 'Claire Doyle', role: 'staff', department: 'PAINTING', managed_department_id: 'sa_painting', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: false, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.painting@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '17', email: 'staff.print@ncad.ie', password: 'staff123', first_name: 'Daniel', surname: 'Quinn', full_name: 'Daniel Quinn', role: 'staff', department: 'PRINT', managed_department_id: 'sa_print', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.print@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '18', email: 'staff.media@ncad.ie', password: 'staff123', first_name: 'Fiona', surname: 'McCarthy', full_name: 'Fiona McCarthy', role: 'staff', department: 'MEDIA', managed_department_id: 'sa_media', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: true, can_export_data: true, can_request_access: true, email_notifications: true, modified_by: 'admin.media.photo@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '19', email: 'staff.sculpture@ncad.ie', password: 'staff123', first_name: 'Gary', surname: 'O\'Connor', full_name: 'Gary O\'Connor', role: 'staff', department: 'SCULPTURE_APPLIED_MATERIALS', managed_department_id: 'sa_sculpture', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: false, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.sculpture@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '20', email: 'staff.education@ncad.ie', password: 'staff123', first_name: 'Hannah', surname: 'Byrne', full_name: 'Hannah Byrne', role: 'staff', department: 'EDUCATION', managed_department_id: 'sa_education', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.education@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '21', email: 'staff.visualculture@ncad.ie', password: 'staff123', first_name: 'Ian', surname: 'Brennan', full_name: 'Ian Brennan', role: 'staff', department: 'VISUAL_CULTURE', managed_department_id: 'sa_visual_culture', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: false, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.visualculture@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '22', email: 'staff.fy.ground@ncad.ie', password: 'staff123', first_name: 'Jane', surname: 'Keegan', full_name: 'Jane Keegan', role: 'staff', department: 'FIRST_YEAR_GROUND_FLOOR', managed_department_id: 'sa_fy_ground', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.fy.ground@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },
  { id: '23', email: 'staff.fy.top@ncad.ie', password: 'staff123', first_name: 'Kevin', surname: 'Dunne', full_name: 'Kevin Dunne', role: 'staff', department: 'FIRST_YEAR_TOP_FLOOR', managed_department_id: 'sa_fy_top', created_at: '2024-02-01', view_permissions: { can_view_catalog: true, can_create_bookings: true, can_cancel_bookings: true, can_view_history: true, can_view_analytics: false, can_export_data: false, can_request_access: true, email_notifications: true, modified_by: 'admin.fy.top@ncad.ie', modified_at: '2024-02-05T14:30:00Z' } },

  // Students (126 total) - Distribution:
  // Communication Design: 40 students (largest department)
  // Product Design: 20 students
  // Painting: 12 students
  // Print: 10 students
  // Media: 25 students
  // Sculpture & Applied Materials: 10 students
  // Education: 5 students
  // Visual Culture: 2 students
  // First Year Ground Floor: 1 student
  // First Year Top Floor: 1 student

  // Communication Design Students (40) - IDs 24-63
  ...Array.from({ length: 40 }, (_, i) => ({
    id: String(24 + i),
    email: `commdesign.student${i + 1}@student.ncad.ie`,
    password: 'student123',
    first_name: `CommDesign`,
    surname: `Student${i + 1}`,
    full_name: `CommDesign Student${i + 1}`,
    role: 'student',
    department: 'COMMUNICATION_DESIGN',
    created_at: '2024-09-01'
  })),

  // Product Design Students (20) - IDs 64-83
  ...Array.from({ length: 20 }, (_, i) => ({
    id: String(64 + i),
    email: `product.student${i + 1}@student.ncad.ie`,
    password: 'student123',
    first_name: `Product`,
    surname: `Student${i + 1}`,
    full_name: `Product Student${i + 1}`,
    role: 'student',
    department: 'PRODUCT_DESIGN',
    created_at: '2024-09-01'
  })),

  // Painting Students (12) - IDs 84-95
  ...Array.from({ length: 12 }, (_, i) => ({
    id: String(84 + i),
    email: `painting.student${i + 1}@student.ncad.ie`,
    password: 'student123',
    first_name: `Painting`,
    surname: `Student${i + 1}`,
    full_name: `Painting Student${i + 1}`,
    role: 'student',
    department: 'PAINTING',
    created_at: '2024-09-01'
  })),

  // Print Students (10) - IDs 96-105
  ...Array.from({ length: 10 }, (_, i) => ({
    id: String(96 + i),
    email: `print.student${i + 1}@student.ncad.ie`,
    password: 'student123',
    first_name: `Print`,
    surname: `Student${i + 1}`,
    full_name: `Print Student${i + 1}`,
    role: 'student',
    department: 'PRINT',
    created_at: '2024-09-01'
  })),

  // Media Students (25) - IDs 106-130
  ...Array.from({ length: 25 }, (_, i) => ({
    id: String(106 + i),
    email: `media.student${i + 1}@student.ncad.ie`,
    password: 'student123',
    first_name: `Media`,
    surname: `Student${i + 1}`,
    full_name: `Media Student${i + 1}`,
    role: 'student',
    department: 'MEDIA',
    created_at: '2024-09-01'
  })),

  // Sculpture & Applied Materials Students (10) - IDs 131-140
  ...Array.from({ length: 10 }, (_, i) => ({
    id: String(131 + i),
    email: `sculpture.student${i + 1}@student.ncad.ie`,
    password: 'student123',
    first_name: `Sculpture`,
    surname: `Student${i + 1}`,
    full_name: `Sculpture Student${i + 1}`,
    role: 'student',
    department: 'SCULPTURE_APPLIED_MATERIALS',
    created_at: '2024-09-01'
  })),

  // Education Students (5) - IDs 141-145
  ...Array.from({ length: 5 }, (_, i) => ({
    id: String(141 + i),
    email: `education.student${i + 1}@student.ncad.ie`,
    password: 'student123',
    first_name: `Education`,
    surname: `Student${i + 1}`,
    full_name: `Education Student${i + 1}`,
    role: 'student',
    department: 'EDUCATION',
    created_at: '2024-09-01'
  })),

  // Visual Culture Students (2) - IDs 146-147
  ...Array.from({ length: 2 }, (_, i) => ({
    id: String(146 + i),
    email: `visualculture.student${i + 1}@student.ncad.ie`,
    password: 'student123',
    first_name: `VisualCulture`,
    surname: `Student${i + 1}`,
    full_name: `VisualCulture Student${i + 1}`,
    role: 'student',
    department: 'VISUAL_CULTURE',
    created_at: '2024-09-01'
  })),

  // First Year Ground Floor Student (1) - ID 148
  { id: '148', email: 'fy.ground.student1@student.ncad.ie', password: 'student123', first_name: 'FYGround', surname: 'Student1', full_name: 'FYGround Student1', role: 'student', department: 'FIRST_YEAR_GROUND_FLOOR', created_at: '2024-09-01' },

  // First Year Top Floor Student (1) - ID 149
  { id: '149', email: 'fy.top.student1@student.ncad.ie', password: 'student123', first_name: 'FYTop', surname: 'Student1', full_name: 'FYTop Student1', role: 'student', department: 'FIRST_YEAR_TOP_FLOOR', created_at: '2024-09-01' },

  // Demo/Test Student - ID 150
  { id: '150', email: 'demo@ncad.ie', password: 'demo123', first_name: 'Demo', surname: 'Student', full_name: 'Demo Student', role: 'student', department: 'COMMUNICATION_DESIGN', created_at: '2024-01-01' },
];

// Total: 150 users (1 master + 13 dept admins + 10 staff + 126 students)

// ===== EQUIPMENT (150 total) =====
// Distribution:
// Communication Design: 40 items (cameras, computers, tablets, printers)
// Product Design: 25 items (3D printers, laptops, tools, VR)
// Painting: 8 items (projectors, cameras)
// Print: 12 items (cameras, scanners, presses)
// Media: 35 items (Photography 15 + Video 15 + Physical Computing 5)
// Sculpture & Applied Materials: 12 items (tools, cameras, safety)
// Education: 5 items (presentation equipment)
// Visual Culture: 3 items (cameras, recorders)
// First Year Ground Floor: 5 items (basic equipment pool)
// First Year Top Floor: 5 items (basic equipment pool)

export const phase8Equipment = [
  // Communication Design Equipment (40 items) - IDs 1-40
  { id: 'eq1', product_name: 'Canon EOS R5', tracking_number: 'CD-CAM-001', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Mirrorless full-frame camera', link_to_image: 'https://example.com/eosr5.jpg', created_at: '2024-01-10' },
  { id: 'eq2', product_name: 'Canon EOS R5', tracking_number: 'CD-CAM-002', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Mirrorless full-frame camera', link_to_image: 'https://example.com/eosr5.jpg', created_at: '2024-01-10' },
  { id: 'eq3', product_name: 'Canon 250D DSLR Kit', tracking_number: 'CD-CAM-003', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'DSLR kit with 18-55mm lens', link_to_image: 'https://example.com/250d.jpg', created_at: '2024-01-10' },
  { id: 'eq4', product_name: 'Canon 250D DSLR Kit', tracking_number: 'CD-CAM-004', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'DSLR kit with 18-55mm lens', link_to_image: 'https://example.com/250d.jpg', created_at: '2024-01-10' },
  { id: 'eq5', product_name: 'Canon 250D DSLR Kit', tracking_number: 'CD-CAM-005', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'DSLR kit with 18-55mm lens', link_to_image: 'https://example.com/250d.jpg', created_at: '2024-01-10' },
  { id: 'eq6', product_name: 'Canon 250D DSLR Kit', tracking_number: 'CD-CAM-006', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'DSLR kit with 18-55mm lens', link_to_image: 'https://example.com/250d.jpg', created_at: '2024-01-10' },
  { id: 'eq7', product_name: 'Canon 250D DSLR Kit', tracking_number: 'CD-CAM-007', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'DSLR kit with 18-55mm lens', link_to_image: 'https://example.com/250d.jpg', created_at: '2024-01-10' },
  { id: 'eq8', product_name: 'Canon 250D DSLR Kit', tracking_number: 'CD-CAM-008', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'DSLR kit with 18-55mm lens', link_to_image: 'https://example.com/250d.jpg', created_at: '2024-01-10' },
  { id: 'eq9', product_name: 'MacBook Pro 16"', tracking_number: 'CD-COMP-001', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Apple Silicon M2 Pro', link_to_image: 'https://example.com/macbookpro.jpg', created_at: '2024-01-10' },
  { id: 'eq10', product_name: 'MacBook Pro 16"', tracking_number: 'CD-COMP-002', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Apple Silicon M2 Pro', link_to_image: 'https://example.com/macbookpro.jpg', created_at: '2024-01-10' },
  { id: 'eq11', product_name: 'MacBook Pro 16"', tracking_number: 'CD-COMP-003', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Apple Silicon M2 Pro', link_to_image: 'https://example.com/macbookpro.jpg', created_at: '2024-01-10' },
  { id: 'eq12', product_name: 'MacBook Pro 16"', tracking_number: 'CD-COMP-004', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Apple Silicon M2 Pro', link_to_image: 'https://example.com/macbookpro.jpg', created_at: '2024-01-10' },
  { id: 'eq13', product_name: 'MacBook Pro 16"', tracking_number: 'CD-COMP-005', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Apple Silicon M2 Pro', link_to_image: 'https://example.com/macbookpro.jpg', created_at: '2024-01-10' },
  { id: 'eq14', product_name: 'Wacom Cintiq Pro 24', tracking_number: 'CD-TAB-001', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Pen display tablet', link_to_image: 'https://example.com/cintiq.jpg', created_at: '2024-01-10' },
  { id: 'eq15', product_name: 'Wacom Cintiq Pro 24', tracking_number: 'CD-TAB-002', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Pen display tablet', link_to_image: 'https://example.com/cintiq.jpg', created_at: '2024-01-10' },
  { id: 'eq16', product_name: 'iPad Pro 12.9" + Apple Pencil', tracking_number: 'CD-TAB-003', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Tablet for illustration', link_to_image: 'https://example.com/ipadpro.jpg', created_at: '2024-01-10' },
  { id: 'eq17', product_name: 'iPad Pro 12.9" + Apple Pencil', tracking_number: 'CD-TAB-004', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Tablet for illustration', link_to_image: 'https://example.com/ipadpro.jpg', created_at: '2024-01-10' },
  { id: 'eq18', product_name: 'iPad Pro 12.9" + Apple Pencil', tracking_number: 'CD-TAB-005', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Tablet for illustration', link_to_image: 'https://example.com/ipadpro.jpg', created_at: '2024-01-10' },
  { id: 'eq19', product_name: 'Epson SureColor P800', tracking_number: 'CD-PRINT-001', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Professional photo printer', link_to_image: 'https://example.com/epsonp800.jpg', created_at: '2024-01-10' },
  { id: 'eq20', product_name: 'Epson SureColor P800', tracking_number: 'CD-PRINT-002', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Professional photo printer', link_to_image: 'https://example.com/epsonp800.jpg', created_at: '2024-01-10' },
  { id: 'eq21', product_name: 'Godox SL-60W LED Light', tracking_number: 'CD-LIGHT-001', category: 'Lighting', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Continuous LED light', link_to_image: 'https://example.com/sl60.jpg', created_at: '2024-01-10' },
  { id: 'eq22', product_name: 'Godox SL-60W LED Light', tracking_number: 'CD-LIGHT-002', category: 'Lighting', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Continuous LED light', link_to_image: 'https://example.com/sl60.jpg', created_at: '2024-01-10' },
  { id: 'eq23', product_name: 'Godox SL-60W LED Light', tracking_number: 'CD-LIGHT-003', category: 'Lighting', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Continuous LED light', link_to_image: 'https://example.com/sl60.jpg', created_at: '2024-01-10' },
  { id: 'eq24', product_name: 'Manfrotto 055 Tripod', tracking_number: 'CD-SUPP-001', category: 'Support', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Professional aluminum tripod', link_to_image: 'https://example.com/manfrotto055.jpg', created_at: '2024-01-10' },
  { id: 'eq25', product_name: 'Manfrotto 055 Tripod', tracking_number: 'CD-SUPP-002', category: 'Support', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Professional aluminum tripod', link_to_image: 'https://example.com/manfrotto055.jpg', created_at: '2024-01-10' },
  { id: 'eq26', product_name: 'Manfrotto 055 Tripod', tracking_number: 'CD-SUPP-003', category: 'Support', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Professional aluminum tripod', link_to_image: 'https://example.com/manfrotto055.jpg', created_at: '2024-01-10' },
  { id: 'eq27', product_name: 'Manfrotto 055 Tripod', tracking_number: 'CD-SUPP-004', category: 'Support', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Professional aluminum tripod', link_to_image: 'https://example.com/manfrotto055.jpg', created_at: '2024-01-10' },
  { id: 'eq28', product_name: 'DJI Ronin-SC Gimbal', tracking_number: 'CD-SUPP-005', category: 'Support', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Handheld stabilizer', link_to_image: 'https://example.com/ronin.jpg', created_at: '2024-01-10' },
  { id: 'eq29', product_name: 'DJI Ronin-SC Gimbal', tracking_number: 'CD-SUPP-006', category: 'Support', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Handheld stabilizer', link_to_image: 'https://example.com/ronin.jpg', created_at: '2024-01-10' },
  { id: 'eq30', product_name: 'Rode VideoMic Pro+', tracking_number: 'CD-AUDIO-001', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'On-camera microphone', link_to_image: 'https://example.com/rodemicpro.jpg', created_at: '2024-01-10' },
  { id: 'eq31', product_name: 'Rode VideoMic Pro+', tracking_number: 'CD-AUDIO-002', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'On-camera microphone', link_to_image: 'https://example.com/rodemicpro.jpg', created_at: '2024-01-10' },
  { id: 'eq32', product_name: 'Zoom H6 Audio Recorder', tracking_number: 'CD-AUDIO-003', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Portable audio recorder', link_to_image: 'https://example.com/zoomh6.jpg', created_at: '2024-01-10' },
  { id: 'eq33', product_name: 'Zoom H6 Audio Recorder', tracking_number: 'CD-AUDIO-004', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Portable audio recorder', link_to_image: 'https://example.com/zoomh6.jpg', created_at: '2024-01-10' },
  { id: 'eq34', product_name: 'Blackmagic Pocket Cinema 4K', tracking_number: 'CD-CAM-009', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Digital film camera', link_to_image: 'https://example.com/bmpcc4k.jpg', created_at: '2024-01-10' },
  { id: 'eq35', product_name: 'Blackmagic Pocket Cinema 4K', tracking_number: 'CD-CAM-010', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Digital film camera', link_to_image: 'https://example.com/bmpcc4k.jpg', created_at: '2024-01-10' },
  { id: 'eq36', product_name: 'Brother P-touch Label Maker', tracking_number: 'CD-MISC-001', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Label printer', link_to_image: 'https://example.com/ptouch.jpg', created_at: '2024-01-10' },
  { id: 'eq37', product_name: 'Epson FastFoto FF-680W Scanner', tracking_number: 'CD-SCAN-001', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'High-speed photo scanner', link_to_image: 'https://example.com/fastfoto.jpg', created_at: '2024-01-10' },
  { id: 'eq38', product_name: 'Epson FastFoto FF-680W Scanner', tracking_number: 'CD-SCAN-002', category: 'Computer', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'High-speed photo scanner', link_to_image: 'https://example.com/fastfoto.jpg', created_at: '2024-01-10' },
  { id: 'eq39', product_name: 'X-Rite ColorChecker Passport', tracking_number: 'CD-COLOR-001', category: 'Camera', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: 'Color calibration tool', link_to_image: 'https://example.com/colorchecker.jpg', created_at: '2024-01-10' },
  { id: 'eq40', product_name: 'Lastolite Reflector Kit', tracking_number: 'CD-LIGHT-004', category: 'Lighting', department: 'COMMUNICATION_DESIGN', sub_area_id: 'sa_comm_design', status: 'available', description: '5-in-1 reflector set', link_to_image: 'https://example.com/lastolite.jpg', created_at: '2024-01-10' },

  // Product Design Equipment (25 items) - IDs 41-65
  { id: 'eq41', product_name: 'Prusa i3 MK3S+ 3D Printer', tracking_number: 'PD-3DP-001', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'FDM 3D printer', link_to_image: 'https://example.com/prusa.jpg', created_at: '2024-01-11' },
  { id: 'eq42', product_name: 'Prusa i3 MK3S+ 3D Printer', tracking_number: 'PD-3DP-002', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'FDM 3D printer', link_to_image: 'https://example.com/prusa.jpg', created_at: '2024-01-11' },
  { id: 'eq43', product_name: 'Prusa i3 MK3S+ 3D Printer', tracking_number: 'PD-3DP-003', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'FDM 3D printer', link_to_image: 'https://example.com/prusa.jpg', created_at: '2024-01-11' },
  { id: 'eq44', product_name: 'Formlabs Form 3+ SLA Printer', tracking_number: 'PD-3DP-004', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Resin 3D printer', link_to_image: 'https://example.com/form3.jpg', created_at: '2024-01-11' },
  { id: 'eq45', product_name: 'Formlabs Form 3+ SLA Printer', tracking_number: 'PD-3DP-005', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Resin 3D printer', link_to_image: 'https://example.com/form3.jpg', created_at: '2024-01-11' },
  { id: 'eq46', product_name: 'Dell XPS 15 Laptop', tracking_number: 'PD-COMP-001', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'High-performance laptop', link_to_image: 'https://example.com/xps15.jpg', created_at: '2024-01-11' },
  { id: 'eq47', product_name: 'Dell XPS 15 Laptop', tracking_number: 'PD-COMP-002', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'High-performance laptop', link_to_image: 'https://example.com/xps15.jpg', created_at: '2024-01-11' },
  { id: 'eq48', product_name: 'Dell XPS 15 Laptop', tracking_number: 'PD-COMP-003', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'High-performance laptop', link_to_image: 'https://example.com/xps15.jpg', created_at: '2024-01-11' },
  { id: 'eq49', product_name: 'Dell XPS 15 Laptop', tracking_number: 'PD-COMP-004', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'High-performance laptop', link_to_image: 'https://example.com/xps15.jpg', created_at: '2024-01-11' },
  { id: 'eq50', product_name: 'Meta Quest 3 VR Headset', tracking_number: 'PD-VR-001', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Virtual reality headset', link_to_image: 'https://example.com/quest3.jpg', created_at: '2024-01-11' },
  { id: 'eq51', product_name: 'Meta Quest 3 VR Headset', tracking_number: 'PD-VR-002', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Virtual reality headset', link_to_image: 'https://example.com/quest3.jpg', created_at: '2024-01-11' },
  { id: 'eq52', product_name: 'Meta Quest 3 VR Headset', tracking_number: 'PD-VR-003', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Virtual reality headset', link_to_image: 'https://example.com/quest3.jpg', created_at: '2024-01-11' },
  { id: 'eq53', product_name: 'Arduino Starter Kit', tracking_number: 'PD-ELEC-001', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Electronics prototyping kit', link_to_image: 'https://example.com/arduino.jpg', created_at: '2024-01-11' },
  { id: 'eq54', product_name: 'Arduino Starter Kit', tracking_number: 'PD-ELEC-002', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Electronics prototyping kit', link_to_image: 'https://example.com/arduino.jpg', created_at: '2024-01-11' },
  { id: 'eq55', product_name: 'Dremel 4300 Rotary Tool', tracking_number: 'PD-TOOL-001', category: 'Support', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Multi-purpose rotary tool', link_to_image: 'https://example.com/dremel.jpg', created_at: '2024-01-11' },
  { id: 'eq56', product_name: 'Dremel 4300 Rotary Tool', tracking_number: 'PD-TOOL-002', category: 'Support', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Multi-purpose rotary tool', link_to_image: 'https://example.com/dremel.jpg', created_at: '2024-01-11' },
  { id: 'eq57', product_name: 'Caliper Digital Measuring Tool', tracking_number: 'PD-MEAS-001', category: 'Support', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Precision measurement', link_to_image: 'https://example.com/caliper.jpg', created_at: '2024-01-11' },
  { id: 'eq58', product_name: 'Hot Glue Gun Set', tracking_number: 'PD-TOOL-003', category: 'Support', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Adhesive tool', link_to_image: 'https://example.com/gluegun.jpg', created_at: '2024-01-11' },
  { id: 'eq59', product_name: 'Canon EOS 90D DSLR', tracking_number: 'PD-CAM-001', category: 'Camera', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Product photography camera', link_to_image: 'https://example.com/eos90d.jpg', created_at: '2024-01-11' },
  { id: 'eq60', product_name: 'Canon EOS 90D DSLR', tracking_number: 'PD-CAM-002', category: 'Camera', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Product photography camera', link_to_image: 'https://example.com/eos90d.jpg', created_at: '2024-01-11' },
  { id: 'eq61', product_name: 'Godox V1 Flash', tracking_number: 'PD-LIGHT-001', category: 'Lighting', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Round head flash', link_to_image: 'https://example.com/v1flash.jpg', created_at: '2024-01-11' },
  { id: 'eq62', product_name: 'Godox V1 Flash', tracking_number: 'PD-LIGHT-002', category: 'Lighting', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Round head flash', link_to_image: 'https://example.com/v1flash.jpg', created_at: '2024-01-11' },
  { id: 'eq63', product_name: 'Manfrotto Tripod', tracking_number: 'PD-SUPP-001', category: 'Support', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Aluminum tripod', link_to_image: 'https://example.com/manfrotto.jpg', created_at: '2024-01-11' },
  { id: 'eq64', product_name: 'Manfrotto Tripod', tracking_number: 'PD-SUPP-002', category: 'Support', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Aluminum tripod', link_to_image: 'https://example.com/manfrotto.jpg', created_at: '2024-01-11' },
  { id: 'eq65', product_name: 'Wacom Intuos Pro Tablet', tracking_number: 'PD-TAB-001', category: 'Computer', department: 'PRODUCT_DESIGN', sub_area_id: 'sa_product', status: 'available', description: 'Drawing tablet', link_to_image: 'https://example.com/wacom.jpg', created_at: '2024-01-11' },

  // NOTE: Continuing with remaining departments (Painting, Print, Media, Sculpture, Education, Visual Culture, First Year) to reach 150 items total
  // This file will be extended in next edit to include all 150 equipment items
];

// Total equipment count will be 150
