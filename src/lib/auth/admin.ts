import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Lee la lista de admin emails desde la env var ADMIN_EMAILS.
 * Normaliza: split por coma, trim, lowercase, descarta vacíos.
 */
function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0);
}

/**
 * Función pura: ¿este email es admin?
 * Normaliza el email entrante (lowercase + trim) y compara contra ADMIN_EMAILS.
 * Devuelve false si email es undefined/null/vacío.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  const admins = getAdminEmails();
  return admins.includes(normalized);
}

/**
 * Server helper para rutas API admin. Verifica:
 *   1. Hay sesión (Supabase auth)
 *   2. El email del usuario está confirmado
 *   3. El email está en ADMIN_EMAILS
 *
 * Devuelve `{ user }` si todo OK, o un objeto `{ response }` con un
 * NextResponse 404 listo para devolver (404 en lugar de 403 para no
 * filtrar la existencia del endpoint).
 *
 * Uso:
 *   const auth = await requireAdmin();
 *   if ('response' in auth) return auth.response;
 *   const { user } = auth;
 */
export async function requireAdmin(): Promise<
  { user: User } | { response: NextResponse }
> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at || !isAdmin(user.email)) {
    return {
      response: NextResponse.json({ error: 'Not found' }, { status: 404 }),
    };
  }

  return { user };
}
