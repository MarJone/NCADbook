-- Migration 008: Barcode Verification System
-- Adds equipment accessories and checkout/return verification tracking

-- ============================================
-- 1. EQUIPMENT ACCESSORIES TABLE
-- Stores bundled items that come with equipment (SD cards, batteries, lenses, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_accessories (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  accessory_name VARCHAR(200) NOT NULL,
  accessory_description TEXT,
  is_required BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by equipment
CREATE INDEX IF NOT EXISTS idx_accessories_equipment ON equipment_accessories(equipment_id);
CREATE INDEX IF NOT EXISTS idx_accessories_sort ON equipment_accessories(equipment_id, sort_order);

-- ============================================
-- 2. BOOKING VERIFICATIONS TABLE
-- Records checkout and return verification events with checklists
-- ============================================
CREATE TABLE IF NOT EXISTS booking_verifications (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  verification_type VARCHAR(20) NOT NULL CHECK (verification_type IN ('checkout', 'return')),
  verified_by INTEGER NOT NULL REFERENCES users(id),
  scanned_code VARCHAR(100),

  -- Overall condition assessment
  condition_rating VARCHAR(20) DEFAULT 'normal' CHECK (condition_rating IN ('normal', 'minor_damage', 'major_damage')),
  condition_notes TEXT,

  -- Accessory checklist stored as JSONB
  -- Format: [{"name": "SD Card 64GB", "present": true, "notes": "minor scratch"}]
  accessory_checklist JSONB DEFAULT '[]',

  -- Photo evidence URLs (stored as array)
  photo_urls TEXT[] DEFAULT '{}',

  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for verification lookups
CREATE INDEX IF NOT EXISTS idx_verifications_booking ON booking_verifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_verifications_type ON booking_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_verifications_date ON booking_verifications(verified_at);
CREATE INDEX IF NOT EXISTS idx_verifications_verifier ON booking_verifications(verified_by);

-- ============================================
-- 3. UPDATE BOOKINGS TABLE STATUS CONSTRAINT
-- Add 'checked_out' status for equipment that has been physically picked up
-- ============================================
ALTER TABLE bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'approved', 'denied', 'returned', 'overdue', 'checked_out', 'completed'));

-- ============================================
-- 4. ADD TRIGGER FOR equipment_accessories updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_equipment_accessories_updated_at ON equipment_accessories;
CREATE TRIGGER update_equipment_accessories_updated_at
  BEFORE UPDATE ON equipment_accessories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. AI SETTINGS TABLE
-- Store AI configuration for Master Admin
-- ============================================
CREATE TABLE IF NOT EXISTS ai_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  modified_by INTEGER REFERENCES users(id),
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default AI settings
INSERT INTO ai_settings (setting_key, setting_value, description) VALUES
  ('ollama_enabled', '{"enabled": true, "endpoint": "http://localhost:11434"}', 'Ollama local LLM configuration'),
  ('default_model', '{"text": "mistral-small", "vision": "llava:13b", "fast": "llama3.1:8b"}', 'Default models for different tasks'),
  ('cloud_fallback', '{"enabled": false, "provider": null, "api_key": null}', 'Cloud API fallback configuration'),
  ('batch_schedule', '{"anomaly_detection": "02:00", "demand_forecast": "03:00", "maintenance_schedule": "04:00"}', 'Batch job schedule (24h format)')
ON CONFLICT (setting_key) DO NOTHING;

-- Index for AI settings
CREATE INDEX IF NOT EXISTS idx_ai_settings_key ON ai_settings(setting_key);

-- ============================================
-- 6. VERIFICATION PHOTOS TABLE (separate for better management)
-- ============================================
CREATE TABLE IF NOT EXISTS verification_photos (
  id SERIAL PRIMARY KEY,
  verification_id INTEGER NOT NULL REFERENCES booking_verifications(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  photo_type VARCHAR(50) DEFAULT 'condition' CHECK (photo_type IN ('condition', 'damage', 'receipt')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_verification_photos_verification ON verification_photos(verification_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE equipment_accessories IS 'Stores bundled accessories that come with equipment items (batteries, cables, cases, etc.)';
COMMENT ON TABLE booking_verifications IS 'Records checkout and return verification events with condition assessments';
COMMENT ON TABLE ai_settings IS 'AI feature configuration for Master Admin portal';
COMMENT ON TABLE verification_photos IS 'Photos taken during equipment checkout/return verification';

COMMENT ON COLUMN booking_verifications.accessory_checklist IS 'JSONB array of accessory check items: [{name, present, notes}]';
COMMENT ON COLUMN booking_verifications.condition_rating IS 'Overall condition: normal (no issues), minor_damage (cosmetic), major_damage (functional impact)';
