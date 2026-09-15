import { useState, useEffect, useCallback } from 'react';
import type { Routine, RoutineItem, RoutineLog } from '../types';
import { routineService } from '../services/routine.service';
import { useAuthContext } from '../context/AuthContext';

export function useRoutines(selectedDate: string = new Date().toISOString().split('T')[0]) {
  const { user } = useAuthContext();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineLogs, setRoutineLogs] = useState<RoutineLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutinesData = useCallback(() => {
    if (!user) {
      setRoutines([]);
      setRoutineLogs([]);
      setLoading(false);
      return;
    }
    const userRoutines = routineService.getRoutines(user.id);
    const logs = routineService.getRoutineLogsForDate(user.id, selectedDate);
    setRoutines(userRoutines);
    setRoutineLogs(logs);
    setLoading(false);
  }, [user, selectedDate]);

  useEffect(() => {
    fetchRoutinesData();
  }, [fetchRoutinesData]);

  const createRoutine = (routineData: Omit<Routine, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const routine = routineService.createRoutine({ ...routineData, user_id: user.id });
    fetchRoutinesData();
    return routine;
  };

  const deleteRoutine = (routineId: string) => {
    const success = routineService.deleteRoutine(routineId);
    fetchRoutinesData();
    return success;
  };

  const addRoutineItem = (routineId: string, itemData: Omit<RoutineItem, 'id' | 'routine_id'>) => {
    const item = routineService.addRoutineItem(routineId, itemData);
    fetchRoutinesData();
    return item;
  };

  const deleteRoutineItem = (routineId: string, itemId: string) => {
    const success = routineService.deleteRoutineItem(routineId, itemId);
    fetchRoutinesData();
    return success;
  };

  const toggleItemLog = (routineItemId: string) => {
    if (!user) return;
    routineService.toggleRoutineItemLog(user.id, routineItemId, selectedDate);
    fetchRoutinesData();
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
