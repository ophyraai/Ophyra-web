import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';
import DashboardNav from './DashboardNav';
import DashboardTransition from '@/components/dashboard/DashboardTransition';

export const metadata: Metadata = {
  title: 'Mi Progreso',
  description: 'Controla tu racha de hábitos diarios y alcanza tus metas con Ophyra Diagnosis.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-ofira-surface1">
      <DashboardNav />
      <main className="mx-auto max-w-5xl px-4 py-8 pt-20">
        <DashboardTransition>
          {children}
        </DashboardTransition>
      </main>
    </div>
  );
}
