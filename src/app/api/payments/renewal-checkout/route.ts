import { NextResponse } from 'next/server';
import { stripe, DIAGNOSIS_PRICE, DIAGNOSIS_CURRENCY } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';

const RENEWAL_PRICE = 499; // €4.99 in cents
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ophyra.com';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const locale = searchParams.get('locale') || 'es';

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Find active subscription for this email
  const { data: sub } = await supabaseAdmin
    .from('user_subscriptions')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single();

  if (!sub) {
    return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
  }

  // Determine price: discounted if renewal offer hasn't expired
  const now = new Date();
  const offerValid = sub.renewal_offer_expires && new Date(sub.renewal_offer_expires) > now;
  const price = offerValid ? RENEWAL_PRICE : DIAGNOSIS_PRICE;

  const productName = locale === 'es'
    ? `Ophyra — Renovación Plan 30 días${offerValid ? ' (50% off)' : ''}`
    : `Ophyra — 30-Day Plan Renewal${offerValid ? ' (50% off)' : ''}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: DIAGNOSIS_CURRENCY,
          product_data: { name: productName },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${BASE_URL}/dashboard?renewed=true`,
    cancel_url: `${BASE_URL}/dashboard`,
    metadata: {
      type: 'renewal',
      email,
      subscriptionId: sub.id,
      locale,
    },
  });

  return NextResponse.redirect(session.url!);
}
