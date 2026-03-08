import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';

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

        // Create user subscription with 30-day follow-up
        const email = session.customer_email || session.metadata?.email;
        if (email) {
          const followUpDate = new Date();
          followUpDate.setDate(followUpDate.getDate() + 30);

          await supabaseAdmin.from('user_subscriptions').insert({
            email,
            plan: 'premium',
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
            follow_up_date: followUpDate.toISOString(),
            is_active: true,
          });
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
