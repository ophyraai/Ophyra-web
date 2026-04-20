import { supabaseAdmin } from '@/lib/supabase/server';

interface HabitExport {
  name: string;
  description: string | null;
  category: string | null;
  target_frequency: string | null;
  is_active: boolean;
  entries: Array<{
    entry_date: string;
    completed: boolean;
    notes: string | null;
  }>;
}

interface UserDataExport {
  exported_at: string;
  user: {
    email: string;
    name: string | null;
    locale: string;
    created_at: string;
  };
  diagnoses: Array<{
    id: string;
    answers: unknown;
    scores: unknown;
    overall_score: number | null;
    ai_analysis: string | null;
    ai_summary: string | null;
    photo_urls: string[] | null;
    is_paid: boolean;
    created_at: string;
  }>;
  habits: HabitExport[];
  subscriptions: Array<{
    plan: string;
    started_at: string | null;
    expires_at: string | null;
    is_active: boolean;
  }>;
  orders: Array<{
    id: string;
    status: string;
    total_cents: number;
    currency: string;
    items: Array<{
      name_snapshot: string;
      quantity: number;
      unit_price_cents: number;
    }>;
    paid_at: string | null;
    created_at: string;
  }>;
}

/**
 * Exports all user data for GDPR Art. 20 (Right to Data Portability).
 * Returns a structured JSON object with all personal data.
 * Excludes internal IDs (Stripe customer/session/payment intent IDs).
 */
export async function exportUserData(authId: string): Promise<UserDataExport | null> {
  // 1. Look up user profile
  const { data: userRecord } = await supabaseAdmin
    .from('users')
    .select('email, name, locale, created_at')
    .eq('auth_id', authId)
    .single();

  if (!userRecord) return null;

  const email = userRecord.email;

  // 2. Diagnoses
  const { data: diagnoses } = await supabaseAdmin
    .from('diagnoses')
    .select('id, answers, scores, overall_score, ai_analysis, ai_summary, photo_urls, is_paid, created_at')
    .or(`user_id.in.(select id from users where auth_id='${authId}'),email.eq.${email}`)
    .order('created_at', { ascending: false });

  // Fallback: query by looking up user_id first
  let diagnosisData = diagnoses;
  if (!diagnosisData) {
    const { data: userIdRecord } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_id', authId)
      .single();

    if (userIdRecord) {
      const { data } = await supabaseAdmin
        .from('diagnoses')
        .select('id, answers, scores, overall_score, ai_analysis, ai_summary, photo_urls, is_paid, created_at')
        .or(`user_id.eq.${userIdRecord.id},email.eq.${email}`)
        .order('created_at', { ascending: false });
      diagnosisData = data;
    }
  }

  // 3. Habits with entries
  const { data: habits } = await supabaseAdmin
    .from('habits')
    .select('id, name, description, category, target_frequency, is_active')
    .eq('user_id', authId);

  const habitsExport: HabitExport[] = [];
  if (habits) {
    for (const habit of habits) {
      const { data: entries } = await supabaseAdmin
        .from('habit_entries')
        .select('entry_date, completed, notes')
        .eq('habit_id', habit.id)
        .order('entry_date', { ascending: false });

      habitsExport.push({
        name: habit.name,
        description: habit.description,
        category: habit.category,
        target_frequency: habit.target_frequency,
        is_active: habit.is_active,
        entries: entries ?? [],
      });
    }
  }

  // 4. Subscriptions (exclude Stripe internal IDs)
  const { data: subscriptions } = await supabaseAdmin
    .from('user_subscriptions')
    .select('plan, started_at, expires_at, is_active')
    .or(`user_id.eq.${authId},email.eq.${email}`);

  // 5. Orders with items (exclude Stripe internal IDs)
  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('id, status, total_cents, currency, paid_at, created_at')
    .or(`user_id.eq.${authId},email.eq.${email}`)
    .order('created_at', { ascending: false });

  const ordersExport = [];
  if (orders) {
    for (const order of orders) {
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('name_snapshot, quantity, unit_price_cents')
        .eq('order_id', order.id);

      ordersExport.push({
        ...order,
        items: items ?? [],
      });
    }
  }

  return {
    exported_at: new Date().toISOString(),
    user: userRecord,
    diagnoses: diagnosisData ?? [],
    habits: habitsExport,
    subscriptions: subscriptions ?? [],
    orders: ordersExport,
  };
}
