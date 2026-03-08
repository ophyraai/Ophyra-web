import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET() {
  // Try to fetch today's tip
  let tip = null;
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabaseAdmin
      .from('daily_tips')
      .select('content_es, content_en, category')
      .lte('tip_date', today)
      .order('tip_date', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      tip = { content_es: data.content_es, content_en: data.content_en, category: data.category };
    }
  } catch {
    // Fallback tip
  }

  return NextResponse.json({
    followers: 90000,
    diagnoses: 2847,
    countries: 15,
    tip: tip || {
      content_es: 'Beber un vaso de agua al despertar activa tu metabolismo.',
      content_en: 'Drinking a glass of water upon waking activates your metabolism.',
      category: 'hydration',
    },
  });
}
