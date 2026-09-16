import type { Routine, RoutineItem, RoutineLog } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const routineService = {
  async getRoutines(userId: string): Promise<Routine[]> {
    if (!isSupabaseConfigured()) {
      const routines = getStorageItem<Routine[]>(STORAGE_KEYS.ROUTINES, []);
      return routines.filter(r => r.user_id === userId);
    }

    try {
      const { data: routinesData, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !routinesData) return [];

      const routineIds = routinesData.map(r => r.id);
      let itemsMap: Record<string, RoutineItem[]> = {};

      if (routineIds.length > 0) {
        const { data: itemsData } = await supabase
          .from('routine_items')
          .select('*')
          .in('routine_id', routineIds)
          .order('order_index', { ascending: true });

        if (itemsData) {
          itemsData.forEach((it: any) => {
            if (!itemsMap[it.routine_id]) itemsMap[it.routine_id] = [];
            itemsMap[it.routine_id].push({
              id: it.id,
              routine_id: it.routine_id,
              name: it.name,
              description: it.description || undefined,
              estimated_duration: it.estimated_duration || undefined,
              time: it.time || undefined,
              priority: it.priority || 'normal',
              days_of_week: it.days_of_week || [0, 1, 2, 3, 4, 5, 6],
              order_index: it.order_index || 0
            });
          });
        }
      }

      return routinesData.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        name: r.name,
        description: r.description || undefined,
        type: r.type || 'custom',
        color: r.color || '#6366f1',
        items: itemsMap[r.id] || [],
        created_at: r.created_at
      }));
    } catch (err) {
      console.error('Error fetching routines:', err);
      return [];
    }
  },

  async createRoutine(routineData: Omit<Routine, 'id' | 'created_at'>): Promise<Routine> {
    if (!isSupabaseConfigured()) {
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
    }

    const { data: inserted, error } = await supabase
      .from('routines')
      .insert({
        user_id: routineData.user_id,
        name: routineData.name,
        description: routineData.description,
        type: routineData.type,
        color: routineData.color
      })
      .select()
      .single();

    if (error || !inserted) throw new Error(error?.message || 'Erro ao criar rotina');

    let createdItems: RoutineItem[] = [];
    if (routineData.items && routineData.items.length > 0) {
      const itemInserts = routineData.items.map((it, idx) => ({
        routine_id: inserted.id,
        user_id: routineData.user_id,
        name: it.name,
        description: it.description,
        estimated_duration: it.estimated_duration,
        time: it.time,
        priority: it.priority,
        days_of_week: it.days_of_week,
        order_index: it.order_index || idx
      }));

      const { data: insertedItems } = await supabase
        .from('routine_items')
        .insert(itemInserts)
        .select();

      if (insertedItems) {
        createdItems = insertedItems.map((it: any) => ({
          id: it.id,
          routine_id: it.routine_id,
          name: it.name,
          description: it.description || undefined,
          estimated_duration: it.estimated_duration || undefined,
          time: it.time || undefined,
          priority: it.priority,
          days_of_week: it.days_of_week,
          order_index: it.order_index
        }));
      }
    }

    return {
      id: inserted.id,
      user_id: inserted.user_id,
      name: inserted.name,
      description: inserted.description || undefined,
      type: inserted.type,
      color: inserted.color,
      items: createdItems,
      created_at: inserted.created_at
    };
  },

  async deleteRoutine(routineId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let routines = getStorageItem<Routine[]>(STORAGE_KEYS.ROUTINES, []);
      const lenBefore = routines.length;
      routines = routines.filter(r => r.id !== routineId);
      if (routines.length !== lenBefore) {
        setStorageItem(STORAGE_KEYS.ROUTINES, routines);
        return true;
      }
      return false;
    }

    const { error } = await supabase.from('routines').delete().eq('id', routineId);
    return !error;
  },

  async addRoutineItem(routineId: string, itemData: Omit<RoutineItem, 'id' | 'routine_id'>): Promise<RoutineItem | null> {
    if (!isSupabaseConfigured()) {
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
    }

    const { data: routine } = await supabase.from('routines').select('user_id').eq('id', routineId).single();
    if (!routine) return null;

    const { data, error } = await supabase
      .from('routine_items')
      .insert({
        routine_id: routineId,
        user_id: routine.user_id,
        name: itemData.name,
        description: itemData.description,
        estimated_duration: itemData.estimated_duration,
        time: itemData.time,
        priority: itemData.priority,
        days_of_week: itemData.days_of_week,
        order_index: itemData.order_index
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      routine_id: data.routine_id,
      name: data.name,
      description: data.description || undefined,
      estimated_duration: data.estimated_duration || undefined,
      time: data.time || undefined,
      priority: data.priority,
      days_of_week: data.days_of_week,
      order_index: data.order_index
    };
  },

  async deleteRoutineItem(routineId: string, itemId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
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
    }

    const { error } = await supabase.from('routine_items').delete().eq('id', itemId);
    return !error;
  },

  async getRoutineLogsForDate(userId: string, date: string): Promise<RoutineLog[]> {
    if (!isSupabaseConfigured()) {
      const logs = getStorageItem<RoutineLog[]>(STORAGE_KEYS.ROUTINE_LOGS, []);
      return logs.filter(l => l.user_id === userId && l.date === date);
    }

    try {
      const { data, error } = await supabase
        .from('routine_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date);

      if (error || !data) return [];
      return data.map((l: any) => ({
        id: l.id,
        routine_item_id: l.routine_item_id,
        user_id: l.user_id,
        date: l.date,
        status: l.status,
        completed_at: l.completed_at
      }));
    } catch (err) {
      console.error('Error fetching routine logs:', err);
      return [];
    }
  },

  async toggleRoutineItemLog(userId: string, routineItemId: string, date: string): Promise<{ log: RoutineLog | null; completed: boolean }> {
    if (!isSupabaseConfigured()) {
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

    const { data: existing } = await supabase
      .from('routine_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('routine_item_id', routineItemId)
      .eq('date', date)
      .single();

    if (existing) {
      await supabase.from('routine_logs').delete().eq('id', existing.id);
      return { log: null, completed: false };
    } else {
      const { data, error } = await supabase
        .from('routine_logs')
        .insert({
          user_id: userId,
          routine_item_id: routineItemId,
          date,
          status: 'completed'
        })
        .select()
        .single();

      if (error || !data) return { log: null, completed: false };
      return {
        log: {
          id: data.id,
          routine_item_id: data.routine_item_id,
          user_id: data.user_id,
          date: data.date,
          status: data.status,
          completed_at: data.completed_at
        },
        completed: true
      };
    }
  }
};
