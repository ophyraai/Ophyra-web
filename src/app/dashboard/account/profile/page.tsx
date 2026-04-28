'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import AccountNav from '@/components/dashboard/AccountNav';
import { Save, Loader2, CheckCircle2, Lock, AlertCircle, Bell, BellOff } from 'lucide-react';

interface UserProfile {
  name: string | null;
  email: string;
  locale: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [locale, setLocale] = useState('es');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Newsletter
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<boolean | null>(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => {
        if (data.id) {
          setProfile(data);
          setName(data.name || '');
          setLocale(data.locale || 'es');
          // Check newsletter status
          fetch('/api/newsletter/status')
            .then(r => r.json())
            .then(d => setNewsletterSubscribed(d.subscribed))
            .catch(() => setNewsletterSubscribed(false));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, locale }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Introduce tu contraseña actual');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    setPasswordSaving(true);
    setPasswordSaved(false);

    // Step 1: Verify current password by re-authenticating
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      setPasswordError('La contraseña actual es incorrecta');
      setPasswordSaving(false);
      return;
    }

    // Step 2: Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setPasswordError(updateError.message);
    } else {
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    }
    setPasswordSaving(false);
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

  return (
    <div className="space-y-6">
      <AccountNav />

      {/* Edit profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated p-6"
      >
        <h2 className="mb-6 text-lg font-bold text-ofira-text">Editar Perfil</h2>

        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ofira-text">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-ofira-card-border bg-ofira-surface1 px-4 py-2.5 text-sm text-ofira-text placeholder:text-ofira-text-secondary/50 focus:border-ofira-violet focus:outline-none focus:ring-1 focus:ring-ofira-violet"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ofira-text">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-ofira-card-border bg-ofira-surface2 px-4 py-2.5 text-sm text-ofira-text-secondary"
            />
            <p className="mt-1 text-xs text-ofira-text-secondary">
              El email no se puede cambiar desde aquí por seguridad
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ofira-text">Idioma</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full rounded-lg border border-ofira-card-border bg-ofira-surface1 px-4 py-2.5 text-sm text-ofira-text focus:border-ofira-violet focus:outline-none focus:ring-1 focus:ring-ofira-violet"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ofira-violet/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Guardar cambios
            </button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-sm text-ofira-mint"
              >
                <CheckCircle2 className="size-4" /> Guardado
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Change password */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-elevated p-6"
      >
        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-ofira-text">
          <Lock className="size-5 text-ofira-violet" />
          Cambiar Contraseña
        </h2>

        <div className="space-y-5">
          {/* Current password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ofira-text">
              Contraseña actual
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(''); }}
              placeholder="Introduce tu contraseña actual"
              className="w-full rounded-lg border border-ofira-card-border bg-ofira-surface1 px-4 py-2.5 text-sm text-ofira-text placeholder:text-ofira-text-secondary/50 focus:border-ofira-violet focus:outline-none focus:ring-1 focus:ring-ofira-violet"
            />
          </div>

          {/* New password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ofira-text">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border border-ofira-card-border bg-ofira-surface1 px-4 py-2.5 text-sm text-ofira-text placeholder:text-ofira-text-secondary/50 focus:border-ofira-violet focus:outline-none focus:ring-1 focus:ring-ofira-violet"
            />
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ofira-text">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
              placeholder="Repite la nueva contraseña"
              className="w-full rounded-lg border border-ofira-card-border bg-ofira-surface1 px-4 py-2.5 text-sm text-ofira-text placeholder:text-ofira-text-secondary/50 focus:border-ofira-violet focus:outline-none focus:ring-1 focus:ring-ofira-violet"
            />
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="size-4 shrink-0" />
              {passwordError}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-ofira-violet px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ofira-violet/90 disabled:opacity-50"
            >
              {passwordSaving ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              Cambiar contraseña
            </button>
            {passwordSaved && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1 text-sm text-ofira-mint"
              >
                <CheckCircle2 className="size-4" /> Contraseña actualizada
              </motion.span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Newsletter / Communications */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-elevated p-6"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-ofira-text">
          <Bell className="size-5 text-ofira-violet" />
          Comunicaciones
        </h2>

        <div className="flex items-center justify-between rounded-lg border border-ofira-card-border bg-ofira-surface1 p-4">
          <div>
            <p className="text-sm font-medium text-ofira-text">Ofertas y novedades por email</p>
            <p className="mt-0.5 text-xs text-ofira-text-secondary">
              {newsletterSubscribed
                ? 'Recibes emails con ofertas exclusivas y novedades.'
                : 'No estás suscrito a comunicaciones comerciales.'}
            </p>
          </div>
          <button
            type="button"
            disabled={newsletterLoading || newsletterSubscribed === null}
            onClick={async () => {
              if (!profile?.email) return;
              setNewsletterLoading(true);
              try {
                if (newsletterSubscribed) {
                  await fetch('/api/newsletter/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: profile.email }),
                  });
                  setNewsletterSubscribed(false);
                } else {
                  await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: profile.email }),
                  });
                  setNewsletterSubscribed(true);
                }
              } catch {}
              setNewsletterLoading(false);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
              newsletterSubscribed ? 'bg-ofira-violet' : 'bg-ofira-surface2'
            }`}
          >
            <span
              className={`inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform ${
                newsletterSubscribed ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
