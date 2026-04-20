import { supabaseAdmin } from '@/lib/supabase/server';
import { toRelativePath } from '@/lib/supabase/storage';

interface DeletionSummary {
  diagnoses_deleted: number;
  photos_deleted: number;
  habits_deleted: number;
  orders_anonymized: number;
  subscriptions_deleted: number;
}

/**
 * Deletes all user data for GDPR Art. 17 (Right to Erasure).
 * Orders are anonymized instead of deleted (fiscal retention requirement).
 */
export async function deleteUserData(authId: string): Promise<DeletionSummary> {
  const summary: DeletionSummary = {
    diagnoses_deleted: 0,
    photos_deleted: 0,
    habits_deleted: 0,
    orders_anonymized: 0,
    subscriptions_deleted: 0,
  };

  // 1. Look up the user record
  const { data: userRecord } = await supabaseAdmin
    .from('users')
    .select('id, email')
    .eq('auth_id', authId)
    .single();

  if (!userRecord) {
    // No profile found — still attempt to delete auth account
    await supabaseAdmin.auth.admin.deleteUser(authId);
    return summary;
  }

  const { id: userId, email } = userRecord;

  // 2. Delete diagnosis photos from storage
  const { data: diagnoses } = await supabaseAdmin
    .from('diagnoses')
    .select('id, photo_urls')
    .or(`user_id.eq.${userId},email.eq.${email}`);

  if (diagnoses) {
    for (const diag of diagnoses) {
      const urls = diag.photo_urls as string[] | null;
      if (urls && urls.length > 0) {
        const paths = urls.map(toRelativePath);
        const { error } = await supabaseAdmin.storage
          .from('diagnosis-photos')
          .remove(paths);
        if (!error) {
          summary.photos_deleted += paths.length;
        } else {
          console.error(`[GDPR] Failed to delete photos for diagnosis ${diag.id}:`, error.message);
        }
      }
    }

    // 3. Delete diagnoses (cascades to payments via ON DELETE CASCADE)
    const { count } = await supabaseAdmin
      .from('diagnoses')
      .delete({ count: 'exact' })
      .or(`user_id.eq.${userId},email.eq.${email}`);
    summary.diagnoses_deleted = count ?? 0;
  }

  // 4. Delete habits (cascades to habit_entries)
  const { count: habitsCount } = await supabaseAdmin
    .from('habits')
    .delete({ count: 'exact' })
    .eq('user_id', authId);
  summary.habits_deleted = habitsCount ?? 0;

  // 5. Anonymize orders (fiscal retention — cannot delete)
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id')
    .or(`user_id.eq.${authId},email.eq.${email}`);

  if (orders && orders.length > 0) {
    const orderIds = orders.map((o) => o.id);

    await supabaseAdmin
      .from('orders')
      .update({
        email: 'deleted@anon.ophyra',
        phone: null,
        shipping_name: '[BORRADO]',
        shipping_address: {},
        user_id: null,
        stripe_customer_id: null,
      })
      .in('id', orderIds);

    // Log anonymization events
    const events = orderIds.map((orderId) => ({
      order_id: orderId,
      type: 'gdpr_anonymized',
      note: `Data anonymized per GDPR erasure request on ${new Date().toISOString().slice(0, 10)}`,
      created_by: 'system',
    }));
    await supabaseAdmin.from('order_events').insert(events);

    summary.orders_anonymized = orderIds.length;
  }

  // 6. Anonymize order_drafts
  await supabaseAdmin
    .from('order_drafts')
    .update({ email: 'deleted@anon.ophyra', user_id: null })
    .or(`user_id.eq.${authId},email.eq.${email}`);

  // 7. Delete subscriptions
  const { count: subsCount } = await supabaseAdmin
    .from('user_subscriptions')
    .delete({ count: 'exact' })
    .or(`user_id.eq.${authId},email.eq.${email}`);
  summary.subscriptions_deleted = subsCount ?? 0;

  // 8. Delete email log
  await supabaseAdmin
    .from('email_log')
    .delete()
    .eq('email', email);

  // 9. Delete user profile
  await supabaseAdmin
    .from('users')
    .delete()
    .eq('auth_id', authId);

  // 10. Delete auth account
  await supabaseAdmin.auth.admin.deleteUser(authId);

  return summary;
}
