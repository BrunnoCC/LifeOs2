import type { Task, Subtask } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const taskService = {
  async getTasks(userId: string): Promise<Task[]> {
    if (!isSupabaseConfigured()) {
      const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
      return tasks.filter(t => t.user_id === userId);
    }

    try {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !tasksData) {
        console.error('Error fetching tasks from Supabase:', error);
        return [];
      }

      // Fetch subtasks for these tasks
      const taskIds = tasksData.map(t => t.id);
      let subtasksMap: Record<string, Subtask[]> = {};

      if (taskIds.length > 0) {
        const { data: subtasksData } = await supabase
          .from('subtasks')
          .select('*')
          .in('task_id', taskIds);

        if (subtasksData) {
          subtasksData.forEach((st: any) => {
            if (!subtasksMap[st.task_id]) subtasksMap[st.task_id] = [];
            subtasksMap[st.task_id].push({
              id: st.id,
              title: st.title,
              completed: st.completed
            });
          });
        }
      }

      return tasksData.map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        title: t.title,
        description: t.description || undefined,
        priority: t.priority || 'normal',
        status: t.status || 'pending',
        category: t.category || undefined,
        date: t.date || undefined,
        time: t.time || undefined,
        estimated_duration: t.estimated_duration || undefined,
        recurrence: t.recurrence || 'none',
        completed_at: t.completed_at || null,
        created_at: t.created_at,
        updated_at: t.updated_at,
        subtasks: subtasksMap[t.id] || [],
        tags: t.tags || []
      }));
    } catch (err) {
      console.error('Task fetch error:', err);
      return [];
    }
  },

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    if (!isSupabaseConfigured()) {
      const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const now = new Date().toISOString();
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: now,
        updated_at: now,
        subtasks: taskData.subtasks || [],
        tags: taskData.tags || []
      };

      tasks.unshift(newTask);
      setStorageItem(STORAGE_KEYS.TASKS, tasks);
      return newTask;
    }

    const { data: inserted, error } = await supabase
      .from('tasks')
      .insert({
        user_id: taskData.user_id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        category: taskData.category,
        date: taskData.date,
        time: taskData.time,
        estimated_duration: taskData.estimated_duration,
        recurrence: taskData.recurrence,
        completed_at: taskData.completed_at,
        tags: taskData.tags || []
      })
      .select()
      .single();

    if (error || !inserted) {
      throw new Error(error?.message || 'Erro ao criar tarefa');
    }

    // Insert initial subtasks if any
    let createdSubtasks: Subtask[] = [];
    if (taskData.subtasks && taskData.subtasks.length > 0) {
      const subtaskInserts = taskData.subtasks.map(s => ({
        task_id: inserted.id,
        user_id: taskData.user_id,
        title: s.title,
        completed: s.completed
      }));

      const { data: insertedSubs } = await supabase
        .from('subtasks')
        .insert(subtaskInserts)
        .select();

      if (insertedSubs) {
        createdSubtasks = insertedSubs.map((s: any) => ({
          id: s.id,
          title: s.title,
          completed: s.completed
        }));
      }
    }

    return {
      id: inserted.id,
      user_id: inserted.user_id,
      title: inserted.title,
      description: inserted.description || undefined,
      priority: inserted.priority,
      status: inserted.status,
      category: inserted.category || undefined,
      date: inserted.date || undefined,
      time: inserted.time || undefined,
      estimated_duration: inserted.estimated_duration || undefined,
      recurrence: inserted.recurrence,
      completed_at: inserted.completed_at,
      created_at: inserted.created_at,
      updated_at: inserted.updated_at,
      subtasks: createdSubtasks,
      tags: inserted.tags || []
    };
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    if (!isSupabaseConfigured()) {
      const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) return null;

      const updated: Task = {
        ...tasks[index],
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.status === 'completed' && !tasks[index].completed_at) {
        updated.completed_at = new Date().toISOString();
      } else if (updates.status && updates.status !== 'completed') {
        updated.completed_at = null;
      }

      tasks[index] = updated;
      setStorageItem(STORAGE_KEYS.TASKS, tasks);
      return updated;
    }

    const payload: any = { ...updates, updated_at: new Date().toISOString() };
    delete payload.subtasks;
    delete payload.id;

    if (updates.status === 'completed' && !updates.completed_at) {
      payload.completed_at = new Date().toISOString();
    } else if (updates.status && updates.status !== 'completed') {
      payload.completed_at = null;
    }

    const { data, error } = await supabase
      .from('tasks')
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
      priority: data.priority,
      status: data.status,
      category: data.category || undefined,
      date: data.date || undefined,
      time: data.time || undefined,
      estimated_duration: data.estimated_duration || undefined,
      recurrence: data.recurrence,
      completed_at: data.completed_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      subtasks: updates.subtasks || [],
      tags: data.tags || []
    };
  },

  async deleteTask(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const initialLen = tasks.length;
      tasks = tasks.filter(t => t.id !== id);
      if (tasks.length !== initialLen) {
        setStorageItem(STORAGE_KEYS.TASKS, tasks);
        return true;
      }
      return false;
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    return !error;
  },

  async toggleTaskStatus(id: string): Promise<Task | null> {
    if (!isSupabaseConfigured()) {
      const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const task = tasks.find(t => t.id === id);
      if (!task) return null;
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      return this.updateTask(id, { status: newStatus });
    }

    const { data: current } = await supabase
      .from('tasks')
      .select('status')
      .eq('id', id)
      .single();

    if (!current) return null;

    const newStatus = current.status === 'completed' ? 'pending' : 'completed';
    return this.updateTask(id, { status: newStatus });
  },

  async addSubtask(taskId: string, title: string): Promise<Subtask | null> {
    if (!isSupabaseConfigured()) {
      const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) return null;

      const newSubtask: Subtask = {
        id: `sub-${Date.now()}`,
        title,
        completed: false
      };

      tasks[index].subtasks.push(newSubtask);
      tasks[index].updated_at = new Date().toISOString();
      setStorageItem(STORAGE_KEYS.TASKS, tasks);
      return newSubtask;
    }

    const { data: taskData } = await supabase.from('tasks').select('user_id').eq('id', taskId).single();
    if (!taskData) return null;

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: taskId,
        user_id: taskData.user_id,
        title,
        completed: false
      })
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      completed: data.completed
    };
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Task | null> {
    if (!isSupabaseConfigured()) {
      const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
      const index = tasks.findIndex(t => t.id === taskId);
      if (index === -1) return null;

      const subIndex = tasks[index].subtasks.findIndex(s => s.id === subtaskId);
      if (subIndex === -1) return null;

      tasks[index].subtasks[subIndex].completed = !tasks[index].subtasks[subIndex].completed;
      tasks[index].updated_at = new Date().toISOString();
      setStorageItem(STORAGE_KEYS.TASKS, tasks);
      return tasks[index];
    }

    const { data: sub } = await supabase.from('subtasks').select('completed').eq('id', subtaskId).single();
    if (!sub) return null;

    await supabase.from('subtasks').update({ completed: !sub.completed }).eq('id', subtaskId);
    return this.updateTask(taskId, {});
  }
};
