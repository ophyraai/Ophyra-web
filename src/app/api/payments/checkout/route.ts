import { NextResponse } from 'next/server';
import { stripe, DIAGNOSIS_PRICE, DIAGNOSIS_CURRENCY } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/server';
import { checkRateLimit, checkoutLimiter, getClientIp } from '@/lib/security/rate-limit';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: Request) {
  const rl = await checkRateLimit(checkoutLimiter, getClientIp(req));
  if (rl) return rl;

  try {
    const { diagnosisId, email, locale } = await req.json();

    if (!diagnosisId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: diagnosisId, email' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: DIAGNOSIS_CURRENCY,
            product_data: {
              name: locale === 'es' ? 'Diagnóstico Ophyra Completo' : 'Ophyra Full Diagnosis',
              description:
                locale === 'es'
                  ? 'Análisis detallado + Plan de 30 días personalizado'
                  : 'Detailed analysis + Personalized 30-day plan',
            },
            unit_amount: DIAGNOSIS_PRICE,
          },
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/diagnosis/${diagnosisId}?unlocked=true`,
      cancel_url: `${APP_URL}/diagnosis/${diagnosisId}`,
      customer_email: email,
      metadata: { diagnosisId },
    });

    const { error } = await supabaseAdmin.from('payments').insert({
      diagnosis_id: diagnosisId,
      email,
      stripe_session_id: session.id,
      amount: DIAGNOSIS_PRICE,
      currency: DIAGNOSIS_CURRENCY,
      status: 'pending',
    });

    if (error) {
      console.error('Supabase payment insert error:', error);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
