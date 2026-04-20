-- ============================================================
-- Ophyra — Migration 011: GDPR Hardening
-- ============================================================
-- 1. Make diagnosis-photos bucket private (photos of skin conditions
--    should not be publicly accessible).
-- 2. Enable RLS on coupons and email_log tables (defense in depth).
-- ============================================================

-- 1a. Make bucket private
UPDATE storage.buckets SET public = false WHERE id = 'diagnosis-photos';

-- 1b. Remove public read policy
DROP POLICY IF EXISTS "Anyone can read photos" ON storage.objects;

-- 1c. Only service role can read diagnosis photos
CREATE POLICY "Service role read diagnosis-photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'diagnosis-photos' AND auth.role() = 'service_role');

-- Keep "Anyone can upload photos" policy (needed for anonymous diagnosis flow)

-- 2a. RLS on coupons (only accessed via supabaseAdmin)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role all coupons" ON coupons
  FOR ALL USING (auth.role() = 'service_role');

-- 2b. RLS on email_log (only accessed via supabaseAdmin)
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role all email_log" ON email_log
  FOR ALL USING (auth.role() = 'service_role');
