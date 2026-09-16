import { useState, useEffect, useCallback } from 'react';
import type { Workout, WorkoutLog } from '../types';
import { workoutService } from '../services/workout.service';
import { useAuthContext } from '../context/AuthContext';

export function useWorkouts() {
  const { user } = useAuthContext();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
      setLogs([]);
      setLoading(false);
      return;
    }
    try {
      const userWorkouts = await workoutService.getWorkouts(user.id);
      const userLogs = await workoutService.getLogs(user.id);
      setWorkouts(userWorkouts);
      setLogs(userLogs);
    } catch (err) {
      console.error('Failed to fetch workouts:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createWorkout = async (data: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const w = await workoutService.createWorkout({ ...data, user_id: user.id });
    await fetchAll();
    return w;
  };

  const updateWorkout = async (id: string, updates: Partial<Workout>) => {
    const w = await workoutService.updateWorkout(id, updates);
    await fetchAll();
    return w;
  };

  const deleteWorkout = async (id: string) => {
    await workoutService.deleteWorkout(id);
    await fetchAll();
  };

  const logWorkout = async (data: Omit<WorkoutLog, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const log = await workoutService.createLog({ ...data, user_id: user.id });
    await fetchAll();
    return log;
  };

  const deleteLog = async (id: string) => {
    await workoutService.deleteLog(id);
    await fetchAll();
  };

  return {
    workouts,
    logs,
    loading,
    createWorkout,
    updateWorkout,
    deleteWorkout,
    logWorkout,
    deleteLog,
    refresh: fetchAll,
  };
}
