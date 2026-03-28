-- Store settings table (key-value pairs)
CREATE TABLE IF NOT EXISTS store_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Admin can read/write; everyone can read
CREATE POLICY "Everyone can read store_settings"
  ON store_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can upsert store_settings"
  ON store_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed default settings
INSERT INTO store_settings (key, value) VALUES
  ('store_logo_url', NULL),
  ('store_tagline', 'ร้านเสื้อผ้าครบวงจร')
ON CONFLICT (key) DO NOTHING;
