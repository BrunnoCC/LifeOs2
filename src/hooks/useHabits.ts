import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitWithStats } from '../types';
import { habitService } from '../services/habit.service';
import { useAuthContext } from '../context/AuthContext';

export function useHabits() {
  const { user } = useAuthContext();
  const [habitsWithStats, setHabitsWithStats] = useState<HabitWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabitsData = useCallback(() => {
    if (!user) {
      setHabitsWithStats([]);
      setLoading(false);
      return;
    }
    const habits = habitService.getHabits(user.id);
    const logs = habitService.getHabitLogs(user.id);

    const stats = habits.map(habit => habitService.getHabitWithStats(habit, logs));
    setHabitsWithStats(stats);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHabitsData();
  }, [fetchHabitsData]);

  const createHabit = (habitData: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const habit = habitService.createHabit({ ...habitData, user_id: user.id });
    fetchHabitsData();
    return habit;
  };

  const deleteHabit = (habitId: string) => {
    const success = habitService.deleteHabit(habitId);
    fetchHabitsData();
    return success;
  };

  const toggleHabitToday = (habitId: string, targetValue?: number) => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    habitService.toggleHabitLog(user.id, habitId, today, targetValue);
    fetchHabitsData();
  };

  const toggleHabitForDate = (habitId: string, date: string, targetValue?: number) => {
    if (!user) return;
    habitService.toggleHabitLog(user.id, habitId, date, targetValue);
    fetchHabitsData();
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
