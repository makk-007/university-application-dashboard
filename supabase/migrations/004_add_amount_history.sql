-- ============================================================
-- Migration: Add amount_history table
-- Run this in the Supabase SQL Editor against an existing database.
-- Safe to run multiple times.
-- ============================================================

CREATE TABLE IF NOT EXISTS amount_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id UUID REFERENCES universities(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  from_amount NUMERIC(12,2),
  to_amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT amount_history_exactly_one_parent CHECK (
    (university_id IS NOT NULL AND scholarship_id IS NULL) OR
    (university_id IS NULL AND scholarship_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS amount_history_university_idx
  ON amount_history(university_id) WHERE university_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS amount_history_scholarship_idx
  ON amount_history(scholarship_id) WHERE scholarship_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_amount_history_user_id ON amount_history(user_id);

ALTER TABLE amount_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'amount_history'
      AND policyname = 'Users can manage their own amount history'
  ) THEN
    CREATE POLICY "Users can manage their own amount history"
      ON amount_history FOR ALL
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;