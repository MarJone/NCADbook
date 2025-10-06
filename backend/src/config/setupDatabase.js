import { query } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  console.log('🚀 Starting database setup...\n');

  try {
    // Create Users Table
    console.log('📝 Creating users table...');
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        full_name VARCHAR(200) NOT NULL,
        role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'staff', 'department_admin', 'master_admin', 'view_only_staff', 'accounts_officer', 'payroll_coordinator', 'it_support', 'budget_manager')),
        department VARCHAR(100) NOT NULL,
        managed_department_id VARCHAR(50),
        admin_permissions JSONB DEFAULT '{}',
        view_permissions JSONB DEFAULT '{}',
        strike_count INTEGER DEFAULT 0 CHECK (strike_count >= 0 AND strike_count <= 3),
        blacklist_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
      );
    `);

    // Create indexes for users table
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    await query('CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);');
    console.log('✅ Users table created\n');

    // Create Sub Areas (Departments) Table
    console.log('📝 Creating sub_areas table...');
    await query(`
      CREATE TABLE IF NOT EXISTS sub_areas (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        school VARCHAR(200),
        description TEXT,
        parent_department VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Sub areas table created\n');

    // Create Equipment Table
    console.log('📝 Creating equipment table...');
    await query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        product_name VARCHAR(200) NOT NULL,
        tracking_number VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        category VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        status VARCHAR(30) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'maintenance', 'out_of_service')),
        qr_code VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category);');
    await query('CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_equipment_department ON equipment(department);');
    await query('CREATE INDEX IF NOT EXISTS idx_equipment_tracking ON equipment(tracking_number);');
    console.log('✅ Equipment table created\n');

    // Create Equipment Notes Table
    console.log('📝 Creating equipment_notes table...');
    await query(`
      CREATE TABLE IF NOT EXISTS equipment_notes (
        id SERIAL PRIMARY KEY,
        equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
        note_type VARCHAR(30) NOT NULL CHECK (note_type IN ('maintenance', 'damage', 'usage', 'general')),
        note_content TEXT NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_notes_equipment ON equipment_notes(equipment_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_notes_type ON equipment_notes(note_type);');
    console.log('✅ Equipment notes table created\n');

    // Create Bookings Table
    console.log('📝 Creating bookings table...');
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        equipment_id INTEGER NOT NULL REFERENCES equipment(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        purpose TEXT,
        status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'returned', 'overdue')),
        approved_by INTEGER REFERENCES users(id),
        approved_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CHECK (end_date >= start_date)
      );
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_bookings_equipment ON bookings(equipment_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);');
    console.log('✅ Bookings table created\n');

    // Create Equipment Kits Table
    console.log('📝 Creating equipment_kits table...');
    await query(`
      CREATE TABLE IF NOT EXISTS equipment_kits (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        description TEXT,
        department_id VARCHAR(100) NOT NULL,
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        equipment_ids INTEGER[] NOT NULL,
        image_url VARCHAR(500)
      );
    `);
    console.log('✅ Equipment kits table created\n');

    // Create System Settings Table
    console.log('📝 Creating system_settings table...');
    await query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value BOOLEAN NOT NULL,
        description TEXT,
        modified_by INTEGER REFERENCES users(id),
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ System settings table created\n');

    // Create Admin Actions (Audit Trail) Table
    console.log('📝 Creating admin_actions table...');
    await query(`
      CREATE TABLE IF NOT EXISTS admin_actions (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES users(id),
        action_type VARCHAR(50) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id INTEGER,
        details JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at);');
    console.log('✅ Admin actions table created\n');

    // Create Strike History Table
    console.log('📝 Creating strike_history table...');
    await query(`
      CREATE TABLE IF NOT EXISTS strike_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        booking_id INTEGER REFERENCES bookings(id),
        strike_number INTEGER NOT NULL,
        reason TEXT NOT NULL,
        issued_by INTEGER NOT NULL REFERENCES users(id),
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_strike_history_user ON strike_history(user_id);');
    console.log('✅ Strike history table created\n');

    // Create updated_at trigger function
    console.log('📝 Creating trigger function...');
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply trigger to equipment table
    await query(`
      DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
      CREATE TRIGGER update_equipment_updated_at
        BEFORE UPDATE ON equipment
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Apply trigger to equipment_notes table
    await query(`
      DROP TRIGGER IF EXISTS update_equipment_notes_updated_at ON equipment_notes;
      CREATE TRIGGER update_equipment_notes_updated_at
        BEFORE UPDATE ON equipment_notes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Triggers created\n');

    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase();
