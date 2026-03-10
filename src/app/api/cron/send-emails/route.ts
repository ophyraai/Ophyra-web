import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/emails/send';
import Day7CheckinEmail, { getDay7Subject } from '@/lib/emails/templates/day7-checkin';
import Day25RediagnosisEmail, { getDay25Subject } from '@/lib/emails/templates/day25-rediagnosis';
import RenewalOfferEmail, { getRenewalOfferSubject } from '@/lib/emails/templates/renewal-offer';
import RenewalLastChanceEmail, { getRenewalLastChanceSubject } from '@/lib/emails/templates/renewal-last-chance';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com';

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: subscriptions, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('*')
    .eq('is_active', true)
    .not('started_at', 'is', null);

  if (error || !subscriptions) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }

  const results: { email: string; template: string; result: string }[] = [];

  for (const sub of subscriptions) {
    const startedAt = new Date(sub.started_at);
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24));
    // Default to 'es' if no locale stored
    const locale = (sub.locale as 'es' | 'en') || 'es';

    // Day 7 — check-in
    if (daysElapsed >= 7 && daysElapsed < 25) {
      const res = await sendEmail({
        template: 'day7-checkin',
        to: sub.email,
        subscriptionId: sub.id,
        subject: getDay7Subject(locale),
        react: Day7CheckinEmail({ locale, dashboardUrl: `${BASE_URL}/dashboard` }),
      });
      results.push({ email: sub.email, template: 'day7-checkin', result: res.skipped ? 'skipped' : res.sent ? 'sent' : 'error' });
    }

    // Day 25 — re-diagnosis reminder
    if (daysElapsed >= 25 && daysElapsed < 31) {
      const res = await sendEmail({
        template: 'day25-rediagnosis',
        to: sub.email,
        subscriptionId: sub.id,
        subject: getDay25Subject(locale),
        react: Day25RediagnosisEmail({ locale, diagnosisUrl: `${BASE_URL}/diagnosis?rediagnosis=true` }),
      });
      results.push({ email: sub.email, template: 'day25-rediagnosis', result: res.skipped ? 'skipped' : res.sent ? 'sent' : 'error' });
    }

    // Day 31 — renewal offer
    if (daysElapsed >= 31 && daysElapsed < 34) {
      // Set renewal_offer_expires if not already set
      if (!sub.renewal_offer_expires) {
        const expires = new Date();
        expires.setDate(expires.getDate() + 5);
        await supabaseAdmin
          .from('user_subscriptions')
          .update({ renewal_offer_expires: expires.toISOString() })
          .eq('id', sub.id);
      }

      const res = await sendEmail({
        template: 'renewal-offer',
        to: sub.email,
        subscriptionId: sub.id,
        subject: getRenewalOfferSubject(locale),
        react: RenewalOfferEmail({ locale, renewalUrl: `${BASE_URL}/api/payments/renewal-checkout?email=${encodeURIComponent(sub.email)}&locale=${locale}` }),
      });
      results.push({ email: sub.email, template: 'renewal-offer', result: res.skipped ? 'skipped' : res.sent ? 'sent' : 'error' });
    }

    // Day 34 — last chance
    if (daysElapsed >= 34 && daysElapsed < 36) {
      const res = await sendEmail({
        template: 'renewal-last-chance',
        to: sub.email,
        subscriptionId: sub.id,
        subject: getRenewalLastChanceSubject(locale),
        react: RenewalLastChanceEmail({ locale, renewalUrl: `${BASE_URL}/api/payments/renewal-checkout?email=${encodeURIComponent(sub.email)}&locale=${locale}` }),
      });
      results.push({ email: sub.email, template: 'renewal-last-chance', result: res.skipped ? 'skipped' : res.sent ? 'sent' : 'error' });
    }
  }

  return NextResponse.json({ processed: subscriptions.length, results });
}
