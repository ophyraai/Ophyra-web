-- Add daily reminder preference to subscriptions
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS daily_reminder_enabled boolean DEFAULT true;
