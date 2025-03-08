-- Create settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'settings'
    AND n.nspname = 'public'
    AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
  END IF;
END
$$;

-- Create policies only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'settings' 
    AND policyname = 'Settings are readable by everyone'
  ) THEN
    CREATE POLICY "Settings are readable by everyone"
      ON settings FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'settings' 
    AND policyname = 'Only admins can modify settings'
  ) THEN
    CREATE POLICY "Only admins can modify settings"
      ON settings FOR ALL
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END
$$;

-- Insert default settings
INSERT INTO settings (id, value)
VALUES ('auth', '{"requireCaptcha": false}'::jsonb)
ON CONFLICT (id) DO UPDATE SET value = '{"requireCaptcha": false}'::jsonb;

-- Create or replace function to get a setting
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