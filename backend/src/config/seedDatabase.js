import { query } from './database.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Check if data already exists
    const existingUsers = await query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 0) {
      console.log('⚠️  Database already contains data.');
      console.log('   Run "npm run db:reset" first if you want to start fresh.\n');
      process.exit(0);
    }

    // ========================================
    // 1. SEED DEPARTMENTS (10 NCAD departments)
    // ========================================
    console.log('📝 Seeding departments...');
    const departments = [
      { id: 'mid', name: 'Moving Image Design', school: 'School of Design', parent_department: 'Design' },
      { id: 'gd', name: 'Graphic Design', school: 'School of Design', parent_department: 'Design' },
      { id: 'illus', name: 'Illustration', school: 'School of Visual Culture', parent_department: 'Visual Culture' },
      { id: 'photo', name: 'Photography', school: 'School of Visual Culture', parent_department: 'Visual Culture' },
      { id: 'print', name: 'Printmaking', school: 'School of Fine Art', parent_department: 'Fine Art' },
      { id: 'paint', name: 'Painting', school: 'School of Fine Art', parent_department: 'Fine Art' },
      { id: 'sculp', name: 'Sculpture', school: 'School of Fine Art', parent_department: 'Fine Art' },
      { id: 'textiles', name: 'Textiles', school: 'School of Design', parent_department: 'Design' },
      { id: 'fashion', name: 'Fashion Design', school: 'School of Design', parent_department: 'Design' },
      { id: 'jewel', name: 'Jewellery & Objects', school: 'School of Design', parent_department: 'Design' }
    ];

    for (const dept of departments) {
      await query(`
        INSERT INTO sub_areas (id, name, school, parent_department, description)
        VALUES ($1, $2, $3, $4, $5)
      `, [dept.id, dept.name, dept.school, dept.parent_department, `${dept.name} department at NCAD`]);
    }
    console.log(`✅ Seeded ${departments.length} departments\n`);

    // ========================================
    // 2. SEED USERS
    // ========================================
    console.log('📝 Seeding users...');

    // Hash password for all demo users
    const demoPassword = await bcrypt.hash('demo123', 10);

    // Master Admin (1)
    const masterAdminResult = await query(`
      INSERT INTO users (email, password, first_name, surname, full_name, role, department, admin_permissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      'admin@ncad.ie',
      demoPassword,
      'Sarah',
      'OBrien',
      'Sarah OBrien',
      'master_admin',
      'Administration',
      JSON.stringify({
        all_departments: true,
        csv_import: true,
        analytics: true,
        system_settings: true
      })
    ]);
    const masterAdminId = masterAdminResult.rows[0].id;
    console.log('  ✅ Created Master Admin (admin@ncad.ie)');

    // Department Admins (3)
    const deptAdmins = [
      { email: 'mid.admin@ncad.ie', first_name: 'John', surname: 'Murphy', dept: 'mid' },
      { email: 'gd.admin@ncad.ie', first_name: 'Emma', surname: 'Walsh', dept: 'gd' },
      { email: 'illus.admin@ncad.ie', first_name: 'Liam', surname: 'Kelly', dept: 'illus' }
    ];

    const deptAdminIds = [];
    for (const admin of deptAdmins) {
      const result = await query(`
        INSERT INTO users (email, password, first_name, surname, full_name, role, department, managed_department_id, admin_permissions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [
        admin.email,
        demoPassword,
        admin.first_name,
        admin.surname,
        `${admin.first_name} ${admin.surname}`,
        'department_admin',
        departments.find(d => d.id === admin.dept).name,
        admin.dept,
        JSON.stringify({
          department_id: admin.dept,
          approve_bookings: true,
          manage_equipment: true,
          view_reports: true
        })
      ]);
      deptAdminIds.push(result.rows[0].id);
    }
    console.log(`  ✅ Created ${deptAdmins.length} Department Admins`);

    // Staff Members (5)
    const staff = [
      { email: 'tech.mid@ncad.ie', first_name: 'David', surname: 'Ryan', dept: 'mid' },
      { email: 'tech.gd@ncad.ie', first_name: 'Sinead', surname: 'OConnor', dept: 'gd' },
      { email: 'librarian@ncad.ie', first_name: 'Mary', surname: 'Collins', dept: 'Administration' },
      { email: 'it.support@ncad.ie', first_name: 'Tom', surname: 'Brennan', dept: 'Administration' },
      { email: 'workshop@ncad.ie', first_name: 'Patrick', surname: 'Doyle', dept: 'Administration' }
    ];

    for (const member of staff) {
      await query(`
        INSERT INTO users (email, password, first_name, surname, full_name, role, department, view_permissions)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        member.email,
        demoPassword,
        member.first_name,
        member.surname,
        `${member.first_name} ${member.surname}`,
        'staff',
        member.dept === 'mid' || member.dept === 'gd' ? departments.find(d => d.id === member.dept).name : member.dept,
        JSON.stringify({ view_bookings: true, view_equipment: true })
      ]);
    }
    console.log(`  ✅ Created ${staff.length} Staff members`);

    // Students (20)
    const studentFirstNames = ['Aoife', 'Cian', 'Niamh', 'Oisin', 'Saoirse', 'Fionn', 'Caoimhe', 'Tadhg', 'Roisin', 'Eoin',
                               'Ciara', 'Darragh', 'Aisling', 'Conor', 'Siobhan', 'Sean', 'Mairead', 'Padraig', 'Orla', 'Declan'];
    const studentSurnames = ['McCarthy', 'OSullivan', 'Byrne', 'Lynch', 'Fitzgerald', 'Kennedy', 'Gallagher', 'Doherty', 'Moran', 'Healy'];

    for (let i = 0; i < 20; i++) {
      const firstName = studentFirstNames[i];
      const surname = studentSurnames[i % studentSurnames.length];
      const dept = departments[i % departments.length];

      await query(`
        INSERT INTO users (email, password, first_name, surname, full_name, role, department)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        `${firstName.toLowerCase()}.${surname.toLowerCase().replace("'", "")}@student.ncad.ie`,
        demoPassword,
        firstName,
        surname,
        `${firstName} ${surname}`,
        'student',
        dept.name
      ]);
    }
    console.log(`  ✅ Created 20 Students\n`);

    // ========================================
    // 3. SEED EQUIPMENT (50+ items across departments)
    // ========================================
    console.log('📝 Seeding equipment...');

    const equipmentData = [
      // Moving Image Design Equipment (10 items)
      { name: 'Canon EOS R5', tracking: 'MID-CAM-001', desc: 'Professional mirrorless camera for video production', category: 'Cameras', dept: 'mid' },
      { name: 'Canon EOS R5', tracking: 'MID-CAM-002', desc: 'Professional mirrorless camera for video production', category: 'Cameras', dept: 'mid' },
      { name: 'Sony A7S III', tracking: 'MID-CAM-003', desc: 'Low-light video camera', category: 'Cameras', dept: 'mid' },
      { name: 'DJI Ronin RS3 Gimbal', tracking: 'MID-STAB-001', desc: '3-axis gimbal stabilizer', category: 'Stabilization', dept: 'mid' },
      { name: 'Sennheiser MKH 416 Mic', tracking: 'MID-AUD-001', desc: 'Professional shotgun microphone', category: 'Audio', dept: 'mid' },
      { name: 'Zoom H6 Audio Recorder', tracking: 'MID-AUD-002', desc: '6-track portable audio recorder', category: 'Audio', dept: 'mid' },
      { name: 'Aputure 120D II Light', tracking: 'MID-LIGHT-001', desc: 'LED daylight fixture', category: 'Lighting', dept: 'mid' },
      { name: 'Blackmagic Pocket 6K', tracking: 'MID-CAM-004', desc: 'Cinema camera with 6K sensor', category: 'Cameras', dept: 'mid' },
      { name: 'MacBook Pro M2 (Editing)', tracking: 'MID-COMP-001', desc: 'Video editing workstation', category: 'Computers', dept: 'mid' },
      { name: 'Wacom Cintiq Pro 24', tracking: 'MID-COMP-002', desc: 'Professional pen display', category: 'Computers', dept: 'mid' },

      // Graphic Design Equipment (8 items)
      { name: 'Wacom Intuos Pro Large', tracking: 'GD-TAB-001', desc: 'Professional graphics tablet', category: 'Tablets', dept: 'gd' },
      { name: 'Wacom Intuos Pro Large', tracking: 'GD-TAB-002', desc: 'Professional graphics tablet', category: 'Tablets', dept: 'gd' },
      { name: 'iPad Pro 12.9" + Apple Pencil', tracking: 'GD-TAB-003', desc: 'Portable digital illustration device', category: 'Tablets', dept: 'gd' },
      { name: 'Epson SureColor P800', tracking: 'GD-PRINT-001', desc: 'Professional photo printer', category: 'Printers', dept: 'gd' },
      { name: 'Canon imagePROGRAF PRO-1000', tracking: 'GD-PRINT-002', desc: 'Large format printer', category: 'Printers', dept: 'gd' },
      { name: 'ColorMunki Display', tracking: 'GD-CALIB-001', desc: 'Monitor calibration device', category: 'Calibration', dept: 'gd' },
      { name: 'Letraset Promarker Set (148)', tracking: 'GD-MARK-001', desc: 'Professional marker set', category: 'Drawing', dept: 'gd' },
      { name: 'Rotring Isograph Pen Set', tracking: 'GD-PEN-001', desc: 'Technical drawing pens', category: 'Drawing', dept: 'gd' },

      // Illustration Equipment (7 items)
      { name: 'Huion Kamvas Pro 24', tracking: 'IL-TAB-001', desc: 'Large pen display tablet', category: 'Tablets', dept: 'illus' },
      { name: 'XP-Pen Artist Pro 16', tracking: 'IL-TAB-002', desc: 'Mid-size pen display', category: 'Tablets', dept: 'illus' },
      { name: 'Daler Rowney Watercolor Set', tracking: 'IL-PAINT-001', desc: 'Professional watercolor set', category: 'Paint', dept: 'illus' },
      { name: 'Winsor & Newton Oil Paint Set', tracking: 'IL-PAINT-002', desc: 'Professional oil paint set', category: 'Paint', dept: 'illus' },
      { name: 'Light Box A2 Size', tracking: 'IL-LIGHT-001', desc: 'LED tracing light box', category: 'Lighting', dept: 'illus' },
      { name: 'Epson Perfection V600', tracking: 'IL-SCAN-001', desc: 'High-resolution flatbed scanner', category: 'Scanners', dept: 'illus' },
      { name: 'Easel - H-Frame Adjustable', tracking: 'IL-EASE-001', desc: 'Professional studio easel', category: 'Easels', dept: 'illus' },

      // Photography Equipment (8 items)
      { name: 'Nikon Z9', tracking: 'PHOTO-CAM-001', desc: 'Professional mirrorless camera', category: 'Cameras', dept: 'photo' },
      { name: 'Canon EOS R3', tracking: 'PHOTO-CAM-002', desc: 'Professional sports camera', category: 'Cameras', dept: 'photo' },
      { name: 'Sony FE 24-70mm f/2.8 GM', tracking: 'PHOTO-LENS-001', desc: 'Professional zoom lens', category: 'Lenses', dept: 'photo' },
      { name: 'Canon RF 70-200mm f/2.8', tracking: 'PHOTO-LENS-002', desc: 'Telephoto zoom lens', category: 'Lenses', dept: 'photo' },
      { name: 'Profoto B10 Plus Flash', tracking: 'PHOTO-LIGHT-001', desc: 'Portable studio flash', category: 'Lighting', dept: 'photo' },
      { name: 'Godox AD600 Pro', tracking: 'PHOTO-LIGHT-002', desc: 'Outdoor flash system', category: 'Lighting', dept: 'photo' },
      { name: 'Manfrotto 055 Tripod', tracking: 'PHOTO-TRIP-001', desc: 'Professional tripod with ball head', category: 'Tripods', dept: 'photo' },
      { name: 'Sekonic L-858D Light Meter', tracking: 'PHOTO-METER-001', desc: 'Professional light meter', category: 'Meters', dept: 'photo' },

      // Printmaking Equipment (5 items)
      { name: 'Etching Press 24"', tracking: 'PRINT-PRESS-001', desc: 'Professional etching press', category: 'Presses', dept: 'print' },
      { name: 'Speedball Lino Cutting Set', tracking: 'PRINT-TOOL-001', desc: 'Linocut tools and accessories', category: 'Tools', dept: 'print' },
      { name: 'Heat Press 15x15"', tracking: 'PRINT-HEAT-001', desc: 'Thermal transfer press', category: 'Presses', dept: 'print' },
      { name: 'Screen Printing Frame Set', tracking: 'PRINT-SCREEN-001', desc: '4-frame starter kit', category: 'Screens', dept: 'print' },
      { name: 'Professional Brayer Set', tracking: 'PRINT-BRAY-001', desc: 'Rubber and hard roller set', category: 'Tools', dept: 'print' },

      // Painting Equipment (5 items)
      { name: 'Professional Easel Set', tracking: 'PAINT-EASE-001', desc: 'Studio easel collection', category: 'Easels', dept: 'paint' },
      { name: 'Winsor & Newton Brush Set', tracking: 'PAINT-BRUSH-001', desc: 'Professional oil painting brushes', category: 'Brushes', dept: 'paint' },
      { name: 'Golden Acrylic Paint Set', tracking: 'PAINT-ACRY-001', desc: 'Heavy body acrylics', category: 'Paint', dept: 'paint' },
      { name: 'Palette Knife Collection', tracking: 'PAINT-KNIFE-001', desc: 'Professional palette knives', category: 'Tools', dept: 'paint' },
      { name: 'Canvas Stretcher Bars Kit', tracking: 'PAINT-STRCH-001', desc: 'Various sizes for canvas stretching', category: 'Materials', dept: 'paint' },

      // Sculpture Equipment (5 items)
      { name: 'Angle Grinder Kit', tracking: 'SCULP-TOOL-001', desc: 'Heavy-duty power tool set', category: 'Power Tools', dept: 'sculp' },
      { name: 'MIG Welder 180A', tracking: 'SCULP-WELD-001', desc: 'Professional welding machine', category: 'Welding', dept: 'sculp' },
      { name: 'Clay Modeling Tool Set', tracking: 'SCULP-CLAY-001', desc: 'Professional sculpting tools', category: 'Tools', dept: 'sculp' },
      { name: 'Bandsaw 14" Benchtop', tracking: 'SCULP-SAW-001', desc: 'Wood and soft material cutting', category: 'Power Tools', dept: 'sculp' },
      { name: 'Dremel 4300 Multi-Tool', tracking: 'SCULP-MULTI-001', desc: 'Rotary tool with accessories', category: 'Power Tools', dept: 'sculp' },

      // Textiles Equipment (4 items)
      { name: 'Brother Sewing Machine PR1055X', tracking: 'TEXT-SEW-001', desc: '10-needle embroidery machine', category: 'Sewing', dept: 'textiles' },
      { name: 'Janome Overlocker', tracking: 'TEXT-SEW-002', desc: 'Professional serger', category: 'Sewing', dept: 'textiles' },
      { name: 'Heat Transfer Vinyl Kit', tracking: 'TEXT-VINYL-001', desc: 'Assorted HTV colors', category: 'Materials', dept: 'textiles' },
      { name: 'Fabric Cutting Mat A1', tracking: 'TEXT-CUT-001', desc: 'Self-healing cutting mat', category: 'Tools', dept: 'textiles' }
    ];

    for (const equip of equipmentData) {
      const deptName = departments.find(d => d.id === equip.dept).name;
      await query(`
        INSERT INTO equipment (product_name, tracking_number, description, category, department, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        equip.name,
        equip.tracking,
        equip.desc,
        equip.category,
        deptName,
        'available'
      ]);
    }
    console.log(`✅ Seeded ${equipmentData.length} equipment items\n`);

    // ========================================
    // 4. SEED SYSTEM SETTINGS
    // ========================================
    console.log('📝 Seeding system settings...');
    const settings = [
      { key: 'room_bookings_enabled', value: false, desc: 'Enable/disable room booking functionality' },
      { key: 'cross_dept_browsing_enabled', value: true, desc: 'Allow students to browse other department equipment' },
      { key: 'cross_dept_booking_enabled', value: false, desc: 'Allow students to book other department equipment' },
      { key: 'weekend_bookings_enabled', value: true, desc: 'Allow bookings over weekends' },
      { key: 'automated_overdue_strikes', value: true, desc: 'Automatically issue strikes for overdue returns' }
    ];

    for (const setting of settings) {
      await query(`
        INSERT INTO system_settings (key, value, description, modified_by)
        VALUES ($1, $2, $3, $4)
      `, [setting.key, setting.value, setting.desc, masterAdminId]);
    }
    console.log(`✅ Seeded ${settings.length} system settings\n`);

    // ========================================
    // 5. SEED SAMPLE BOOKINGS
    // ========================================
    console.log('📝 Seeding sample bookings...');

    // Get some student and equipment IDs
    const students = await query(`SELECT id FROM users WHERE role = 'student' LIMIT 5`);
    const equipment = await query(`SELECT id FROM equipment LIMIT 10`);

    // Create a few bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await query(`
      INSERT INTO bookings (user_id, equipment_id, start_date, end_date, purpose, status)
      VALUES
        ($1, $2, $3, $4, 'Final year project filming', 'approved'),
        ($5, $6, $7, $8, 'Portfolio photography session', 'pending'),
        ($9, $10, $11, $12, 'Experimental print series', 'pending')
    `, [
      students.rows[0].id, equipment.rows[0].id, today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0],
      students.rows[1].id, equipment.rows[1].id, tomorrow.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0],
      students.rows[2].id, equipment.rows[2].id, today.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0]
    ]);
    console.log('✅ Seeded 3 sample bookings\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - 10 Departments');
    console.log('   - 29 Users (1 Master Admin, 3 Dept Admins, 5 Staff, 20 Students)');
    console.log(`   - ${equipmentData.length} Equipment items`);
    console.log('   - 5 System settings');
    console.log('   - 3 Sample bookings\n');
    console.log('🔐 Login credentials (all users):');
    console.log('   Password: demo123\n');
    console.log('📧 Sample emails:');
    console.log('   Master Admin: admin@ncad.ie');
    console.log('   Dept Admin: mid.admin@ncad.ie');
    console.log('   Student: aoife.mccarthy@student.ncad.ie\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
