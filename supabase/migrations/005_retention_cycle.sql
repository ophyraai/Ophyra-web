-- Retention cycle: new columns on user_subscriptions + email log table

ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS renewal_offer_expires timestamptz,
  ADD COLUMN IF NOT EXISTS last_email_type text,
  ADD COLUMN IF NOT EXISTS last_email_at timestamptz,
  ADD COLUMN IF NOT EXISTS renewal_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS previous_diagnosis_id uuid,
  ADD COLUMN IF NOT EXISTS started_at timestamptz;

-- Log de emails enviados (evita duplicados + auditoría)
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  template text NOT NULL,
  subscription_id uuid REFERENCES user_subscriptions(id),
  sent_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_log_sub_template ON email_log(subscription_id, template);
