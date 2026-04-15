import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * Marca un evento de webhook como procesado.
 *
 * Devuelve `true` si el evento es nuevo (procesar), `false` si ya fue
 * procesado anteriormente (short-circuit, devolver 200 al caller).
 *
 * Implementado con INSERT ... ON CONFLICT DO NOTHING usando la clave
 * primaria de webhook_events. La tabla está en migration 007.
 *
 * Uso típico en un handler de webhook:
 *
 *   const fresh = await markEventProcessed(event.id, event.type);
 *   if (!fresh) return NextResponse.json({ received: true });
 *   // ... procesar normalmente ...
 */
export async function markEventProcessed(
  eventId: string,
  type: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('webhook_events')
    .insert({ id: eventId, type })
    .select('id')
    .maybeSingle();

  if (error) {
    // Postgres unique violation = duplicate event = ya procesado
    // (PostgREST devuelve code '23505' para unique_violation)
    if (error.code === '23505') {
      return false;
    }
    // Otros errores: log y trata como fresh para no perder eventos.
    // (mejor procesar dos veces que perder uno; las ramas downstream
    //  deben ser idempotentes para que esto sea seguro).
    console.error('webhook idempotency check failed:', error);
    return true;
  }

  return data !== null;
}
