import type { Routine, RoutineItem, RoutineLog } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';

export const routineService = {
  getRoutines(userId: string): Routine[] {
    const routines = getStorageItem<Routine[]>(STORAGE_KEYS.ROUTINES, []);
    return routines.filter(r => r.user_id === userId);
  },

  createRoutine(routineData: Omit<Routine, 'id' | 'created_at'>): Routine {
    const routines = getStorageItem<Routine[]>(STORAGE_KEYS.ROUTINES, []);
    const newRoutine: Routine = {
      ...routineData,
      id: `routine-${Date.now()}`,
      created_at: new Date().toISOString(),
      items: routineData.items || []
    };

    routines.push(newRoutine);
    setStorageItem(STORAGE_KEYS.ROUTINES, routines);
    return newRoutine;
  },

  deleteRoutine(routineId: string): boolean {
    let routines = getStorageItem<Routine[]>(STORAGE_KEYS.ROUTINES, []);
    const lenBefore = routines.length;
    routines = routines.filter(r => r.id !== routineId);
    if (routines.length !== lenBefore) {
      setStorageItem(STORAGE_KEYS.ROUTINES, routines);
      return true;
    }
    return false;
  },

  addRoutineItem(routineId: string, itemData: Omit<RoutineItem, 'id' | 'routine_id'>): RoutineItem | null {
    const routines = getStorageItem<Routine[]>(STORAGE_KEYS.ROUTINES, []);
    const index = routines.findIndex(r => r.id === routineId);
    if (index === -1) return null;

    const newItem: RoutineItem = {
      ...itemData,
      id: `ritem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      routine_id: routineId
    };

    routines[index].items.push(newItem);
    setStorageItem(STORAGE_KEYS.ROUTINES, routines);
    return newItem;
  },

  deleteRoutineItem(routineId: string, itemId: string): boolean {
    const routines = getStorageItem<Routine[]>(STORAGE_KEYS.ROUTINES, []);
    const index = routines.findIndex(r => r.id === routineId);
    if (index === -1) return false;

    const initialLen = routines[index].items.length;
    routines[index].items = routines[index].items.filter(item => item.id !== itemId);
    if (routines[index].items.length !== initialLen) {
      setStorageItem(STORAGE_KEYS.ROUTINES, routines);
      return true;
    }
    return false;
  },

  getRoutineLogsForDate(userId: string, date: string): RoutineLog[] {
    const logs = getStorageItem<RoutineLog[]>(STORAGE_KEYS.ROUTINE_LOGS, []);
    return logs.filter(l => l.user_id === userId && l.date === date);
  },

  toggleRoutineItemLog(userId: string, routineItemId: string, date: string): { log: RoutineLog | null; completed: boolean } {
    let logs = getStorageItem<RoutineLog[]>(STORAGE_KEYS.ROUTINE_LOGS, []);
    const existingIndex = logs.findIndex(l => l.user_id === userId && l.routine_item_id === routineItemId && l.date === date);

    if (existingIndex !== -1) {
      logs.splice(existingIndex, 1);
      setStorageItem(STORAGE_KEYS.ROUTINE_LOGS, logs);
      return { log: null, completed: false };
    } else {
      const newLog: RoutineLog = {
        id: `rlog-${Date.now()}`,
        routine_item_id: routineItemId,
        user_id: userId,
        date,
        status: 'completed',
        completed_at: new Date().toISOString()
      };
      logs.push(newLog);
      setStorageItem(STORAGE_KEYS.ROUTINE_LOGS, logs);
      return { log: newLog, completed: true };
    }
  }
};
