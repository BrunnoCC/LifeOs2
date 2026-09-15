import { useState, useEffect, useCallback } from 'react';
import type { Workout, WorkoutLog } from '../types';
import { workoutService } from '../services/workout.service';
import { useAuthContext } from '../context/AuthContext';

export function useWorkouts() {
  const { user } = useAuthContext();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(() => {
    if (!user) { setWorkouts([]); setLogs([]); setLoading(false); return; }
    setWorkouts(workoutService.getWorkouts(user.id));
    setLogs(workoutService.getLogs(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createWorkout = (data: Omit<Workout, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const w = workoutService.createWorkout({ ...data, user_id: user.id });
    fetchAll();
    return w;
  };

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    const w = workoutService.updateWorkout(id, updates);
    fetchAll();
    return w;
  };

  const deleteWorkout = (id: string) => {
    workoutService.deleteWorkout(id);
    fetchAll();
  };

  const logWorkout = (data: Omit<WorkoutLog, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const log = workoutService.createLog({ ...data, user_id: user.id });
    fetchAll();
    return log;
  };

  const deleteLog = (id: string) => {
    workoutService.deleteLog(id);
    fetchAll();
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
