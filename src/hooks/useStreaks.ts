'use client';
import { useMemo } from 'react';
import type { Habit, HabitEntry } from './useHabits';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  weeklyRate: number;
}

export function useStreaks(habits: Habit[], entries: HabitEntry[]): StreakData {
  return useMemo(() => {
    if (habits.length === 0) {
      return { currentStreak: 0, longestStreak: 0, completionRate: 0, weeklyRate: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Group entries by date
    const entriesByDate = new Map<string, HabitEntry[]>();
    for (const entry of entries) {
      const existing = entriesByDate.get(entry.entry_date) || [];
      existing.push(entry);
      entriesByDate.set(entry.entry_date, existing);
    }

    // Calculate current streak: consecutive days with at least 1 completed habit
    let currentStreak = 0;
    const checkDate = new Date(today);
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const dayEntries = entriesByDate.get(dateStr) || [];
      const hasCompleted = dayEntries.some(e => e.completed);

      if (hasCompleted) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no entries yet, check if yesterday starts a streak
        if (dateStr === todayStr && currentStreak === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    // Calculate longest streak from all available data
    const allDates = Array.from(entriesByDate.keys()).sort();
    let longestStreak = 0;
    let tempStreak = 0;

    if (allDates.length > 0) {
      const startDate = new Date(allDates[0]);
      const endDate = new Date(allDates[allDates.length - 1]);
      const iterDate = new Date(startDate);

      while (iterDate <= endDate) {
        const dateStr = iterDate.toISOString().split('T')[0];
        const dayEntries = entriesByDate.get(dateStr) || [];
        const hasCompleted = dayEntries.some(e => e.completed);

        if (hasCompleted) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
        iterDate.setDate(iterDate.getDate() + 1);
      }
    }

    longestStreak = Math.max(longestStreak, currentStreak);

    // Today's completion rate
    const todayEntries = entriesByDate.get(todayStr) || [];
    const completedToday = todayEntries.filter(e => e.completed).length;
    const completionRate = habits.length > 0
      ? Math.round((completedToday / habits.length) * 100)
      : 0;

    // Weekly completion rate (last 7 days)
    let weeklyCompleted = 0;
    let weeklyTotal = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = entriesByDate.get(dateStr) || [];
      weeklyCompleted += dayEntries.filter(e => e.completed).length;
      weeklyTotal += habits.length;
    }
    const weeklyRate = weeklyTotal > 0
      ? Math.round((weeklyCompleted / weeklyTotal) * 100)
      : 0;

    return { currentStreak, longestStreak, completionRate, weeklyRate };
  }, [habits, entries]);
}
