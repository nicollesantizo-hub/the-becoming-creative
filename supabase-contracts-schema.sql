-- Contracts — run this in your Supabase SQL editor

CREATE TABLE contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contract_number TEXT DEFAULT '',
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  package_name TEXT DEFAULT '',
  session_date DATE,
  session_location TEXT DEFAULT '',
  group_size INT DEFAULT 1,
  price NUMERIC DEFAULT 0,
  deposit_amount NUMERIC DEFAULT 0,
  deliverable_min_photos INT DEFAULT 0,
  delivery_days INT DEFAULT 0,
  terms_text TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'sent' | 'signed'
  share_token TEXT UNIQUE,
  signature_image TEXT,
  signer_typed_name TEXT,
  signed_at TIMESTAMPTZ,
  signer_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Owner-only access. No anon SELECT policy: the public /c/[token] sign page and
-- the /api/contracts/sign route both read/write via the service-role client
-- server-side instead — a token-scoped anon SELECT policy on this table would
-- expose every row (signatures, signer IP, client PII) to anyone holding the
-- public anon key, not just the one row the app requests by token.
CREATE POLICY "Users manage their own contracts" ON contracts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reusable contract templates (e.g. "Oregon Wedding", "Washington Portrait").
-- Each template holds an ordered list of toggleable clause sections as JSONB —
-- same shape as Quote.included_items / Quote.addons elsewhere in this schema.
-- Selecting a template only copies its enabled clauses into a new contract's
-- terms_text at creation time — editing a template later never touches
-- contracts already created from it.
CREATE TABLE contract_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT 'general', -- 'OR' | 'WA' | 'general'
  clauses JSONB DEFAULT '[]', -- [{id, title, body, enabled}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own contract templates" ON contract_templates
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
