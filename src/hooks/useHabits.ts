import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitWithStats } from '../types';
import { habitService } from '../services/habit.service';
import { useAuthContext } from '../context/AuthContext';

export function useHabits() {
  const { user } = useAuthContext();
  const [habitsWithStats, setHabitsWithStats] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabitsData = useCallback(async () => {
    if (!user) {
      setHabitsWithStats([]);
      setLoading(false);
      return;
    }
    try {
      const habits = await habitService.getHabits(user.id);
      const logs = await habitService.getHabitLogs(user.id);

      const stats = habits.map(habit => habitService.getHabitWithStats(habit, logs));
      setHabitsWithStats(stats);
    } catch (err) {
      console.error('Failed to fetch habits data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHabitsData();
  }, [fetchHabitsData]);

  const createHabit = async (habitData: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const habit = await habitService.createHabit({ ...habitData, user_id: user.id });
    await fetchHabitsData();
    return habit;
  };

  const deleteHabit = async (habitId: string) => {
    const success = await habitService.deleteHabit(habitId);
    await fetchHabitsData();
    return success;
  };

  const toggleHabitToday = async (habitId: string, targetValue?: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    await habitService.toggleHabitLog(user.id, habitId, today, targetValue);
    await fetchHabitsData();
  };

  const toggleHabitForDate = async (habitId: string, date: string, targetValue?: number) => {
    if (!user) return;
    await habitService.toggleHabitLog(user.id, habitId, date, targetValue);
    await fetchHabitsData();
  };

  return {
    habitsWithStats,
    loading,
    refreshHabits: fetchHabitsData,
    createHabit,
    deleteHabit,
    toggleHabitToday,
    toggleHabitForDate
  };
}
