-- fix-prod-schema.sql
-- Idempotent SQL to run in an interactive psql session on production.
-- This file intentionally avoids defaults/NOT NULL to be safe for large tables.

-- Add cron_runs fields (nullable)
ALTER TABLE IF EXISTS cron_runs
  ADD COLUMN IF NOT EXISTS started_at timestamptz;

ALTER TABLE IF EXISTS cron_runs
  ADD COLUMN IF NOT EXISTS finished_at timestamptz;

ALTER TABLE IF EXISTS cron_runs
  ADD COLUMN IF NOT EXISTS duration_ms bigint;

ALTER TABLE IF EXISTS cron_runs
  ADD COLUMN IF NOT EXISTS total_records integer;

ALTER TABLE IF EXISTS cron_runs
  ADD COLUMN IF NOT EXISTS sent_count integer;

ALTER TABLE IF EXISTS cron_runs
  ADD COLUMN IF NOT EXISTS status varchar(32);

ALTER TABLE IF EXISTS cron_runs
  ADD COLUMN IF NOT EXISTS err_code varchar(64);

ALTER TABLE IF EXISTS cron_runs
  ADD COLUMN IF NOT EXISTS notes text;

-- Add searches mute arrays
ALTER TABLE IF EXISTS searches
  ADD COLUMN IF NOT EXISTS mute_terms text[];

ALTER TABLE IF EXISTS searches
  ADD COLUMN IF NOT EXISTS mute_agencies text[];

-- Verification queries you can run after the ALTERs:
-- \d cron_runs
-- \d searches
