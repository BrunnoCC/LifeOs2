import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '../types';
import { goalService } from '../services/goal.service';
import { useAuthContext } from '../context/AuthContext';

export function useGoals() {
  const { user } = useAuthContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    try {
      const userGoals = await goalService.getGoals(user.id);
      setGoals(userGoals);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (data: Omit<Goal, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const goal = await goalService.createGoal({ ...data, user_id: user.id });
    await fetchGoals();
    return goal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const updated = await goalService.updateGoal(id, updates);
    await fetchGoals();
    return updated;
  };

  const deleteGoal = async (id: string) => {
    const res = await goalService.deleteGoal(id);
    await fetchGoals();
    return res;
  };

  const incrementGoal = async (id: string, amount: number = 1) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newCurrent = Math.max(0, goal.current_value + amount);
    await updateGoal(id, { current_value: newCurrent, target_value: goal.target_value });
  };

  return {
    goals,
    loading,
    refreshGoals: fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    incrementGoal
  };
}
