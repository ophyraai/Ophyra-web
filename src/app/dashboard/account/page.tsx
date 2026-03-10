'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import AccountNav from '@/components/dashboard/AccountNav';
import { User, Crown, BarChart3, Calendar, LogOut } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  locale: string;
  avatar_url: string | null;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [diagCount, setDiagCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const { isPremium, followUpDate } = useSubscription(userId);

  useEffect(() => {
    if (!userId) return;
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => { if (data.id) setProfile(data); })
      .finally(() => setLoading(false));

    supabase
      .from('diagnoses')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setDiagCount(count ?? 0));
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

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

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() || '?';

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    : '';

  const daysUsingApp = profile?.created_at
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      <AccountNav />

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated p-6"
      >
        <div className="flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ofira-violet to-ofira-mint text-2xl font-bold text-white">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-ofira-text">
              {profile?.name || 'Sin nombre'}
            </h2>
            <p className="text-sm text-ofira-text-secondary">{profile?.email}</p>
            <p className="mt-1 text-xs text-ofira-text-secondary">
              Miembro desde {memberSince}
            </p>
          </div>
          <Link
            href="/dashboard/account/profile"
            className="rounded-lg border border-ofira-card-border px-4 py-2 text-sm font-medium text-ofira-text-secondary transition-colors hover:bg-ofira-surface1 hover:text-ofira-text"
          >
            Editar
          </Link>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card-elevated card-hover p-5 text-center"
        >
          <Crown className={`mx-auto mb-2 size-5 ${isPremium ? 'text-ofira-violet' : 'text-ofira-text-secondary'}`} />
          <p className="text-lg font-bold text-ofira-text">{isPremium ? 'Premium' : 'Free'}</p>
          <p className="text-xs text-ofira-text-secondary">Plan</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-elevated card-hover p-5 text-center"
        >
          <BarChart3 className="mx-auto mb-2 size-5 text-ofira-mint" />
          <p className="text-lg font-bold text-ofira-text">{diagCount}</p>
          <p className="text-xs text-ofira-text-secondary">Diagnósticos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-elevated card-hover p-5 text-center"
        >
          <Calendar className="mx-auto mb-2 size-5 text-ofira-peach" />
          <p className="text-lg font-bold text-ofira-text">{daysUsingApp}</p>
          <p className="text-xs text-ofira-text-secondary">Días en Ophyra</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated card-hover p-5 text-center"
        >
          <User className="mx-auto mb-2 size-5 text-ofira-violet" />
          <p className="text-lg font-bold text-ofira-text">{profile?.locale === 'es' ? 'ES' : 'EN'}</p>
          <p className="text-xs text-ofira-text-secondary">Idioma</p>
        </motion.div>
      </div>

      {/* Subscription status */}
      {isPremium && followUpDate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-elevated flex items-center justify-between p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ofira-violet/10">
              <Crown className="size-5 text-ofira-violet" />
            </div>
            <div>
              <p className="font-semibold text-ofira-text">Plan Premium activo</p>
              <p className="text-sm text-ofira-text-secondary">
                Próximo seguimiento: {new Date(followUpDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/account/payments"
            className="text-sm font-medium text-ofira-violet hover:underline"
          >
            Ver pagos
          </Link>
        </motion.div>
      )}

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-5 py-3.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </button>
      </motion.div>
    </div>
  );
}
