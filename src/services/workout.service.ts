import type { Workout, WorkoutLog } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const workoutService = {
  async getWorkouts(userId: string): Promise<Workout[]> {
    if (!isSupabaseConfigured()) {
      const all = getStorageItem<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
      return all.filter(w => w.user_id === userId);
    }

    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((w: any) => ({
        id: w.id,
        user_id: w.user_id,
        name: w.name,
        description: w.description || undefined,
        muscle_groups: w.muscle_groups || [],
        difficulty: w.difficulty || 'moderado',
        estimated_duration: w.estimated_duration || 45,
        exercises: w.exercises || [],
        created_at: w.created_at
      }));
    } catch (err) {
      console.error('Error fetching workouts:', err);
      return [];
    }
  },

  async createWorkout(data: Omit<Workout, 'id' | 'created_at'>): Promise<Workout> {
    if (!isSupabaseConfigured()) {
      const all = getStorageItem<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
      const workout: Workout = {
        ...data,
        id: `workout-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      all.push(workout);
      setStorageItem(STORAGE_KEYS.WORKOUTS, all);
      return workout;
    }

    const { data: inserted, error } = await supabase
      .from('workouts')
      .insert({
        user_id: data.user_id,
        name: data.name,
        description: data.description,
        muscle_groups: data.muscle_groups,
        difficulty: data.difficulty,
        estimated_duration: data.estimated_duration,
        exercises: data.exercises
      })
      .select()
      .single();

    if (error || !inserted) throw new Error(error?.message || 'Erro ao criar treino');

    return {
      id: inserted.id,
      user_id: inserted.user_id,
      name: inserted.name,
      description: inserted.description || undefined,
      muscle_groups: inserted.muscle_groups || [],
      difficulty: inserted.difficulty,
      estimated_duration: inserted.estimated_duration,
      exercises: inserted.exercises || [],
      created_at: inserted.created_at
    };
  },

  async updateWorkout(id: string, updates: Partial<Workout>): Promise<Workout | null> {
    if (!isSupabaseConfigured()) {
      const all = getStorageItem<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
      const idx = all.findIndex(w => w.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates };
      setStorageItem(STORAGE_KEYS.WORKOUTS, all);
      return all[idx];
    }

    const payload: any = { ...updates };
    delete payload.id;

    const { data, error } = await supabase
      .from('workouts')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description || undefined,
      muscle_groups: data.muscle_groups || [],
      difficulty: data.difficulty,
      estimated_duration: data.estimated_duration,
      exercises: data.exercises || [],
      created_at: data.created_at
    };
  },

  async deleteWorkout(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let all = getStorageItem<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
      const prev = all.length;
      all = all.filter(w => w.id !== id);
      if (all.length !== prev) {
        setStorageItem(STORAGE_KEYS.WORKOUTS, all);
        return true;
      }
      return false;
    }

    const { error } = await supabase.from('workouts').delete().eq('id', id);
    return !error;
  },

  // LOGS
  async getLogs(userId: string): Promise<WorkoutLog[]> {
    if (!isSupabaseConfigured()) {
      const all = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
      return all.filter(l => l.user_id === userId).sort((a, b) => b.date.localeCompare(a.date));
    }

    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error || !data) return [];
      return data.map((l: any) => ({
        id: l.id,
        workout_id: l.workout_id || '',
        workout_name: l.workout_name,
        user_id: l.user_id,
        date: l.date,
        duration_minutes: l.duration_minutes || 0,
        difficulty_felt: l.difficulty_felt || 'moderado',
        notes: l.notes || undefined,
        exercises_done: l.exercises_done || [],
        created_at: l.created_at
      }));
    } catch (err) {
      console.error('Error fetching workout logs:', err);
      return [];
    }
  },

  async createLog(data: Omit<WorkoutLog, 'id' | 'created_at'>): Promise<WorkoutLog> {
    if (!isSupabaseConfigured()) {
      const all = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
      const log: WorkoutLog = {
        ...data,
        id: `wlog-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      all.push(log);
      setStorageItem(STORAGE_KEYS.WORKOUT_LOGS, all);
      return log;
    }

    const { data: inserted, error } = await supabase
      .from('workout_logs')
      .insert({
        workout_id: data.workout_id || null,
        workout_name: data.workout_name,
        user_id: data.user_id,
        date: data.date,
        duration_minutes: data.duration_minutes,
        difficulty_felt: data.difficulty_felt,
        notes: data.notes,
        exercises_done: data.exercises_done
      })
      .select()
      .single();

    if (error || !inserted) throw new Error(error?.message || 'Erro ao registrar treino');

    return {
      id: inserted.id,
      workout_id: inserted.workout_id || '',
      workout_name: inserted.workout_name,
      user_id: inserted.user_id,
      date: inserted.date,
      duration_minutes: inserted.duration_minutes,
      difficulty_felt: inserted.difficulty_felt,
      notes: inserted.notes || undefined,
      exercises_done: inserted.exercises_done || [],
      created_at: inserted.created_at
    };
  },

  async deleteLog(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let all = getStorageItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUT_LOGS, []);
      const prev = all.length;
      all = all.filter(l => l.id !== id);
      if (all.length !== prev) {
        setStorageItem(STORAGE_KEYS.WORKOUT_LOGS, all);
        return true;
      }
      return false;
    }

    const { error } = await supabase.from('workout_logs').delete().eq('id', id);
    return !error;
  }
};
