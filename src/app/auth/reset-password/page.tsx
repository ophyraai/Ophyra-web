'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="mb-2 text-center text-3xl font-bold">Nueva contraseña</h1>
        <p className="mb-8 text-center text-sm text-ofira-text-secondary">
          Escribe tu nueva contraseña
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Nueva contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="rounded-xl border border-ofira-card-border bg-ofira-surface1 px-4 py-3 text-sm text-ofira-text placeholder:text-ofira-text-secondary focus:border-ofira-violet focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="rounded-xl border border-ofira-card-border bg-ofira-surface1 px-4 py-3 text-sm text-ofira-text placeholder:text-ofira-text-secondary focus:border-ofira-violet focus:outline-none"
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl bg-gradient-to-r from-ofira-violet to-ofira-peach py-3 text-sm font-semibold text-white shadow-lg disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
