import { resend, FROM_EMAIL } from '@/lib/resend';
import { supabaseAdmin } from '@/lib/supabase/server';
import { ReactElement } from 'react';

export async function sendEmail({
  template,
  to,
  subscriptionId,
  subject,
  react,
}: {
  template: string;
  to: string;
  subscriptionId: string;
  subject: string;
  react: ReactElement;
}) {
  // Check for duplicate: same template + subscription
  const { data: existing } = await supabaseAdmin
    .from('email_log')
    .select('id')
    .eq('subscription_id', subscriptionId)
    .eq('template', template)
    .limit(1)
    .single();

  if (existing) {
    return { skipped: true };
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    react,
  });

  if (error) {
    console.error(`Failed to send email [${template}] to ${to}:`, error);
    return { error };
  }

  // Log sent email
  await supabaseAdmin.from('email_log').insert({
    email: to,
    template,
    subscription_id: subscriptionId,
  });

  // Update subscription last email info
  await supabaseAdmin
    .from('user_subscriptions')
    .update({
      last_email_type: template,
      last_email_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  return { sent: true };
}
