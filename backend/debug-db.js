// Simple database check script
// Run with: node debug-db.js

import pg from 'pg';
const { Client } = pg;

const client = new Client({
  user: 'ncadbook_user',
  password: 'ncad2024secure',
  host: 'localhost',
  port: 5432,
  database: 'ncadbook_db'
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check equipment count
    const countResult = await client.query('SELECT COUNT(*) FROM equipment');
    console.log(`📊 Total Equipment: ${countResult.rows[0].count}`);

    // Check equipment by department
    const deptResult = await client.query(`
      SELECT department, COUNT(*) as count
      FROM equipment
      GROUP BY department
      ORDER BY count DESC
    `);

    console.log('\n📂 Equipment by Department:');
    deptResult.rows.forEach(row => {
      console.log(`   ${row.department}: ${row.count}`);
    });

    // Check sample equipment
    const sampleResult = await client.query(`
      SELECT product_name, department, status
      FROM equipment
      LIMIT 5
    `);

    console.log('\n📦 Sample Equipment:');
    sampleResult.rows.forEach(row => {
      console.log(`   - ${row.product_name} (${row.department}) [${row.status}]`);
    });

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
