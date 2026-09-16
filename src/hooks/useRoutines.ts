import { useState, useEffect, useCallback } from 'react';
import type { Routine, RoutineItem, RoutineLog } from '../types';
import { routineService } from '../services/routine.service';
import { useAuthContext } from '../context/AuthContext';

export function useRoutines(selectedDate: string = new Date().toISOString().split('T')[0]) {
  const { user } = useAuthContext();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineLogs, setRoutineLogs] = useState<RoutineLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutinesData = useCallback(async () => {
    if (!user) {
      setRoutines([]);
      setRoutineLogs([]);
      setLoading(false);
      return;
    }
    try {
      const userRoutines = await routineService.getRoutines(user.id);
      const logs = await routineService.getRoutineLogsForDate(user.id, selectedDate);
      setRoutines(userRoutines);
      setRoutineLogs(logs);
    } catch (err) {
      console.error('Failed to fetch routines:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedDate]);

  useEffect(() => {
    fetchRoutinesData();
  }, [fetchRoutinesData]);

  const createRoutine = async (routineData: Omit<Routine, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const routine = await routineService.createRoutine({ ...routineData, user_id: user.id });
    await fetchRoutinesData();
    return routine;
  };

  const deleteRoutine = async (routineId: string) => {
    const success = await routineService.deleteRoutine(routineId);
    await fetchRoutinesData();
    return success;
  };

  const addRoutineItem = async (routineId: string, itemData: Omit<RoutineItem, 'id' | 'routine_id'>) => {
    const item = await routineService.addRoutineItem(routineId, itemData);
    await fetchRoutinesData();
    return item;
  };

  const deleteRoutineItem = async (routineId: string, itemId: string) => {
    const success = await routineService.deleteRoutineItem(routineId, itemId);
    await fetchRoutinesData();
    return success;
  };

  const toggleItemLog = async (routineItemId: string) => {
    if (!user) return;
    await routineService.toggleRoutineItemLog(user.id, routineItemId, selectedDate);
    await fetchRoutinesData();
  };

  return {
    routines,
    routineLogs,
    loading,
    refreshRoutines: fetchRoutinesData,
    createRoutine,
    deleteRoutine,
    addRoutineItem,
    deleteRoutineItem,
    toggleItemLog
  };
}
