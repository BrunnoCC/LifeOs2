import type { Task, Subtask } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';

export const taskService = {
  getTasks(userId: string): Task[] {
    const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
    return tasks.filter(t => t.user_id === userId);
  },

  createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Task {
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
  },

  updateTask(id: string, updates: Partial<Task>): Task | null {
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
  },

  deleteTask(id: string): boolean {
    let tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
    const initialLen = tasks.length;
    tasks = tasks.filter(t => t.id !== id);
    if (tasks.length !== initialLen) {
      setStorageItem(STORAGE_KEYS.TASKS, tasks);
      return true;
    }
    return false;
  },

  toggleTaskStatus(id: string): Task | null {
    const tasks = getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []);
    const task = tasks.find(t => t.id === id);
    if (!task) return null;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    return this.updateTask(id, { status: newStatus });
  },

  addSubtask(taskId: string, title: string): Subtask | null {
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
  },

  toggleSubtask(taskId: string, subtaskId: string): Task | null {
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
};
