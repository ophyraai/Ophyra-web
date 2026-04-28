'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailX, Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Introduce un email válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        setError('Error al procesar la solicitud');
        return;
      }

      setDone(true);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ofira-bg px-4">
      <div className="w-full max-w-md rounded-2xl border border-ofira-card-border bg-white p-8 text-center">
        {done ? (
          <>
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-emerald-100">
              <Check className="size-6 text-emerald-600" />
            </div>
            <h1 className="text-xl font-bold text-ofira-text">Te has dado de baja</h1>
            <p className="mt-2 text-sm text-ofira-text-secondary">
              No recibirás más emails de ofertas ni novedades. Si cambias de opinión, siempre puedes volver a suscribirte.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-semibold text-white hover:bg-ofira-violet/90"
            >
              Volver a Ophyra
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-ofira-surface1">
              <MailX className="size-6 text-ofira-text-secondary" />
            </div>
            <h1 className="text-xl font-bold text-ofira-text">Darse de baja</h1>
            <p className="mt-2 text-sm text-ofira-text-secondary">
              Introduce tu email para dejar de recibir comunicaciones comerciales de Ophyra.
            </p>
            <form onSubmit={handleUnsubscribe} className="mt-5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-ofira-card-border bg-white px-4 py-3 text-sm text-ofira-text placeholder:text-ofira-text-secondary/50 focus:border-ofira-violet focus:outline-none focus:ring-2 focus:ring-ofira-violet/20"
              />
              {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ofira-text px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ofira-text/90 disabled:opacity-60"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Darme de baja'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
