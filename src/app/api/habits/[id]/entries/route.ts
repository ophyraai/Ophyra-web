import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: habitId } = await params;
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the habit belongs to the user
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habitId)
    .eq('user_id', user.id)
    .single();

  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Fetch entries for this habit (last 90 days)
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const { data, error } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('habit_id', habitId)
    .gte('entry_date', startDate.toISOString().split('T')[0])
    .order('entry_date', { ascending: false });

  if (error) { console.error('Habit entries error:', error); return NextResponse.json({ error: 'Operation failed' }, { status: 500 }); }
  return NextResponse.json(data);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: habitId } = await params;
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the habit belongs to the user
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habitId)
    .eq('user_id', user.id)
    .single();

  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { entry_date, completed, notes } = body;

  // Check if entry already exists for this date
  const { data: existing } = await supabase
    .from('habit_entries')
    .select('*')
    .eq('habit_id', habitId)
    .eq('entry_date', entry_date)
    .single();

  if (existing) {
    // Toggle the entry
    const { data, error } = await supabase
      .from('habit_entries')
      .update({ completed: completed ?? !existing.completed, notes })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) { console.error('Habit entries error:', error); return NextResponse.json({ error: 'Operation failed' }, { status: 500 }); }
    return NextResponse.json(data);
  }

  // Create new entry
  const { data, error } = await supabase
    .from('habit_entries')
    .insert({
      habit_id: habitId,
      entry_date,
      completed: completed ?? true,
      notes,
    })
    .select()
    .single();

  if (error) { console.error('Habit entries error:', error); return NextResponse.json({ error: 'Operation failed' }, { status: 500 }); }
  return NextResponse.json(data, { status: 201 });
}
