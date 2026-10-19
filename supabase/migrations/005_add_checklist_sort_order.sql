-- ============================================================
-- Migration: Add sort_order to checklist tables
-- Run this in the Supabase SQL Editor against an existing database.
-- Safe to run multiple times.
-- ============================================================

ALTER TABLE checklist
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE scholarship_checklist
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Backfill: keep existing items in creation order. Only lists where every
-- item still has sort_order 0 are touched, so re-running this migration
-- never undoes a manual reorder.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY university_id ORDER BY created_at, id) - 1 AS new_order,
         MAX(sort_order) OVER (PARTITION BY university_id) AS max_order
  FROM checklist
)
UPDATE checklist c
SET sort_order = r.new_order
FROM ranked r
WHERE c.id = r.id
  AND r.max_order = 0
  AND c.sort_order IS DISTINCT FROM r.new_order;

WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY scholarship_id ORDER BY created_at, id) - 1 AS new_order,
         MAX(sort_order) OVER (PARTITION BY scholarship_id) AS max_order
  FROM scholarship_checklist
)
UPDATE scholarship_checklist c
SET sort_order = r.new_order
FROM ranked r
WHERE c.id = r.id
  AND r.max_order = 0
  AND c.sort_order IS DISTINCT FROM r.new_order;

CREATE INDEX IF NOT EXISTS idx_checklist_sort_order
  ON checklist(university_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_scholarship_checklist_sort_order
  ON scholarship_checklist(scholarship_id, sort_order);
