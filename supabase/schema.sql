-- =======================================================
-- LIFEOS2 — ESQUEMA COMPLETO POSTGRESQL / SUPABASE COM RLS
-- =======================================================

-- 1. TABELA PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'system',
  accent_color TEXT DEFAULT '#6366f1',
  enabled_widgets JSONB DEFAULT '["today", "daily_progress", "habits", "routines", "studies", "focus"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  category TEXT,
  date DATE,
  time TIME,
  estimated_duration INTEGER,
  recurrence TEXT CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA SUBTASKS
CREATE TABLE IF NOT EXISTS public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA ROUTINES
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('morning', 'afternoon', 'night', 'study', 'workout', 'custom')) DEFAULT 'custom',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA ROUTINE_ITEMS
CREATE TABLE IF NOT EXISTS public.routine_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  estimated_duration INTEGER,
  time TIME,
  priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA ROUTINE_LOGS
CREATE TABLE IF NOT EXISTS public.routine_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_item_id UUID NOT NULL REFERENCES public.routine_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('completed', 'skipped')) DEFAULT 'completed',
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(routine_item_id, date)
);

-- 7. TABELA HABITS
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'weekly_days', 'custom')) DEFAULT 'daily',
  weekly_target INTEGER,
  days_of_week INTEGER[] DEFAULT '{0,1,2,3,4,5,6}',
  target_value NUMERIC DEFAULT 1,
  unit TEXT DEFAULT 'vezes',
  time TIME,
  category TEXT,
  color TEXT DEFAULT '#34d399',
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA HABIT_LOGS
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  value NUMERIC DEFAULT 1,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- 9. TABELA STUDY_SUBJECTS
CREATE TABLE IF NOT EXISTS public.study_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  target_hours NUMERIC DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('fácil', 'médio', 'difícil')) DEFAULT 'médio',
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABELA STUDY_SESSIONS
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.study_subjects(id) ON DELETE SET NULL,
  subject_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  questions_solved INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABELA GOALS
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT CHECK (type IN ('daily', 'weekly', 'monthly', 'annual', 'custom')) DEFAULT 'monthly',
  current_value NUMERIC DEFAULT 0,
  target_value NUMERIC NOT NULL DEFAULT 100,
  unit TEXT DEFAULT '%',
  deadline DATE,
  status TEXT CHECK (status IN ('in_progress', 'achieved', 'expired')) DEFAULT 'in_progress',
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABELA WORKOUTS
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  muscle_groups TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('leve', 'moderado', 'intenso')) DEFAULT 'moderado',
  estimated_duration INTEGER DEFAULT 45,
  exercises JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TABELA WORKOUT_LOGS
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE SET NULL,
  workout_name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER DEFAULT 0,
  difficulty_felt TEXT CHECK (difficulty_felt IN ('leve', 'moderado', 'intenso')) DEFAULT 'moderado',
  notes TEXT,
  exercises_done JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TABELA JOURNAL_ENTRIES
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad', 'awful')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TABELA TAGS
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- =======================================================
-- ATIVAÇÃO DE ROW LEVEL SECURITY (RLS) E POLÍTICAS
-- =======================================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'profiles', 'tasks', 'subtasks', 'routines', 'routine_items', 'routine_logs',
    'habits', 'habit_logs', 'study_subjects', 'study_sessions', 'goals',
    'workouts', 'workout_logs', 'journal_entries', 'tags'
  ])
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

    -- Limpa políticas antigas se existirem
    EXECUTE format('DROP POLICY IF EXISTS "Users can select own %I" ON public.%I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can insert own %I" ON public.%I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can update own %I" ON public.%I;', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Users can delete own %I" ON public.%I;', tbl, tbl);

    -- Cria políticas de segurança
    IF tbl = 'profiles' THEN
      EXECUTE format('CREATE POLICY "Users can select own %I" ON public.%I FOR SELECT USING (auth.uid() = id);', tbl, tbl);
      EXECUTE format('CREATE POLICY "Users can insert own %I" ON public.%I FOR INSERT WITH CHECK (auth.uid() = id);', tbl, tbl);
      EXECUTE format('CREATE POLICY "Users can update own %I" ON public.%I FOR UPDATE USING (auth.uid() = id);', tbl, tbl);
    ELSE
      EXECUTE format('CREATE POLICY "Users can select own %I" ON public.%I FOR SELECT USING (auth.uid() = user_id);', tbl, tbl);
      EXECUTE format('CREATE POLICY "Users can insert own %I" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id);', tbl, tbl);
      EXECUTE format('CREATE POLICY "Users can update own %I" ON public.%I FOR UPDATE USING (auth.uid() = user_id);', tbl, tbl);
      EXECUTE format('CREATE POLICY "Users can delete own %I" ON public.%I FOR DELETE USING (auth.uid() = user_id);', tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- =======================================================
-- TRIGGER DE NOVO USUÁRIO NO SIGNUP
-- =======================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
