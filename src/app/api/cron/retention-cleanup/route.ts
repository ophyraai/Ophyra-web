import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { toRelativePath } from '@/lib/supabase/storage';

const PHOTO_RETENTION_DAYS = 365; // 1 year
const RECORD_RETENTION_DAYS = 365 * 6; // 6 years (fiscal compliance)
const EMAIL_LOG_RETENTION_DAYS = 365 * 2; // 2 years
const BATCH_SIZE = 50;

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const summary = {
    photos_cleaned: 0,
    records_deleted: 0,
    orders_deleted: 0,
    email_logs_deleted: 0,
  };

  try {
    // --- Tier A: Photo cleanup (1 year) ---
    const photoCutoff = new Date();
    photoCutoff.setDate(photoCutoff.getDate() - PHOTO_RETENTION_DAYS);

    const { data: oldDiagnoses } = await supabaseAdmin
      .from('diagnoses')
      .select('id, photo_urls')
      .lt('created_at', photoCutoff.toISOString())
      .not('photo_urls', 'eq', '[]')
      .not('photo_urls', 'is', null)
      .limit(BATCH_SIZE);

    if (oldDiagnoses) {
      for (const diag of oldDiagnoses) {
        const urls = diag.photo_urls as string[];
        if (urls && urls.length > 0) {
          const paths = urls.map(toRelativePath);
          const { error } = await supabaseAdmin.storage
            .from('diagnosis-photos')
            .remove(paths);

          if (!error) {
            summary.photos_cleaned += paths.length;
          } else {
            console.error(`[Retention] Failed to delete photos for diagnosis ${diag.id}:`, error.message);
          }
        }

        // Clear photo_urls regardless (even if storage delete fails, mark as cleaned)
        await supabaseAdmin
          .from('diagnoses')
          .update({ photo_urls: [] })
          .eq('id', diag.id);
      }
    }

    // --- Tier B: Full record cleanup (6 years) ---
    const recordCutoff = new Date();
    recordCutoff.setDate(recordCutoff.getDate() - RECORD_RETENTION_DAYS);

    // Delete old diagnoses (cascades to payments)
    const { count: diagCount } = await supabaseAdmin
      .from('diagnoses')
      .delete({ count: 'exact' })
      .lt('created_at', recordCutoff.toISOString());
    summary.records_deleted = diagCount ?? 0;

    // Delete old orders (past fiscal retention)
    const { count: orderCount } = await supabaseAdmin
      .from('orders')
      .delete({ count: 'exact' })
      .lt('created_at', recordCutoff.toISOString());
    summary.orders_deleted = orderCount ?? 0;

    // Delete old email logs (2 years)
    const emailLogCutoff = new Date();
    emailLogCutoff.setDate(emailLogCutoff.getDate() - EMAIL_LOG_RETENTION_DAYS);

    const { count: emailCount } = await supabaseAdmin
      .from('email_log')
      .delete({ count: 'exact' })
      .lt('sent_at', emailLogCutoff.toISOString());
    summary.email_logs_deleted = emailCount ?? 0;

    console.log('[Retention] Cleanup complete:', summary);
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    console.error('[Retention] Cleanup error:', err);
    return NextResponse.json(
      { error: 'Retention cleanup failed', partial: summary },
      { status: 500 },
    );
  }
}
