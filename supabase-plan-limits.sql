-- Free vs. Pro, enforced in the database so the limits hold no matter how a row
-- is created. Mirrors src/lib/plan.ts (FREE_MONTHLY_LIMITS).
-- Run once in the Supabase SQL editor. Safe to re-run.

-- 1. Only Stripe (service role) or you (SQL editor) can change someone's tier.
--    Signed-in users updating their own profile can't promote themselves.
CREATE OR REPLACE FUNCTION protect_profile_tier() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.tier := 'free';
    ELSIF NEW.tier IS DISTINCT FROM OLD.tier THEN
      NEW.tier := OLD.tier;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_protect_tier ON profiles;
CREATE TRIGGER profiles_protect_tier
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_profile_tier();

-- 2. Free plan: a monthly cap on new quotes, contracts, and invoices.
CREATE OR REPLACE FUNCTION enforce_free_monthly_limit() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  lim INT := TG_ARGV[0]::INT;
  used INT;
  user_tier TEXT;
BEGIN
  SELECT tier INTO user_tier FROM profiles WHERE id = NEW.user_id;
  IF user_tier = 'pro' THEN
    RETURN NEW;
  END IF;
  EXECUTE format(
    'SELECT count(*) FROM %I WHERE user_id = $1 AND created_at >= date_trunc(''month'', now())',
    TG_TABLE_NAME
  ) INTO used USING NEW.user_id;
  IF used >= lim THEN
    RAISE EXCEPTION 'free_plan_limit: % per month on the free plan', lim
      USING HINT = 'Upgrade to Pro for unlimited.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS quotes_free_limit ON quotes;
CREATE TRIGGER quotes_free_limit BEFORE INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION enforce_free_monthly_limit('2');

DROP TRIGGER IF EXISTS contracts_free_limit ON contracts;
CREATE TRIGGER contracts_free_limit BEFORE INSERT ON contracts
  FOR EACH ROW EXECUTE FUNCTION enforce_free_monthly_limit('2');

DROP TRIGGER IF EXISTS invoices_free_limit ON invoices;
CREATE TRIGGER invoices_free_limit BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION enforce_free_monthly_limit('3');

-- 3. Pro-only: monthly invoice series and saved contract templates.
CREATE OR REPLACE FUNCTION enforce_pro_only() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  user_tier TEXT;
BEGIN
  SELECT tier INTO user_tier FROM profiles WHERE id = NEW.user_id;
  IF user_tier IS DISTINCT FROM 'pro' THEN
    RAISE EXCEPTION 'pro_only' USING HINT = 'This is part of Pro.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS invoice_series_pro_only ON invoice_series;
CREATE TRIGGER invoice_series_pro_only BEFORE INSERT ON invoice_series
  FOR EACH ROW EXECUTE FUNCTION enforce_pro_only();

DROP TRIGGER IF EXISTS contract_templates_pro_only ON contract_templates;
CREATE TRIGGER contract_templates_pro_only BEFORE INSERT ON contract_templates
  FOR EACH ROW EXECUTE FUNCTION enforce_pro_only();
