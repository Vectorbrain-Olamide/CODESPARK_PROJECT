/*
# PowerPal NG — Core Schema

1. Overview
   Community-powered electricity tracking app for Nigeria.
   Tables: states, lgas, communities, profiles, outage_reports, notifications,
   predictions, generator_calculations, inverter_calculations, ai_chats,
   leaderboard, badges, power_history, favorites, discussions.

2. Security
   - RLS enabled on every table.
   - Public reference data readable by anon + authenticated.
   - User-owned data owner-scoped via auth.uid().
*/

-- ============ STATES ============
CREATE TABLE IF NOT EXISTS states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  region text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============ LGAs ============
CREATE TABLE IF NOT EXISTS lgas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_id uuid NOT NULL REFERENCES states(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (state_id, name)
);

-- ============ COMMUNITIES ============
CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lga_id uuid NOT NULL REFERENCES lgas(id) ON DELETE CASCADE,
  name text NOT NULL,
  latitude double precision,
  longitude double precision,
  status text NOT NULL DEFAULT 'stable',
  reliability_score numeric(5,2) DEFAULT 0,
  avg_electricity_hours numeric(5,2) DEFAULT 0,
  reports_today integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE (lga_id, name)
);

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone_number text,
  state text,
  lga text,
  community text,
  avatar_url text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============ OUTAGE REPORTS ============
CREATE TABLE IF NOT EXISTS outage_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  community_id uuid REFERENCES communities(id) ON DELETE SET NULL,
  state text NOT NULL,
  lga text NOT NULL,
  community text NOT NULL,
  report_type text NOT NULL,
  description text,
  photo_url text,
  latitude double precision,
  longitude double precision,
  report_date date NOT NULL DEFAULT CURRENT_DATE,
  report_time time NOT NULL DEFAULT CURRENT_TIME,
  status text NOT NULL DEFAULT 'pending',
  upvotes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  community text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============ PREDICTIONS ============
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
  community text NOT NULL,
  prediction_date date NOT NULL DEFAULT CURRENT_DATE,
  outage_probability numeric(5,2) DEFAULT 0,
  expected_restoration_hours numeric(5,2) DEFAULT 0,
  best_hours text,
  reliability_score numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============ GENERATOR CALCULATIONS ============
CREATE TABLE IF NOT EXISTS generator_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  generator_size numeric(10,2),
  fuel_consumption numeric(10,2),
  fuel_price numeric(10,2),
  hours_per_day numeric(10,2),
  daily_cost numeric(12,2),
  weekly_cost numeric(12,2),
  monthly_cost numeric(12,2),
  yearly_cost numeric(12,2),
  created_at timestamptz DEFAULT now()
);

-- ============ INVERTER CALCULATIONS ============
CREATE TABLE IF NOT EXISTS inverter_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  appliances jsonb,
  inverter_size numeric(10,2),
  battery_capacity numeric(10,2),
  backup_hours numeric(10,2),
  solar_panel_size numeric(10,2),
  monthly_usage numeric(12,2),
  created_at timestamptz DEFAULT now()
);

-- ============ AI CHATS ============
CREATE TABLE IF NOT EXISTS ai_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============ LEADERBOARD ============
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
  community text NOT NULL,
  state text,
  lga text,
  reliability_score numeric(5,2) DEFAULT 0,
  avg_restoration_hours numeric(5,2) DEFAULT 0,
  total_outages integer DEFAULT 0,
  rank integer DEFAULT 0,
  period text DEFAULT 'monthly',
  created_at timestamptz DEFAULT now()
);

-- ============ BADGES ============
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  tier text,
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ============ POWER HISTORY ============
CREATE TABLE IF NOT EXISTS power_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  recorded_date date NOT NULL DEFAULT CURRENT_DATE,
  hour integer NOT NULL CHECK (hour >= 0 AND hour <= 23),
  has_power boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (community_id, recorded_date, hour)
);

-- ============ FAVORITES ============
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, community_id)
);

-- ============ DISCUSSIONS ============
CREATE TABLE IF NOT EXISTS discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  community_id uuid REFERENCES communities(id) ON DELETE CASCADE,
  author_name text,
  title text NOT NULL,
  body text NOT NULL,
  parent_id uuid REFERENCES discussions(id) ON DELETE CASCADE,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_lgas_state ON lgas(state_id);
CREATE INDEX IF NOT EXISTS idx_communities_lga ON communities(lga_id);
CREATE INDEX IF NOT EXISTS idx_outage_reports_community ON outage_reports(community_id);
CREATE INDEX IF NOT EXISTS idx_outage_reports_status ON outage_reports(status);
CREATE INDEX IF NOT EXISTS idx_outage_reports_date ON outage_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_community ON predictions(community_id);
CREATE INDEX IF NOT EXISTS idx_power_history_community_date ON power_history(community_id, recorded_date);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_community ON discussions(community_id);

-- ============ RLS: STATES ============
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_states" ON states;
CREATE POLICY "anon_read_states" ON states FOR SELECT TO anon, authenticated USING (true);

-- ============ RLS: LGAS ============
ALTER TABLE lgas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_lgas" ON lgas;
CREATE POLICY "anon_read_lgas" ON lgas FOR SELECT TO anon, authenticated USING (true);

-- ============ RLS: COMMUNITIES ============
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_communities" ON communities;
CREATE POLICY "anon_read_communities" ON communities FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_communities" ON communities;
CREATE POLICY "auth_update_communities" ON communities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- ============ RLS: PROFILES ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ RLS: OUTAGE REPORTS ============
ALTER TABLE outage_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_reports" ON outage_reports;
CREATE POLICY "anon_read_reports" ON outage_reports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_reports" ON outage_reports;
CREATE POLICY "auth_insert_reports" ON outage_reports FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "owner_update_reports" ON outage_reports;
CREATE POLICY "owner_update_reports" ON outage_reports FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_reports" ON outage_reports;
CREATE POLICY "owner_delete_reports" ON outage_reports FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ RLS: NOTIFICATIONS ============
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ RLS: PREDICTIONS ============
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_predictions" ON predictions;
CREATE POLICY "anon_read_predictions" ON predictions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_predictions" ON predictions;
CREATE POLICY "auth_insert_predictions" ON predictions FOR INSERT TO authenticated WITH CHECK (true);

-- ============ RLS: GENERATOR CALCULATIONS ============
ALTER TABLE generator_calculations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_generator" ON generator_calculations;
CREATE POLICY "select_own_generator" ON generator_calculations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_generator" ON generator_calculations;
CREATE POLICY "insert_own_generator" ON generator_calculations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_generator" ON generator_calculations;
CREATE POLICY "delete_own_generator" ON generator_calculations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ RLS: INVERTER CALCULATIONS ============
ALTER TABLE inverter_calculations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_inverter" ON inverter_calculations;
CREATE POLICY "select_own_inverter" ON inverter_calculations FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_inverter" ON inverter_calculations;
CREATE POLICY "insert_own_inverter" ON inverter_calculations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_inverter" ON inverter_calculations;
CREATE POLICY "delete_own_inverter" ON inverter_calculations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ RLS: AI CHATS ============
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_chats" ON ai_chats;
CREATE POLICY "select_own_chats" ON ai_chats FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_chats" ON ai_chats;
CREATE POLICY "insert_own_chats" ON ai_chats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_chats" ON ai_chats;
CREATE POLICY "delete_own_chats" ON ai_chats FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ RLS: LEADERBOARD ============
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_leaderboard" ON leaderboard;
CREATE POLICY "anon_read_leaderboard" ON leaderboard FOR SELECT TO anon, authenticated USING (true);

-- ============ RLS: BADGES ============
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_badges" ON badges;
CREATE POLICY "anon_read_badges" ON badges FOR SELECT TO anon, authenticated USING (true);

-- ============ RLS: POWER HISTORY ============
ALTER TABLE power_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_power_history" ON power_history;
CREATE POLICY "anon_read_power_history" ON power_history FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_power_history" ON power_history;
CREATE POLICY "auth_insert_power_history" ON power_history FOR INSERT TO authenticated WITH CHECK (true);

-- ============ RLS: FAVORITES ============
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ RLS: DISCUSSIONS ============
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_discussions" ON discussions;
CREATE POLICY "anon_read_discussions" ON discussions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_discussions" ON discussions;
CREATE POLICY "auth_insert_discussions" ON discussions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "owner_update_discussions" ON discussions;
CREATE POLICY "owner_update_discussions" ON discussions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "owner_delete_discussions" ON discussions;
CREATE POLICY "owner_delete_discussions" ON discussions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ TRIGGER: auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TRIGGER: updated_at on profiles ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
