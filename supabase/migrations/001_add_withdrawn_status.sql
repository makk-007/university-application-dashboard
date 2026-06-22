-- ============================================================
-- Migration: Add 'withdrawn' application status
-- Run this in the Supabase SQL Editor against an existing database.
-- Safe to run multiple times.
-- ============================================================

-- ── universities.status ──────────────────────────────────────
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT con.conname INTO v_constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'universities'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%status%IN%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE universities DROP CONSTRAINT %I', v_constraint_name);
  END IF;

  ALTER TABLE universities
    ADD CONSTRAINT universities_status_check
    CHECK (status IN ('not-yet-open','not-started','in-progress','submitted','accepted','rejected','waitlisted','withdrawn'));
END $$;

-- ── scholarships.status ──────────────────────────────────────
DO $$
DECLARE
  v_constraint_name TEXT;
BEGIN
  SELECT con.conname INTO v_constraint_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'scholarships'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%status%IN%'
  LIMIT 1;

  IF v_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE scholarships DROP CONSTRAINT %I', v_constraint_name);
  END IF;

  ALTER TABLE scholarships
    ADD CONSTRAINT scholarships_status_check
    CHECK (status IN ('not-yet-open','not-started','in-progress','submitted','accepted','rejected','awarded','waitlisted','withdrawn'));
END $$;