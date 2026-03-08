'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message === 'User already registered'
        ? 'Este email ya está registrado'
        : error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center"
        >
          <div className="mb-4 text-5xl">✉️</div>
          <h1 className="mb-2 text-2xl font-bold">Revisa tu email</h1>
          <p className="text-sm text-ofira-text-secondary">
            Hemos enviado un enlace de confirmación a <strong className="text-ofira-text">{email}</strong>.
            Haz clic en el enlace para activar tu cuenta.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm text-ofira-violet hover:underline"
          >
            Volver al login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-1.5 text-sm text-ofira-text-secondary hover:text-ofira-text transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Volver
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="mb-2 text-center text-3xl font-bold">Crear cuenta</h1>
        <p className="mb-8 text-center text-sm text-ofira-text-secondary">
          Guarda tus diagnósticos y accede desde cualquier dispositivo
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-xl border border-ofira-card-border bg-ofira-surface1 px-4 py-3 text-sm text-ofira-text placeholder:text-ofira-text-secondary focus:border-ofira-violet focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl border border-ofira-card-border bg-ofira-surface1 px-4 py-3 text-sm text-ofira-text placeholder:text-ofira-text-secondary focus:border-ofira-violet focus:outline-none"
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </motion.button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-ofira-card-border" />
          <span className="text-xs text-ofira-text-secondary">o</span>
          <div className="h-px flex-1 bg-ofira-card-border" />
        </div>

        <motion.button
          onClick={handleGoogleSignup}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-ofira-card-border bg-ofira-surface2 py-3 text-sm font-medium text-ofira-text transition-colors hover:border-ofira-violet/30"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </motion.button>

        <p className="mt-6 text-center text-sm text-ofira-text-secondary">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-ofira-violet hover:underline">
            Inicia sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
