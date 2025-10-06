import { query } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const resetDatabase = async () => {
  console.log('🗑️  Resetting database...\n');

  try {
    // Drop all tables in reverse dependency order
    console.log('📝 Dropping tables...');

    await query('DROP TABLE IF EXISTS strike_history CASCADE');
    await query('DROP TABLE IF EXISTS admin_actions CASCADE');
    await query('DROP TABLE IF EXISTS system_settings CASCADE');
    await query('DROP TABLE IF EXISTS equipment_kits CASCADE');
    await query('DROP TABLE IF EXISTS bookings CASCADE');
    await query('DROP TABLE IF EXISTS equipment_notes CASCADE');
    await query('DROP TABLE IF EXISTS equipment CASCADE');
    await query('DROP TABLE IF EXISTS sub_areas CASCADE');
    await query('DROP TABLE IF EXISTS users CASCADE');

    // Drop trigger function
    await query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE');

    console.log('✅ All tables dropped\n');
    console.log('🎉 Database reset completed!');
    console.log('   Run "npm run db:setup" to recreate tables');
    console.log('   Then run "npm run db:seed" to add demo data\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();
