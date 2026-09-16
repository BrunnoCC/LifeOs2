import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { taskService } from '../services/task.service';
import { useAuthContext } from '../context/AuthContext';

export function useTasks() {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      const userTasks = await taskService.getTasks(user.id);
      setTasks(userTasks);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return null;
    const newTask = await taskService.createTask({ ...taskData, user_id: user.id });
    await fetchTasks();
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updated = await taskService.updateTask(id, updates);
    await fetchTasks();
    return updated;
  };

  const deleteTask = async (id: string) => {
    const success = await taskService.deleteTask(id);
    await fetchTasks();
    return success;
  };

  const toggleTaskStatus = async (id: string) => {
    const updated = await taskService.toggleTaskStatus(id);
    await fetchTasks();
    return updated;
  };

  const addSubtask = async (taskId: string, title: string) => {
    const subtask = await taskService.addSubtask(taskId, title);
    await fetchTasks();
    return subtask;
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const updated = await taskService.toggleSubtask(taskId, subtaskId);
    await fetchTasks();
    return updated;
  };

  return {
    tasks,
    loading,
    refreshTasks: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addSubtask,
    toggleSubtask
  };
}
