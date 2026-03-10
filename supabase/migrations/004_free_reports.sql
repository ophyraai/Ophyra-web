-- Add free_reports column to user_subscriptions
-- When a user pays for a diagnosis, they get 1 free report for future diagnoses
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS free_reports integer NOT NULL DEFAULT 0;
