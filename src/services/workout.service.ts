import type { Workout, WorkoutLog } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';

export const workoutService = {
  getWorkouts(userId: string): Workout[] {
    const all = getStorageItem<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
    return all.filter(w => w.user_id === userId);
  },

  createWorkout(data: Omit<Workout, 'id' | 'created_at'>): Workout {
    const all = getStorageItem<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
    const workout: Workout = {
      ...data,
      id: `workout-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    all.push(workout);
    setStorageItem(STORAGE_KEYS.WORKOUTS, all);
    return workout;
  },

  updateWorkout(id: string, updates: Partial<Workout>): Workout | null {
    const all = getStorageItem<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
    const idx = all.findIndex(w => w.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates };
    setStorageItem(STORAGE_KEYS.WORKOUTS, all);
    return all[idx];
  },

  deleteWorkout(id: string): boolean {
    let all = getStorageItem<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
    const prev = all.length;
    all = all.filter(w => w.id !== id);
    if (all.length !== prev) {
      setStorageItem(STORAGE_KEYS.WORKOUTS, all);
      return true;
    }
    return false;
  },

  // LOGS
  getLogs(userId: string): WorkoutLog[] {
    const all = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
    return all.filter(l => l.user_id === userId).sort((a, b) => b.date.localeCompare(a.date));
  },

  createLog(data: Omit<WorkoutLog, 'id' | 'created_at'>): WorkoutLog {
    const all = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
    const log: WorkoutLog = {
      ...data,
      id: `wlog-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    all.push(log);
    setStorageItem(STORAGE_KEYS.WORKOUT_LOGS, all);
    return log;
  },

  deleteLog(id: string): boolean {
    let all = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
    const prev = all.length;
    all = all.filter(l => l.id !== id);
    if (all.length !== prev) {
      setStorageItem(STORAGE_KEYS.WORKOUT_LOGS, all);
      return true;
    }
    return false;
  },
};
