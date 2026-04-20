'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2, AlertTriangle } from 'lucide-react';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 12; // 12 × 5s = 60s

export default function AnalysisPendingState() {
  const t = useTranslations('results.analysisPending');
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Polling: cada 5s pedimos un refresh del RSC. Si en el server
    // ai_analysis ya existe, el re-render monta las secciones normales y
    // este componente desmonta (limpiando el intervalo).
    const interval = setInterval(() => {
      setAttempts((n) => {
        const next = n + 1;
        if (next >= MAX_POLL_ATTEMPTS) {
          clearInterval(interval);
          return next;
        }
        router.refresh();
        return next;
      });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router]);

  const tookTooLong = attempts >= MAX_POLL_ATTEMPTS;

  return (
    <div className="mb-8 flex flex-col items-center rounded-xl border border-[rgba(13,148,136,0.08)] bg-ofira-surface1 p-10 text-center">
      {tookTooLong ? (
        <>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="size-7 text-amber-600" />
          </div>
          <p className="max-w-md text-sm text-ofira-text-secondary">
            {t('tookTooLong')}
          </p>
        </>
      ) : (
        <>
          <Loader2 className="mb-4 size-10 animate-spin text-ofira-violet" />
          <h2 className="mb-2 text-lg font-semibold text-ofira-text">
            {t('title')}
          </h2>
          <p className="max-w-md text-sm text-ofira-text-secondary">
            {t('subtitle')}
          </p>
        </>
      )}
    </div>
  );
}
