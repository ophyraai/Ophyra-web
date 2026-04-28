-- 013: Newsletter subscribers (formalize existing table) + Customer profiles + Order backfill trigger

-- 1. Newsletter subscribers (idempotent — table may already exist from manual creation)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email text PRIMARY KEY,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  source text DEFAULT 'welcome_popup'
);

-- 2. Customer profiles (unified contact table for campaigns)
CREATE TABLE IF NOT EXISTS customer_profiles (
  email text PRIMARY KEY,
  name text,
  newsletter_subscribed boolean NOT NULL DEFAULT false,
  newsletter_subscribed_at timestamptz,
  first_diagnosis_at timestamptz,
  first_purchase_at timestamptz,
  total_orders int NOT NULL DEFAULT 0,
  lifetime_value_cents int NOT NULL DEFAULT 0,
  has_account boolean NOT NULL DEFAULT false,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_activity_at timestamptz DEFAULT now(),
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cp_newsletter ON customer_profiles(newsletter_subscribed) WHERE newsletter_subscribed = true;
CREATE INDEX IF NOT EXISTS idx_cp_has_account ON customer_profiles(has_account);
CREATE INDEX IF NOT EXISTS idx_cp_user ON customer_profiles(user_id);

-- 3. Order backfill trigger (links guest orders when user creates account)
CREATE OR REPLACE FUNCTION public.link_anonymous_orders()
RETURNS trigger AS $$
BEGIN
  UPDATE public.orders
  SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;

  UPDATE public.order_drafts
  SET user_id = NEW.id
  WHERE email = NEW.email AND user_id IS NULL;

  -- Also update customer_profiles
  UPDATE public.customer_profiles
  SET has_account = true, user_id = NEW.id
  WHERE email = NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_link_orders ON auth.users;
CREATE TRIGGER on_auth_user_link_orders
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.link_anonymous_orders();
