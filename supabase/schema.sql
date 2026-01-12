-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- VALIDATION FUNCTIONS
-- =====================================================
-- Validate days_of_week array (0 = Sunday, 6 = Saturday)
CREATE OR REPLACE FUNCTION is_valid_days_of_week(days INTEGER[])
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  d INTEGER;
BEGIN
  IF days IS NULL THEN
    RETURN TRUE;
  END IF;

  FOREACH d IN ARRAY days LOOP
    IF d < 0 OR d > 6 THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$;

-- =====================================================
-- HABITS TABLE (Directly references auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  days_of_week INTEGER[] CHECK (is_valid_days_of_week(days_of_week)),
  reminder_time TIME,
  color TEXT NOT NULL DEFAULT 'blue',
  icon TEXT NOT NULL DEFAULT 'fitness',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    frequency = 'daily'
    OR (frequency = 'weekly' AND days_of_week IS NOT NULL)
  )
);

-- =====================================================
-- HABIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'missed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (habit_id, date)
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================
CREATE TRIGGER update_habits_updated_at
BEFORE UPDATE ON habits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_logs_updated_at
BEFORE UPDATE ON habit_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DEFAULT CATEGORIES
-- =====================================================
INSERT INTO categories (name, color, icon) VALUES
  ('Fitness', 'green', 'fitness'),
  ('Health', 'blue', 'health'),
  ('Learning', 'purple', 'learning'),
  ('Productivity', 'orange', 'productivity'),
  ('Mindfulness', 'pink', 'mindfulness'),
  ('Social', 'red', 'social')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HABITS POLICIES
-- =====================================================
CREATE POLICY "Users can view own habits"
ON habits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own habits"
ON habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
ON habits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
ON habits FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- HABIT LOGS POLICIES
-- =====================================================
CREATE POLICY "Users can view own habit logs"
ON habit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM habits
    WHERE habits.id = habit_logs.habit_id
      AND auth.uid() = habits.user_id
  )
);

CREATE POLICY "Users can create own habit logs"
ON habit_logs FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM habits
    WHERE habits.id = habit_logs.habit_id
      AND auth.uid() = habits.user_id
  )
);

CREATE POLICY "Users can update own habit logs"
ON habit_logs FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM habits
    WHERE habits.id = habit_logs.habit_id
      AND auth.uid() = habits.user_id
  )
);

CREATE POLICY "Users can delete own habit logs"
ON habit_logs FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM habits
    WHERE habits.id = habit_logs.habit_id
      AND auth.uid() = habits.user_id
  )
);

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- ACHIEVEMENTS POLICIES
-- =====================================================
CREATE POLICY "Users can view own achievements"
ON achievements FOR SELECT
USING (auth.uid() = user_id);

-- =====================================================
-- CATEGORIES POLICIES (PUBLIC READ)
-- =====================================================
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);
