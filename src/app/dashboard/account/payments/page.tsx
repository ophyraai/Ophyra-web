'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AccountNav from '@/components/dashboard/AccountNav';
import { CreditCard, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface Payment {
  id: string;
  diagnosis_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: 'text-ofira-mint', label: 'Completado' },
  pending: { icon: Clock, color: 'text-amber-500', label: 'Pendiente' },
  failed: { icon: AlertCircle, color: 'text-red-500', label: 'Fallido' },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/payments')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setPayments(data); })
      .finally(() => setLoading(false));
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
            <CreditCard className="size-5 text-ofira-violet" />
            Historial de Pagos
          </h2>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto mb-4 size-10 text-ofira-text-secondary/30" />
            <p className="text-ofira-text-secondary">No tienes pagos registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-ofira-card-border">
            {payments.map((payment, i) => {
              const config = statusConfig[payment.status] || statusConfig.pending;
              const Icon = config.icon;
              const formattedAmount = (payment.amount / 100).toFixed(2);
              const date = new Date(payment.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ofira-violet/10">
                      <CreditCard className="size-5 text-ofira-violet" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ofira-text">
                        Diagnóstico Ophyra Completo
                      </p>
                      <p className="text-xs text-ofira-text-secondary">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-ofira-text">
                      {formattedAmount} {payment.currency.toUpperCase()}
                    </span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${config.color}`}>
                      <Icon className="size-3.5" />
                      {config.label}
                    </span>
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
