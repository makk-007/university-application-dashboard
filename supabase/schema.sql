-- ============================================================
-- Masters Application Tracker - Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- UNIVERSITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  tuition NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'not-started'
    CHECK (status IN ('not-yet-open','not-started','in-progress','submitted','accepted','rejected','waitlisted')),
  notes TEXT DEFAULT '',
  application_link TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHOLARSHIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'GHS',
  coverage TEXT DEFAULT 'Full Scholarship'
    CHECK (coverage IN ('Full Scholarship','Tuition Only','Stipend Only','Tuition + Stipend')),
  status TEXT NOT NULL DEFAULT 'not-started'
    CHECK (status IN ('not-yet-open','not-started','in-progress','submitted','accepted','rejected','awarded','waitlisted')),
  notes TEXT DEFAULT '',
  link TEXT DEFAULT '',
  start_date DATE,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHOLARSHIP_UNIVERSITIES (junction table)
-- ============================================================
CREATE TABLE IF NOT EXISTS scholarship_universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  UNIQUE (scholarship_id, university_id)
);

-- ============================================================
-- CHECKLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SCHOLARSHIP CHECKLIST TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS scholarship_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER universities_updated_at
  BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER scholarships_updated_at
  BEFORE UPDATE ON scholarships
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Universities
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own universities"
  ON universities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Scholarships
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own scholarships"
  ON scholarships FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Scholarship_Universities
ALTER TABLE scholarship_universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their scholarship-university links"
  ON scholarship_universities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scholarships s
      WHERE s.id = scholarship_universities.scholarship_id
        AND s.user_id = auth.uid()
    )
  );

-- Checklist
ALTER TABLE checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage checklist for their universities"
  ON checklist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM universities u
      WHERE u.id = checklist.university_id
        AND u.user_id = auth.uid()
    )
  );

-- Scholarship Checklist
ALTER TABLE scholarship_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage checklist for their scholarships"
  ON scholarship_checklist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM scholarships s
      WHERE s.id = scholarship_checklist.scholarship_id
        AND s.user_id = auth.uid()
    )
  );

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_universities_user_id ON universities(user_id);
CREATE INDEX IF NOT EXISTS idx_universities_status ON universities(status);
CREATE INDEX IF NOT EXISTS idx_universities_deadline ON universities(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_user_id ON scholarships(user_id);
CREATE INDEX IF NOT EXISTS idx_scholarships_status ON scholarships(status);
CREATE INDEX IF NOT EXISTS idx_checklist_university_id ON checklist(university_id);
CREATE INDEX IF NOT EXISTS idx_scholarship_checklist_id ON scholarship_checklist(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_scholarship_universities_scholarship ON scholarship_universities(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_scholarship_universities_university ON scholarship_universities(university_id);
