import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/server';
import ProductForm from '../../ProductForm';
import type { AdminProduct } from '@/types/marketplace';

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function EditProductPage(props: Props) {
  const { id } = await props.params;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    notFound();
  }

  return <ProductForm mode="edit" initial={data as AdminProduct} />;
}
