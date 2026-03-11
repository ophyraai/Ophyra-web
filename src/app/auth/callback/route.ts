import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { resend, FROM_EMAIL } from '@/lib/resend';
import { supabaseAdmin } from '@/lib/supabase/server';
import WelcomeSignupEmail, {
  getWelcomeSignupSubject,
} from '@/lib/emails/templates/welcome-signup';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );

  let authenticated = false;

  // Method 1: PKCE code exchange (Google OAuth, login with same browser)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('[auth-callback] code exchange error:', error.message);
    } else {
      authenticated = true;
    }
  }

  // Method 2: Token hash (email confirmation opened in different browser/tab)
  if (!authenticated && token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email',
    });
    if (error) {
      console.error('[auth-callback] verifyOtp error:', error.message);
    } else {
      authenticated = true;
    }
  }

  if (authenticated) {
    await sendWelcomeIfNew(supabase, origin);
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth`);
}

async function sendWelcomeIfNew(
  supabase: ReturnType<typeof createServerClient>,
  origin: string,
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[welcome-email] No user found');
      return;
    }

    const email = user.email;
    if (!email) {
      console.log('[welcome-email] No email on user');
      return;
    }

    console.log(`[welcome-email] Checking dedup for ${email}`);

    // Dedup: check if we already sent a welcome-signup to this email
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('email_log')
      .select('id')
      .eq('email', email)
      .eq('template', 'welcome-signup')
      .limit(1)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[welcome-email] Dedup check failed:', selectError);
      return;
    }

    if (existing) {
      console.log(`[welcome-email] Already sent to ${email}, skipping`);
      return;
    }

    const name = user.user_metadata?.name || user.user_metadata?.full_name || '';
    const locale: 'es' | 'en' = 'es';

    console.log(`[welcome-email] Sending to ${email} from ${FROM_EMAIL}`);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: getWelcomeSignupSubject(locale),
      react: WelcomeSignupEmail({
        name: name || email.split('@')[0],
        locale,
        diagnosisUrl: `${origin}/diagnosis`,
        shopUrl: `${origin}/shop`,
      }),
    });

    if (error) {
      console.error('[welcome-email] Resend error:', error);
      return;
    }

    console.log(`[welcome-email] Sent successfully:`, data);

    await supabaseAdmin.from('email_log').insert({
      email,
      template: 'welcome-signup',
    });
  } catch (err) {
    console.error('[welcome-email] Unexpected error:', err);
  }
}
