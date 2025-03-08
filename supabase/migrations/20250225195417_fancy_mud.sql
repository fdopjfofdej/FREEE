/*
  # Add settings table

  1. New Tables
    - `settings`
      - `id` (text, primary key)
      - `value` (jsonb)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `settings` table
    - Add policy for admins to manage settings
    - Add policy for public to read settings
*/

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Settings are readable by everyone"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify settings"
  ON settings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Insert default settings
INSERT INTO settings (id, value)
VALUES ('auth', '{"requireCaptcha": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Function to get a setting
CREATE OR REPLACE FUNCTION get_setting(setting_id text)
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT value
    FROM settings
    WHERE id = setting_id
  );
END;
$$ LANGUAGE plpgsql;