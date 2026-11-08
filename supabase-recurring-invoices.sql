-- Monthly recurring invoices. A series holds the template; each month a normal
-- invoice row is created from it (linked back via invoices.series_id).
-- Run once in the Supabase SQL editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS invoice_series (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL DEFAULT '',
  client_business TEXT,
  client_email TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',          -- may contain {month}
  line_items JSONB NOT NULL DEFAULT '[]',
  notes TEXT DEFAULT '',
  payment_method TEXT,
  payment_link TEXT,
  payment_instructions TEXT,
  day_of_month INT NOT NULL DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 28),
  due_days INT NOT NULL DEFAULT 14,
  auto_send BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  next_run_date DATE NOT NULL,
  last_issued_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoice_series ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoice series: owners only" ON invoice_series;
CREATE POLICY "invoice series: owners only" ON invoice_series
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE invoice_series
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_link TEXT,
  ADD COLUMN IF NOT EXISTS payment_instructions TEXT;

-- How the client pays: method (stripe, zelle, venmo, …), an optional pay link
-- (e.g. a Stripe Payment Link), and any extra instructions.
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS series_id UUID REFERENCES invoice_series(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_link TEXT,
  ADD COLUMN IF NOT EXISTS payment_instructions TEXT;
