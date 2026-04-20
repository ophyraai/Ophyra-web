'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface Habit {
  id: string;
  name: string;
  description: string | null;
  category: string;
  target_frequency: number;
  is_active: boolean;
  sort_order: number;
}

export interface HabitEntry {
  id: string;
  habit_id: string;
  entry_date: string;
  completed: boolean;
  notes: string | null;
}

export function useHabits(userId: string | null) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    const { data, error: dbError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('sort_order');
    if (dbError) {
      console.error('[useHabits] fetchHabits failed:', dbError);
      setError(dbError.message);
      return;
    }
    if (data) setHabits(data);
    setError(null);
  }, [userId]);

  // Fetch entries for a date range (default: last 30 days)
  const fetchEntries = useCallback(async (days = 30) => {
    if (!userId) return;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const { data, error: dbError } = await supabase
      .from('habit_entries')
      .select('*')
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .in('habit_id', habits.map(h => h.id));
    if (dbError) {
      console.error('[useHabits] fetchEntries failed:', dbError);
      setError(dbError.message);
      return;
    }
    if (data) setEntries(data);
  }, [userId, habits]);

  // Toggle entry for today
  const toggleEntry = useCallback(async (habitId: string, date: string) => {
    const existing = entries.find(e => e.habit_id === habitId && e.entry_date === date);
    if (existing) {
      await supabase
        .from('habit_entries')
        .update({ completed: !existing.completed })
        .eq('id', existing.id);
      setEntries(prev => prev.map(e =>
        e.id === existing.id ? { ...e, completed: !e.completed } : e
      ));
    } else {
      const { data } = await supabase
        .from('habit_entries')
        .insert({ habit_id: habitId, entry_date: date, completed: true })
        .select()
        .single();
      if (data) setEntries(prev => [...prev, data]);
    }
  }, [entries]);

  useEffect(() => {
    fetchHabits().then(() => setLoading(false));
  }, [fetchHabits]);

  useEffect(() => {
    if (habits.length > 0) fetchEntries();
  }, [habits, fetchEntries]);

  // Reorder habits within a category (optimistic update + persist)
  const reorderHabits = useCallback(async (category: string, newOrder: Habit[]) => {
    // Optimistic update
    setHabits(prev => {
      const otherHabits = prev.filter(h => (h.category || 'productivity') !== category);
      const reordered = newOrder.map((h, i) => ({ ...h, sort_order: i }));
      return [...otherHabits, ...reordered].sort((a, b) => {
        const catOrder = ['sleep', 'exercise', 'nutrition', 'hydration', 'stress', 'productivity'];
        const catA = catOrder.indexOf(a.category || 'productivity');
        const catB = catOrder.indexOf(b.category || 'productivity');
        if (catA !== catB) return catA - catB;
        return a.sort_order - b.sort_order;
      });
    });

    // Persist to Supabase
    const updates = newOrder.map((h, i) =>
      supabase.from('habits').update({ sort_order: i }).eq('id', h.id)
    );
    await Promise.all(updates);
  }, []);

  // Add a new custom habit
  const addHabit = useCallback(async (habit: {
    name: string;
    description?: string;
    category: string;
    target_frequency: number;
  }) => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('habits')
      .insert({
        ...habit,
        user_id: userId,
        is_active: true,
        sort_order: habits.length,
      })
      .select()
      .single();
    if (data && !error) {
      setHabits(prev => [...prev, data]);
    }
    return data;
  }, [userId, habits.length]);

  // Update an existing habit
  const updateHabit = useCallback(async (habitId: string, updates: {
    name?: string;
    description?: string;
    category?: string;
    target_frequency?: number;
  }) => {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId)
      .select()
      .single();
    if (data && !error) {
      setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...data } : h));
    }
    return data;
  }, []);

  // Soft-delete a habit
  const deleteHabit = useCallback(async (habitId: string) => {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', habitId);
    if (!error) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
    }
  }, []);

  return { habits, entries, loading, error, toggleEntry, reorderHabits, fetchHabits, fetchEntries, addHabit, updateHabit, deleteHabit };
}
