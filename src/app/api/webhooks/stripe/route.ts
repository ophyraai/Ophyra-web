import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/emails/send';
import WelcomeEmail, { getWelcomeSubject } from '@/lib/emails/templates/welcome';
import Stripe from 'stripe';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const isRenewal = session.metadata?.type === 'renewal';

      if (isRenewal) {
        // Handle renewal payment
        const email = session.metadata?.email;
        const subscriptionId = session.metadata?.subscriptionId;
        const locale = (session.metadata?.locale as 'es' | 'en') || 'es';

        if (email && subscriptionId) {
          const now = new Date();
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + 30);

          const { data: existingSub } = await supabaseAdmin
            .from('user_subscriptions')
            .select('free_reports, renewal_count')
            .eq('id', subscriptionId)
            .single();

          await supabaseAdmin
            .from('user_subscriptions')
            .update({
              started_at: now.toISOString(),
              follow_up_date: followUpDate.toISOString(),
              free_reports: (existingSub?.free_reports ?? 0) + 1,
              renewal_count: (existingSub?.renewal_count ?? 0) + 1,
              renewal_offer_expires: null,
              updated_at: now.toISOString(),
            })
            .eq('id', subscriptionId);

          // Get user name for welcome email
          const { data: diagnosis } = await supabaseAdmin
            .from('diagnoses')
            .select('answers')
            .eq('email', email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const name = diagnosis?.answers?.name || email.split('@')[0];

          await sendEmail({
            template: 'welcome-renewal',
            to: email,
            subscriptionId,
            subject: getWelcomeSubject(locale),
            react: WelcomeEmail({ name, locale, dashboardUrl: `${BASE_URL}/dashboard` }),
          });
        }
      } else {
        // Handle initial purchase
        const diagnosisId = session.metadata?.diagnosisId;

        if (diagnosisId) {
          await supabaseAdmin
            .from('diagnoses')
            .update({
              is_paid: true,
              stripe_session_id: session.id,
            })
            .eq('id', diagnosisId);

          await supabaseAdmin
            .from('payments')
            .update({ status: 'completed' })
            .eq('stripe_session_id', session.id);

          // Create or update user subscription with 30-day follow-up + 1 free report
          const email = session.customer_email || session.metadata?.email;
          const locale = (session.metadata?.locale as 'es' | 'en') || 'es';

          if (email) {
            const now = new Date();
            const followUpDate = new Date();
            followUpDate.setDate(followUpDate.getDate() + 30);

            // Check if subscription already exists for this email
            const { data: existingSub } = await supabaseAdmin
              .from('user_subscriptions')
              .select('id, free_reports')
              .eq('email', email)
              .eq('is_active', true)
              .single();

            let subId: string;

            if (existingSub) {
              subId = existingSub.id;
              await supabaseAdmin
                .from('user_subscriptions')
                .update({
                  plan: 'premium',
                  follow_up_date: followUpDate.toISOString(),
                  free_reports: (existingSub.free_reports ?? 0) + 1,
                  started_at: now.toISOString(),
                  updated_at: now.toISOString(),
                })
                .eq('id', existingSub.id);
            } else {
              const { data: newSub } = await supabaseAdmin
                .from('user_subscriptions')
                .insert({
                  email,
                  plan: 'premium',
                  stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
                  follow_up_date: followUpDate.toISOString(),
                  is_active: true,
                  free_reports: 1,
                  started_at: now.toISOString(),
                })
                .select('id')
                .single();
              subId = newSub?.id;
            }

            // Send welcome email
            if (subId) {
              const { data: diagnosis } = await supabaseAdmin
                .from('diagnoses')
                .select('answers')
                .eq('id', diagnosisId)
                .single();

              const name = diagnosis?.answers?.name || email.split('@')[0];

              await sendEmail({
                template: 'welcome',
                to: email,
                subscriptionId: subId,
                subject: getWelcomeSubject(locale),
                react: WelcomeEmail({ name, locale, dashboardUrl: `${BASE_URL}/dashboard` }),
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Stripe webhook handler error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
