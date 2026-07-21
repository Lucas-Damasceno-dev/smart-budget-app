-- V3__Add_Optimistic_Locking.sql
-- Add version column for optimistic locking on accounts table

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
UPDATE accounts SET version = 0 WHERE version IS NULL;
ALTER TABLE accounts ALTER COLUMN version SET NOT NULL;
