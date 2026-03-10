'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import AccountNav from '@/components/dashboard/AccountNav';
import { FileText, ExternalLink, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';

interface Diagnosis {
  id: string;
  overall_score: number | null;
  is_paid: boolean;
  created_at: string;
}

export default function DiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('diagnoses')
      .select('id, overall_score, is_paid, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setDiagnoses(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AccountNav />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ofira-violet border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AccountNav />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated overflow-hidden"
      >
        <div className="border-b border-ofira-card-border p-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ofira-text">
            <FileText className="size-5 text-ofira-violet" />
            Mis Diagnósticos
          </h2>
        </div>

        {diagnoses.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto mb-4 size-10 text-ofira-text-secondary/30" />
            <p className="mb-4 text-ofira-text-secondary">
              No has realizado ningún diagnóstico todavía
            </p>
            <Link
              href="/diagnosis"
              className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-medium text-white hover:bg-ofira-violet/90"
            >
              Hacer mi primer diagnóstico
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ofira-card-border">
            {diagnoses.map((diag, i) => {
              const date = new Date(diag.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const scoreColor =
                (diag.overall_score ?? 0) >= 70
                  ? 'text-ofira-mint'
                  : (diag.overall_score ?? 0) >= 40
                    ? 'text-amber-500'
                    : 'text-red-400';

              return (
                <motion.div
                  key={diag.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      diag.is_paid ? 'bg-ofira-violet/10' : 'bg-ofira-surface2'
                    }`}>
                      {diag.is_paid ? (
                        <Unlock className="size-5 text-ofira-violet" />
                      ) : (
                        <Lock className="size-5 text-ofira-text-secondary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ofira-text">
                        Diagnóstico {diag.is_paid ? 'Completo' : 'Básico'}
                      </p>
                      <p className="text-xs text-ofira-text-secondary">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {diag.overall_score !== null && (
                      <span className={`text-lg font-bold ${scoreColor}`}>
                        {diag.overall_score}/100
                      </span>
                    )}
                    <Link
                      href={`/diagnosis/${diag.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-ofira-violet hover:underline"
                    >
                      Ver <ExternalLink className="size-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
