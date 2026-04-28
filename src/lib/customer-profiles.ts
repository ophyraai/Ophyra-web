import { supabaseAdmin } from '@/lib/supabase/server';

interface ProfileUpdate {
  name?: string;
  newsletter_subscribed?: boolean;
  first_diagnosis_at?: string;
  first_purchase_at?: string;
  total_orders_increment?: number;
  lifetime_value_increment_cents?: number;
  has_account?: boolean;
  user_id?: string;
  source?: string;
}

/**
 * Upsert a customer profile. Creates if not exists, updates fields if exists.
 * Uses email as primary key. Safe to call from multiple touchpoints.
 */
export async function upsertProfile(email: string, update: ProfileUpdate) {
  if (!email || email.endsWith('@anonymous.ophyra')) return;

  const now = new Date().toISOString();

  // Build the insert row
  const insertRow: Record<string, unknown> = {
    email,
    last_activity_at: now,
    created_at: now,
  };
  if (update.name) insertRow.name = update.name;
  if (update.newsletter_subscribed) {
    insertRow.newsletter_subscribed = true;
    insertRow.newsletter_subscribed_at = now;
  }
  if (update.first_diagnosis_at) insertRow.first_diagnosis_at = update.first_diagnosis_at;
  if (update.first_purchase_at) insertRow.first_purchase_at = update.first_purchase_at;
  if (update.has_account) insertRow.has_account = true;
  if (update.user_id) insertRow.user_id = update.user_id;
  if (update.source) insertRow.source = update.source;
  if (update.total_orders_increment) insertRow.total_orders = update.total_orders_increment;
  if (update.lifetime_value_increment_cents) insertRow.lifetime_value_cents = update.lifetime_value_increment_cents;

  // For upsert, we need to handle increments specially
  // First try a simple upsert for non-increment fields
  const { error } = await supabaseAdmin
    .from('customer_profiles')
    .upsert(insertRow, { onConflict: 'email' });

  if (error) {
    console.error('[customer-profiles] upsert failed:', error.message);
    return;
  }

  // If we need to increment counters, do a separate update
  if (update.total_orders_increment || update.lifetime_value_increment_cents) {
    // Use RPC or raw increment — Supabase doesn't support increment in upsert
    // So we read + write (acceptable for low-volume operations)
    const { data: current } = await supabaseAdmin
      .from('customer_profiles')
      .select('total_orders, lifetime_value_cents')
      .eq('email', email)
      .single();

    if (current) {
      await supabaseAdmin
        .from('customer_profiles')
        .update({
          total_orders: (current.total_orders || 0) + (update.total_orders_increment || 0),
          lifetime_value_cents: (current.lifetime_value_cents || 0) + (update.lifetime_value_increment_cents || 0),
          last_activity_at: now,
        })
        .eq('email', email);
    }
  }
}
