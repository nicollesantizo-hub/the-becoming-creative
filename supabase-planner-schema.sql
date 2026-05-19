-- Photographer Planner — run this in your Supabase SQL editor

-- Shoot day planner
CREATE TABLE planner_shoots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  session_date DATE,
  location TEXT DEFAULT '',
  session_type TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  shot_list JSONB DEFAULT '[]',
  timeline JSONB DEFAULT '[]',
  gear_checklist JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planner_shoots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own shoots" ON planner_shoots
  FOR ALL USING (auth.uid() = user_id);

-- Booking & business tracker (pro)
CREATE TABLE planner_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  session_type TEXT DEFAULT '',
  session_date DATE,
  status TEXT DEFAULT 'lead',
  amount NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planner_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own bookings" ON planner_bookings
  FOR ALL USING (auth.uid() = user_id);

-- Editing & delivery workflow (pro)
CREATE TABLE planner_edits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  session_date DATE,
  editing_deadline DATE,
  delivery_deadline DATE,
  status TEXT DEFAULT 'not_started',
  photos_count INT DEFAULT 0,
  notes TEXT DEFAULT '',
  tasks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planner_edits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own edit jobs" ON planner_edits
  FOR ALL USING (auth.uid() = user_id);

-- Content & marketing planner (pro)
CREATE TABLE planner_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT DEFAULT '',
  scheduled_date DATE,
  caption_idea TEXT DEFAULT '',
  status TEXT DEFAULT 'idea',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planner_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own content entries" ON planner_content
  FOR ALL USING (auth.uid() = user_id);

-- Inspo board (pro)
CREATE TABLE planner_inspo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  images JSONB DEFAULT '[]',
  mood_words JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  collaborators JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE planner_inspo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own inspo entries" ON planner_inspo
  FOR ALL USING (auth.uid() = user_id);

-- Storage bucket for inspo images (run separately in Supabase Storage settings,
-- or via the dashboard: create a bucket named "planner-inspo" set to private)
-- Then add this storage policy:
-- CREATE POLICY "Users manage their own inspo images" ON storage.objects
--   FOR ALL USING (bucket_id = 'planner-inspo' AND auth.uid()::text = (storage.foldername(name))[1]);
