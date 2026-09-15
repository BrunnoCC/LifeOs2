import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '../types';
import { goalService } from '../services/goal.service';
import { useAuthContext } from '../context/AuthContext';

export function useGoals() {
  const { user } = useAuthContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    const userGoals = goalService.getGoals(user.id);
    setGoals(userGoals);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = (data: Omit<Goal, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const goal = goalService.createGoal({ ...data, user_id: user.id });
    fetchGoals();
    return goal;
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const updated = goalService.updateGoal(id, updates);
    fetchGoals();
    return updated;
  };

  const deleteGoal = (id: string) => {
    const res = goalService.deleteGoal(id);
    fetchGoals();
    return res;
  };

  const incrementGoal = (id: string, amount: number = 1) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newCurrent = Math.max(0, goal.current_value + amount);
    updateGoal(id, { current_value: newCurrent });
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
