/**
 * Phase 8 Feature Data Structures
 * - System Settings (master admin controls)
 * - Equipment Kits (department admin managed bundles)
 * - Cross-Department Requests (staff requests for other departments' equipment)
 */

// ===== SYSTEM SETTINGS =====
export const demoSystemSettings = [
  {
    key: 'cross_department_browsing_enabled',
    value: false,
    description: 'Allow students to browse equipment from other departments',
    modified_by: '1', // master admin
    modified_at: '2024-01-15T10:00:00Z'
  },
  {
    key: 'staff_cross_department_requests_enabled',
    value: true,
    description: 'Allow staff to request equipment from other departments',
    modified_by: '1',
    modified_at: '2024-01-15T10:00:00Z'
  },
  {
    key: 'equipment_kits_enabled',
    value: true,
    description: 'Enable equipment kit functionality for department admins',
    modified_by: '1',
    modified_at: '2024-01-15T10:00:00Z'
  }
];

// ===== EQUIPMENT KITS =====
// Example kits for demonstration
export const demoEquipmentKits = [
  {
    id: 'kit1',
    name: 'Video Production Starter Kit',
    description: 'Complete kit for basic video production - camera, tripod, mic, lighting',
    department_id: 'COMMUNICATION_DESIGN',
    created_by: '2', // Communication Design admin
    created_at: '2024-02-01T14:00:00Z',
    is_active: true,
    equipment_ids: ['eq3', 'eq24', 'eq30', 'eq21'], // Canon 250D + Tripod + Mic + Light
    image_url: 'https://example.com/video-kit.jpg'
  },
  {
    id: 'kit2',
    name: 'Photography Essentials',
    description: 'Essential photography kit - DSLR, tripod, reflector',
    department_id: 'COMMUNICATION_DESIGN',
    created_by: '2',
    created_at: '2024-02-01T14:30:00Z',
    is_active: true,
    equipment_ids: ['eq4', 'eq25', 'eq40'], // Canon 250D + Tripod + Reflector
    image_url: 'https://example.com/photo-kit.jpg'
  },
  {
    id: 'kit3',
    name: 'Illustration Digital Kit',
    description: 'Digital illustration setup - iPad Pro with Apple Pencil',
    department_id: 'COMMUNICATION_DESIGN',
    created_by: '2',
    created_at: '2024-02-01T15:00:00Z',
    is_active: true,
    equipment_ids: ['eq16', 'eq17'], // iPad Pros
    image_url: 'https://example.com/illustration-kit.jpg'
  },
  {
    id: 'kit4',
    name: '3D Printing Starter Kit',
    description: 'Complete 3D printing setup with laptop and printer',
    department_id: 'PRODUCT_DESIGN',
    created_by: '3', // Product Design admin
    created_at: '2024-02-02T10:00:00Z',
    is_active: true,
    equipment_ids: ['eq41', 'eq46'], // Prusa 3D Printer + Dell Laptop
    image_url: 'https://example.com/3d-print-kit.jpg'
  },
  {
    id: 'kit5',
    name: 'VR Development Kit',
    description: 'VR development setup - Quest 3 headset with development laptop',
    department_id: 'PRODUCT_DESIGN',
    created_by: '3',
    created_at: '2024-02-02T10:30:00Z',
    is_active: true,
    equipment_ids: ['eq50', 'eq47'], // Quest 3 + Dell Laptop
    image_url: 'https://example.com/vr-kit.jpg'
  }
];

// ===== CROSS-DEPARTMENT REQUESTS =====
// Example requests for demonstration
export const demoCrossDepartmentRequests = [
  {
    id: 'req1',
    requesting_user_id: '14', // Communication Design staff
    requesting_department_id: 'COMMUNICATION_DESIGN',
    target_department_id: 'MEDIA',
    equipment_type: 'Canon 250D DSLR Kit',
    quantity: 6,
    start_date: '2024-03-15',
    end_date: '2024-03-20',
    justification: 'Running a 5-day video workshop for Fine Art Media students. Need 6 cameras for hands-on practice. Our department only has 2 available during this period.',
    status: 'pending',
    created_at: '2024-02-20T09:00:00Z'
  },
  {
    id: 'req2',
    requesting_user_id: '16', // Painting staff
    requesting_department_id: 'PAINTING',
    target_department_id: 'COMMUNICATION_DESIGN',
    equipment_type: 'iPad Pro 12.9" + Apple Pencil',
    quantity: 3,
    start_date: '2024-03-10',
    end_date: '2024-03-12',
    justification: 'Digital painting workshop. Need tablets for student demonstrations.',
    status: 'approved',
    reviewed_by: '2', // Communication Design admin
    reviewed_at: '2024-02-21T14:30:00Z',
    review_notes: 'Approved. Equipment available for collection on March 10th at 9 AM from Room 204. Please return by 5 PM on March 12th. Contact me at admin.commdesign@ncad.ie if you need setup assistance.',
    created_at: '2024-02-20T11:00:00Z'
  },
  {
    id: 'req3',
    requesting_user_id: '19', // Sculpture staff
    requesting_department_id: 'SCULPTURE_APPLIED_MATERIALS',
    target_department_id: 'PRODUCT_DESIGN',
    equipment_type: 'Prusa i3 MK3S+ 3D Printer',
    quantity: 2,
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    justification: 'Sculpture students need to print mold prototypes for ceramics project.',
    status: 'denied',
    reviewed_by: '3', // Product Design admin
    reviewed_at: '2024-02-21T16:00:00Z',
    review_notes: 'Unfortunately our 3D printers are fully booked for our final year projects during this period. Please try again for a different date or contact Fine Art Media who may have alternative equipment.',
    created_at: '2024-02-20T15:00:00Z'
  },
  {
    id: 'req4',
    requesting_user_id: '18', // Media staff
    requesting_department_id: 'MEDIA',
    target_department_id: 'PRODUCT_DESIGN',
    equipment_type: 'Meta Quest 3 VR Headset',
    quantity: 1,
    start_date: '2024-03-18',
    end_date: '2024-03-22',
    justification: 'VR installation project for photography student. Need headset for viewer interaction testing.',
    status: 'pending',
    created_at: '2024-02-22T10:00:00Z'
  }
];

// ===== KIT BOOKINGS =====
// Track bookings of equipment kits
export const demoKitBookings = [
  {
    id: 'kitbook1',
    kit_id: 'kit1',
    booking_ids: ['book201', 'book202', 'book203', 'book204'], // Individual bookings for each equipment item
    user_id: '24', // Communication Design student
    start_date: '2024-03-05',
    end_date: '2024-03-08',
    status: 'approved',
    created_at: '2024-02-25T11:00:00Z'
  },
  {
    id: 'kitbook2',
    kit_id: 'kit3',
    booking_ids: ['book205', 'book206'],
    user_id: '25', // Communication Design student
    start_date: '2024-03-10',
    end_date: '2024-03-12',
    status: 'pending',
    created_at: '2024-02-26T14:00:00Z'
  }
];

// ===== SUB-AREAS (Updated for new department structure) =====
export const phase8SubAreas = [
  { id: 'sa_comm_design', name: 'Communication Design', school: 'School of Design', created_at: '2024-01-01' },
  { id: 'sa_product', name: 'Product Design', school: 'School of Design', created_at: '2024-01-01' },
  { id: 'sa_painting', name: 'Painting', school: 'School of Fine Art', created_at: '2024-01-01' },
  { id: 'sa_print', name: 'Print', school: 'School of Fine Art', created_at: '2024-01-01' },
  { id: 'sa_media', name: 'Media', school: 'School of Fine Art', created_at: '2024-01-01' },
  { id: 'sa_sculpture', name: 'Sculpture & Applied Materials', school: 'School of Fine Art', created_at: '2024-01-01' },
  { id: 'sa_education', name: 'Education', school: 'School of Education', created_at: '2024-01-01' },
  { id: 'sa_visual_culture', name: 'Visual Culture', school: 'School of Visual Culture', created_at: '2024-01-01' },
  { id: 'sa_fy_ground', name: 'First Year - Ground Floor', school: 'First Year Studies', created_at: '2024-01-01' },
  { id: 'sa_fy_top', name: 'First Year - Top Floor', school: 'First Year Studies', created_at: '2024-01-01' }
];
