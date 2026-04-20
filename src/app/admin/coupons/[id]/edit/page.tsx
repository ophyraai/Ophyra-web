import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import CouponForm from '../../CouponForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) notFound();

  return <CouponForm mode="edit" initial={data} />;
}
