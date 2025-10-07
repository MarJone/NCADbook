/**
 * NCAD Staff Population Script
 * Populates database with real NCAD staff members from www.ncad.ie
 * Run with: node scripts/populate-staff.js
 */

import bcrypt from 'bcrypt';
import { query } from '../src/config/database.js';

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = 'NCADStaff2025!'; // Temporary password, should be reset

// NCAD Staff Data from website
const staffMembers = [
  // Department Heads / Master Admins
  {
    firstName: 'John Paul',
    surname: 'Dowling',
    email: 'john.dowling@ncad.ie',
    role: 'master_admin',
    department: 'Moving Image Design',
    title: 'Head of Department of Communication Design'
  },
  {
    firstName: 'Sarah',
    surname: 'Glennie',
    email: 'sarah.glennie@ncad.ie',
    role: 'master_admin',
    department: 'Moving Image Design',
    title: 'Director of NCAD'
  },
  {
    firstName: 'Gerry',
    surname: 'McCoy',
    email: 'gerry.mccoy@ncad.ie',
    role: 'master_admin',
    department: 'Moving Image Design',
    title: 'Head of Corporate Services/Registrar'
  },
  {
    firstName: 'Siún',
    surname: 'Hanrahan',
    email: 'siun.hanrahan@ncad.ie',
    role: 'master_admin',
    department: 'Moving Image Design',
    title: 'Head of Academic Affairs'
  },

  // Graphic Design Department
  {
    firstName: 'Aoife',
    surname: 'McInerney',
    email: 'aoife.mcinerney@ncad.ie',
    role: 'department_admin',
    department: 'Graphic Design',
    title: 'Programme Leader BA Graphic Design'
  },
  {
    firstName: 'Ed',
    surname: 'McGinley',
    email: 'ed.mcginley@ncad.ie',
    role: 'staff',
    department: 'Graphic Design',
    title: 'Lecturer in Graphic Design and Moving Image'
  },
  {
    firstName: 'Stephanie',
    surname: 'Connolly',
    email: 'stephanie.connolly@ncad.ie',
    role: 'staff',
    department: 'Graphic Design',
    title: 'Part-Time Lecturer'
  },
  {
    firstName: 'Jamie',
    surname: 'Murphy',
    email: 'jamie.murphy@ncad.ie',
    role: 'staff',
    department: 'Graphic Design',
    title: 'Technical Assistant in Communication Design'
  },
  {
    firstName: 'Fiona',
    surname: 'Hodge',
    email: 'fiona.hodge@ncad.ie',
    role: 'staff',
    department: 'Graphic Design',
    title: 'Communication Design Secretary'
  },
  {
    firstName: 'David',
    surname: 'Bramley',
    email: 'david.bramley@ncad.ie',
    role: 'staff',
    department: 'Graphic Design',
    title: 'Faculty and Product Design Administrator'
  },

  // Moving Image Design Department
  {
    firstName: 'David',
    surname: 'Timmons',
    email: 'david.timmons@ncad.ie',
    role: 'staff',
    department: 'Moving Image Design',
    title: 'Lecturer in Moving Image Design'
  },

  // Illustration Department
  {
    firstName: 'Brendon',
    surname: 'Deacy',
    email: 'brendon.deacy@ncad.ie',
    role: 'department_admin',
    department: 'Illustration',
    title: 'Programme Leader BA Illustration'
  },
  {
    firstName: 'John',
    surname: 'Slade',
    email: 'john.slade@ncad.ie',
    role: 'staff',
    department: 'Illustration',
    title: 'Lecturer in Illustration'
  }
];

async function populateStaff() {
  console.log('🚀 Starting NCAD Staff Population Script');
  console.log('==========================================\n');

  try {
    // Step 1: Remove existing test staff data (keep students)
    console.log('📋 Step 1: Removing test staff accounts...');
    const deleteResult = await query(`
      DELETE FROM users
      WHERE role IN ('staff', 'department_admin', 'master_admin')
      AND email NOT LIKE '%@ncad.ie'
    `);
    console.log(`✅ Removed ${deleteResult.rowCount} test staff accounts\n`);

    // Step 2: Hash the default password
    console.log('🔐 Step 2: Hashing default password...');
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log('✅ Password hashed successfully\n');

    // Step 3: Insert staff members
    console.log('👥 Step 3: Inserting NCAD staff members...');
    let successCount = 0;
    let errorCount = 0;

    for (const staff of staffMembers) {
      try {
        const fullName = `${staff.firstName} ${staff.surname}`;

        await query(`
          INSERT INTO users (
            email,
            password,
            first_name,
            surname,
            full_name,
            role,
            department,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          ON CONFLICT (email) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            surname = EXCLUDED.surname,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            department = EXCLUDED.department
        `, [
          staff.email,
          hashedPassword,
          staff.firstName,
          staff.surname,
          fullName,
          staff.role,
          staff.department
        ]);

        console.log(`  ✓ ${fullName} (${staff.role}) - ${staff.department}`);
        successCount++;
      } catch (error) {
        console.error(`  ✗ Failed to insert ${staff.firstName} ${staff.surname}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n✅ Successfully inserted ${successCount} staff members`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} errors occurred`);
    }

    // Step 4: Display summary
    console.log('\n📊 Summary by Department:');
    const summary = await query(`
      SELECT
        department,
        role,
        COUNT(*) as count
      FROM users
      WHERE role IN ('staff', 'department_admin', 'master_admin')
      GROUP BY department, role
      ORDER BY department, role DESC
    `);

    summary.rows.forEach(row => {
      console.log(`  ${row.department} - ${row.role}: ${row.count}`);
    });

    console.log('\n📊 Summary by Role:');
    const roleSummary = await query(`
      SELECT
        role,
        COUNT(*) as count
      FROM users
      WHERE role IN ('staff', 'department_admin', 'master_admin')
      GROUP BY role
      ORDER BY
        CASE role
          WHEN 'master_admin' THEN 1
          WHEN 'department_admin' THEN 2
          WHEN 'staff' THEN 3
        END
    `);

    roleSummary.rows.forEach(row => {
      console.log(`  ${row.role}: ${row.count}`);
    });

    console.log('\n==========================================');
    console.log('✅ NCAD Staff Population Complete!');
    console.log('==========================================\n');
    console.log(`📝 Default Password: ${DEFAULT_PASSWORD}`);
    console.log('⚠️  All staff should change their password on first login\n');

  } catch (error) {
    console.error('❌ Error populating staff:', error);
    throw error;
  }
}

// Run the script
populateStaff()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
