-- ============================================================
-- Migration: Add is_archived column to application_cycles
-- Run this in the Supabase SQL Editor against an existing database.
-- Safe to run multiple times.
-- ============================================================

ALTER TABLE application_cycles
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;