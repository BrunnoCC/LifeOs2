import type { UserProfile, Task, Routine, Habit, HabitLog, RoutineLog } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from './localStorage';

const DEFAULT_USER_ID = 'user-brunno-01';

export const INITIAL_USER: UserProfile = {
  id: DEFAULT_USER_ID,
  email: 'brunno@lifeos.com',
  full_name: 'Brunno',
  avatar_url: '',
  theme: 'dark',
  accent_color: '#6366f1',
  enabled_widgets: ['today', 'daily_progress', 'habits', 'routines', 'studies', 'focus'],
  created_at: new Date().toISOString(),
};

export const INITIAL_TASKS: Task[] = [];
export const INITIAL_ROUTINES: Routine[] = [];
export const INITIAL_HABITS: Habit[] = [];
export const INITIAL_HABIT_LOGS: HabitLog[] = [];
export const INITIAL_ROUTINE_LOGS: RoutineLog[] = [];

export function initializeDatabaseIfNeeded(): void {
  const users = getStorageItem<UserProfile[]>(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    setStorageItem(STORAGE_KEYS.USERS, [INITIAL_USER]);
    setStorageItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USER);
    setStorageItem(STORAGE_KEYS.TASKS, INITIAL_TASKS);
    setStorageItem(STORAGE_KEYS.ROUTINES, INITIAL_ROUTINES);
    setStorageItem(STORAGE_KEYS.HABITS, INITIAL_HABITS);
    setStorageItem(STORAGE_KEYS.HABIT_LOGS, INITIAL_HABIT_LOGS);
    setStorageItem(STORAGE_KEYS.ROUTINE_LOGS, INITIAL_ROUTINE_LOGS);
  }
}
