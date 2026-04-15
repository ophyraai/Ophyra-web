import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import AdminNav from './AdminNav';

export const metadata: Metadata = {
  title: 'Admin · Ophyra',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth #2: el middleware ya gateó la ruta, este layout también lo hace
  // (por si el middleware se desactiva o cambia la matcher).
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at || !isAdmin(user.email)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ofira-surface1">
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-8 pt-20">{children}</main>
    </div>
  );
}
