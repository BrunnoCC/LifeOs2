import type { Goal } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const goalService = {
  async getGoals(userId: string): Promise<Goal[]> {
    if (!isSupabaseConfigured()) {
      const goals = getStorageItem<Goal[]>(STORAGE_KEYS.GOALS, []);
      return goals.filter(g => g.user_id === userId);
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((g: any) => ({
        id: g.id,
        user_id: g.user_id,
        title: g.title,
        description: g.description || undefined,
        category: g.category || '',
        type: g.type || 'monthly',
        current_value: g.current_value || 0,
        target_value: g.target_value || 100,
        unit: g.unit || '%',
        deadline: g.deadline || undefined,
        status: g.status || 'in_progress',
        color: g.color || '#10b981',
        created_at: g.created_at
      }));
    } catch (err) {
      console.error('Error fetching goals:', err);
      return [];
    }
  },

  async createGoal(goalData: Omit<Goal, 'id' | 'created_at'>): Promise<Goal> {
    if (!isSupabaseConfigured()) {
      const goals = getStorageItem<Goal[]>(STORAGE_KEYS.GOALS, []);
      const newGoal: Goal = {
        ...goalData,
        id: `goal-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      goals.push(newGoal);
      setStorageItem(STORAGE_KEYS.GOALS, goals);
      return newGoal;
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: goalData.user_id,
        title: goalData.title,
        description: goalData.description,
        category: goalData.category,
        type: goalData.type,
        current_value: goalData.current_value,
        target_value: goalData.target_value,
        unit: goalData.unit,
        deadline: goalData.deadline,
        status: goalData.status,
        color: goalData.color
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Erro ao criar meta');

    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description || undefined,
      category: data.category || '',
      type: data.type,
      current_value: data.current_value,
      target_value: data.target_value,
      unit: data.unit,
      deadline: data.deadline || undefined,
      status: data.status,
      color: data.color,
      created_at: data.created_at
    };
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
    if (!isSupabaseConfigured()) {
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
    }

    const payload: any = { ...updates };
    delete payload.id;

    if (updates.current_value !== undefined && updates.target_value !== undefined) {
      payload.status = updates.current_value >= updates.target_value ? 'achieved' : 'in_progress';
    }

    const { data, error } = await supabase
      .from('goals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      description: data.description || undefined,
      category: data.category || '',
      type: data.type,
      current_value: data.current_value,
      target_value: data.target_value,
      unit: data.unit,
      deadline: data.deadline || undefined,
      status: data.status,
      color: data.color,
      created_at: data.created_at
    };
  },

  async deleteGoal(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let goals = getStorageItem<Goal[]>(STORAGE_KEYS.GOALS, []);
      const initialLen = goals.length;
      goals = goals.filter(g => g.id !== id);
      if (goals.length !== initialLen) {
        setStorageItem(STORAGE_KEYS.GOALS, goals);
        return true;
      }
      return false;
    }

    const { error } = await supabase.from('goals').delete().eq('id', id);
    return !error;
  }
};
