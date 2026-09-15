import type { Goal } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';

export const goalService = {
  getGoals(userId: string): Goal[] {
    const goals = getStorageItem<Goal[]>(STORAGE_KEYS.GOALS, []);
    return goals.filter(g => g.user_id === userId);
  },

  createGoal(goalData: Omit<Goal, 'id' | 'created_at'>): Goal {
    const goals = getStorageItem<Goal[]>(STORAGE_KEYS.GOALS, []);
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    goals.push(newGoal);
    setStorageItem(STORAGE_KEYS.GOALS, goals);
    return newGoal;
  },

  updateGoal(id: string, updates: Partial<Goal>): Goal | null {
    const goals = getStorageItem<Goal[]>(STORAGE_KEYS.GOALS, []);
    const index = goals.findIndex(g => g.id === id);
    if (index === -1) return null;

    const updated: Goal = {
      ...goals[index],
      ...updates
    };

    if (updated.current_value >= updated.target_value) {
      updated.status = 'achieved';
    } else {
      updated.status = 'in_progress';
    }

    goals[index] = updated;
    setStorageItem(STORAGE_KEYS.GOALS, goals);
    return updated;
  },

  deleteGoal(id: string): boolean {
    let goals = getStorageItem<Goal[]>(STORAGE_KEYS.GOALS, []);
    const initialLen = goals.length;
    goals = goals.filter(g => g.id !== id);
    if (goals.length !== initialLen) {
      setStorageItem(STORAGE_KEYS.GOALS, goals);
      return true;
    }
    return false;
  }
};
