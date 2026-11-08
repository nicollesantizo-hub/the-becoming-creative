-- Contracts: amount already paid before the contract, session start time, and the
-- date the remaining balance is due.
-- Run once in the Supabase SQL editor. Safe to re-run.

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS session_time TEXT,
  ADD COLUMN IF NOT EXISTS balance_due_date DATE;
