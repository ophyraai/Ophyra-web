import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Normaliza emails admin desde la env var ADMIN_EMAILS.
 * Duplicado de src/lib/auth/admin.ts:getAdminEmails para evitar
 * importarlo (el proxy corre en edge runtime y debe ser ligero).
 */
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session (importante: mantiene cookies de auth vivas)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate de admin: rutas /admin y /api/admin requieren un email en ADMIN_EMAILS.
  // Devolvemos 404 (no 403) para no filtrar la existencia del endpoint.
  // Esto es defense-in-depth: el layout y cada API route también deben verificar.
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith('/admin') || path.startsWith('/api/admin');

  if (isAdminRoute) {
    const allowed =
      user &&
      user.email_confirmed_at &&
      isAdminEmail(user.email);
    if (!allowed) {
      return new NextResponse('Not found', { status: 404 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
