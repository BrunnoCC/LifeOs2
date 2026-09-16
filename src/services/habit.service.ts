import type { Habit, HabitLog, HabitWithStats } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const habitService = {
  async getHabits(userId: string): Promise<Habit[]> {
    if (!isSupabaseConfigured()) {
      const habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
      return habits.filter(h => h.user_id === userId && !h.archived);
    }

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((h: any) => ({
        id: h.id,
        user_id: h.user_id,
        name: h.name,
        description: h.description || undefined,
        frequency: h.frequency || 'daily',
        weekly_target: h.weekly_target || undefined,
        days_of_week: h.days_of_week || [0, 1, 2, 3, 4, 5, 6],
        target_value: h.target_value || 1,
        unit: h.unit || 'vezes',
        time: h.time || undefined,
        category: h.category || undefined,
        color: h.color || '#34d399',
        archived: h.archived || false,
        created_at: h.created_at
      }));
    } catch (err) {
      console.error('Error fetching habits:', err);
      return [];
    }
  },

  async getHabitLogs(userId: string): Promise<HabitLog[]> {
    if (!isSupabaseConfigured()) {
      const logs = getStorageItem<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, []);
      return logs.filter(l => l.user_id === userId);
    }

    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) return [];
      return data.map((l: any) => ({
        id: l.id,
        habit_id: l.habit_id,
        user_id: l.user_id,
        date: l.date,
        value: l.value,
        completed: l.completed,
        created_at: l.created_at
      }));
    } catch (err) {
      console.error('Error fetching habit logs:', err);
      return [];
    }
  },

  async createHabit(habitData: Omit<Habit, 'id' | 'created_at'>): Promise<Habit> {
    if (!isSupabaseConfigured()) {
      const habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
      const newHabit: Habit = {
        ...habitData,
        id: `habit-${Date.now()}`,
        created_at: new Date().toISOString()
      };

      habits.push(newHabit);
      setStorageItem(STORAGE_KEYS.HABITS, habits);
      return newHabit;
    }

    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: habitData.user_id,
        name: habitData.name,
        description: habitData.description,
        frequency: habitData.frequency,
        weekly_target: habitData.weekly_target,
        days_of_week: habitData.days_of_week,
        target_value: habitData.target_value,
        unit: habitData.unit,
        time: habitData.time,
        category: habitData.category,
        color: habitData.color,
        archived: habitData.archived || false
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Erro ao criar hábito');

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || undefined,
      frequency: data.frequency,
      weekly_target: data.weekly_target || undefined,
      days_of_week: data.days_of_week || [0, 1, 2, 3, 4, 5, 6],
      target_value: data.target_value,
      unit: data.unit,
      time: data.time || undefined,
      category: data.category || undefined,
      color: data.color,
      archived: data.archived,
      created_at: data.created_at
    };
  },

  async deleteHabit(habitId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
      const initialLen = habits.length;
      habits = habits.filter(h => h.id !== habitId);

      if (habits.length !== initialLen) {
        setStorageItem(STORAGE_KEYS.HABITS, habits);
        let logs = getStorageItem<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, []);
        logs = logs.filter(l => l.habit_id !== habitId);
        setStorageItem(STORAGE_KEYS.HABIT_LOGS, logs);
        return true;
      }
      return false;
    }

    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    return !error;
  },

  async toggleHabitLog(userId: string, habitId: string, date: string, targetValue: number = 1): Promise<{ log: HabitLog | null; completed: boolean }> {
    if (!isSupabaseConfigured()) {
      let logs = getStorageItem<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, []);
      const existingIndex = logs.findIndex(l => l.user_id === userId && l.habit_id === habitId && l.date === date);

      if (existingIndex !== -1) {
        logs.splice(existingIndex, 1);
        setStorageItem(STORAGE_KEYS.HABIT_LOGS, logs);
        return { log: null, completed: false };
      } else {
        const newLog: HabitLog = {
          id: `hlog-${Date.now()}`,
          habit_id: habitId,
          user_id: userId,
          date,
          value: targetValue,
          completed: true,
          created_at: new Date().toISOString()
        };
        logs.push(newLog);
        setStorageItem(STORAGE_KEYS.HABIT_LOGS, logs);
        return { log: newLog, completed: true };
      }
    }

    const { data: existing } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('habit_id', habitId)
      .eq('date', date)
      .single();

    if (existing) {
      await supabase.from('habit_logs').delete().eq('id', existing.id);
      return { log: null, completed: false };
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({
          user_id: userId,
          habit_id: habitId,
          date,
          value: targetValue,
          completed: true
        })
        .select()
        .single();

      if (error || !data) return { log: null, completed: false };
      return {
        log: {
          id: data.id,
          habit_id: data.habit_id,
          user_id: data.user_id,
          date: data.date,
          value: data.value,
          completed: data.completed,
          created_at: data.created_at
        },
        completed: true
      };
    }
  },

  getHabitWithStats(habit: Habit, allLogs: HabitLog[]): HabitWithStats {
    const habitLogs = allLogs.filter(l => l.habit_id === habit.id && l.completed);
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habitLogs.some(l => l.date === today);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyCompletionsCount = habitLogs.filter(l => {
      const logDate = new Date(l.date + 'T00:00:00');
      return logDate >= startOfWeek;
    }).length;

    const dates = Array.from(new Set(habitLogs.map(l => l.date))).sort();

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    if (dates.length > 0) {
      let checkDate = new Date(now);
      let checkStr = checkDate.toISOString().split('T')[0];
      if (!dates.includes(checkStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      }

      while (dates.includes(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toISOString().split('T')[0];
      }

      for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
          tempStreak = 1;
        } else {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        }
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      }
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    const totalDaysTracked = Math.max(dates.length, 1);
    const completionRate = Math.min(Math.round((dates.length / Math.max(totalDaysTracked, 30)) * 100), 100);

    return {
      ...habit,
      currentStreak,
      bestStreak,
      completionRate,
      completedToday,
      todayLogValue: completedToday ? habit.target_value : 0,
      weeklyCompletionsCount,
      logs: habitLogs
    };
  }
};
