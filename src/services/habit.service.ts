import type { Habit, HabitLog, HabitWithStats } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';

export const habitService = {
  getHabits(userId: string): Habit[] {
    const habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
    return habits.filter(h => h.user_id === userId && !h.archived);
  },

  getHabitLogs(userId: string): HabitLog[] {
    const logs = getStorageItem<HabitLog[]>(STORAGE_KEYS.HABIT_LOGS, []);
    return logs.filter(l => l.user_id === userId);
  },

  createHabit(habitData: Omit<Habit, 'id' | 'created_at'>): Habit {
    const habits = getStorageItem<Habit[]>(STORAGE_KEYS.HABITS, []);
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      created_at: new Date().toISOString()
    };

    habits.push(newHabit);
    setStorageItem(STORAGE_KEYS.HABITS, habits);
    return newHabit;
  },

  deleteHabit(habitId: string): boolean {
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
  },

  toggleHabitLog(userId: string, habitId: string, date: string, targetValue: number = 1): { log: HabitLog | null; completed: boolean } {
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
  },

  getHabitWithStats(habit: Habit, allLogs: HabitLog[]): HabitWithStats {
    const habitLogs = allLogs.filter(l => l.habit_id === habit.id && l.completed);
    const today = new Date().toISOString().split('T')[0];
    const completedToday = habitLogs.some(l => l.date === today);

    // Calculate weekly completions for current week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Seg-Dom
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
