import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { taskService } from '../services/task.service';
import { useAuthContext } from '../context/AuthContext';

export function useTasks() {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const userTasks = taskService.getTasks(user.id);
    setTasks(userTasks);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return null;
    const newTask = taskService.createTask({ ...taskData, user_id: user.id });
    fetchTasks();
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updated = taskService.updateTask(id, updates);
    fetchTasks();
    return updated;
  };

  const deleteTask = (id: string) => {
    const success = taskService.deleteTask(id);
    fetchTasks();
    return success;
  };

  const toggleTaskStatus = (id: string) => {
    const updated = taskService.toggleTaskStatus(id);
    fetchTasks();
    return updated;
  };

  const addSubtask = (taskId: string, title: string) => {
    const subtask = taskService.addSubtask(taskId, title);
    fetchTasks();
    return subtask;
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updated = taskService.toggleSubtask(taskId, subtaskId);
    fetchTasks();
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
