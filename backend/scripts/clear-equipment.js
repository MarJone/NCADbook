/**
 * Clear All Equipment Script
 * Removes all equipment from the database for a clean start
 * Run with: node scripts/clear-equipment.js
 */

import { query } from '../src/config/database.js';

async function clearEquipment() {
  console.log('🗑️  Starting Equipment Clear Script');
  console.log('==========================================\n');

  try {
    // Step 1: Check current equipment count
    console.log('📊 Step 1: Checking current equipment...');
    const countResult = await query('SELECT COUNT(*) FROM equipment');
    const currentCount = parseInt(countResult.rows[0].count);
    console.log(`✅ Found ${currentCount} equipment items in database\n`);

    if (currentCount === 0) {
      console.log('ℹ️  No equipment to clear. Database is already empty.\n');
      return;
    }

    // Step 2: Check for active bookings
    console.log('📋 Step 2: Checking for active bookings...');
    const activeBookingsResult = await query(`
      SELECT COUNT(*) FROM bookings
      WHERE status IN ('pending', 'approved')
      AND end_date >= CURRENT_DATE
    `);
    const activeBookings = parseInt(activeBookingsResult.rows[0].count);

    if (activeBookings > 0) {
      console.log(`⚠️  Warning: ${activeBookings} active bookings found`);
      console.log('   These bookings will become orphaned after equipment deletion.\n');
    } else {
      console.log('✅ No active bookings found\n');
    }

    // Step 3: Delete bookings (foreign key constraint)
    console.log('🗑️  Step 3: Deleting all bookings...');
    const bookingsDeleteResult = await query('DELETE FROM bookings');
    console.log(`✅ Deleted ${bookingsDeleteResult.rowCount} bookings\n`);

    // Step 4: Delete equipment notes (foreign key constraint)
    console.log('🗑️  Step 4: Deleting equipment notes...');
    const notesResult = await query('DELETE FROM equipment_notes');
    console.log(`✅ Deleted ${notesResult.rowCount} equipment notes\n`);

    // Step 5: Delete equipment
    console.log('🗑️  Step 5: Deleting all equipment...');
    const deleteResult = await query('DELETE FROM equipment');
    console.log(`✅ Deleted ${deleteResult.rowCount} equipment items\n`);

    // Step 6: Reset sequence (auto-increment ID)
    console.log('🔄 Step 6: Resetting equipment ID sequence...');
    await query('ALTER SEQUENCE equipment_id_seq RESTART WITH 1');
    console.log('✅ Sequence reset to 1\n');

    // Step 7: Verify deletion
    console.log('✔️  Step 7: Verifying deletion...');
    const verifyResult = await query('SELECT COUNT(*) FROM equipment');
    const finalCount = parseInt(verifyResult.rows[0].count);

    if (finalCount === 0) {
      console.log('✅ Verification passed: 0 equipment items remain\n');
    } else {
      console.log(`❌ Verification failed: ${finalCount} items still exist\n`);
      throw new Error('Equipment deletion incomplete');
    }

    console.log('==========================================');
    console.log('✅ Equipment Clear Complete!');
    console.log('==========================================\n');
    console.log('📊 Summary:');
    console.log(`   Bookings deleted: ${bookingsDeleteResult.rowCount}`);
    console.log(`   Equipment deleted: ${deleteResult.rowCount}`);
    console.log(`   Notes deleted: ${notesResult.rowCount}`);
    console.log('\n🎯 Database is ready for fresh equipment import!\n');

  } catch (error) {
    console.error('❌ Error clearing equipment:', error);
    throw error;
  }
}

// Run the script
clearEquipment()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
