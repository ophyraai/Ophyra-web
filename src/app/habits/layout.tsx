import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function HabitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate server-side: cualquier ruta bajo /habits requiere sesión.
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?next=/habits/select');
  }

  return <>{children}</>;
}
