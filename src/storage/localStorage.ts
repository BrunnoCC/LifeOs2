export const STORAGE_KEYS = {
  USERS: 'lifeos_users_db',
  CURRENT_USER: 'lifeos_current_user_session',
  TASKS: 'lifeos_tasks_db',
  ROUTINES: 'lifeos_routines_db',
  ROUTINE_LOGS: 'lifeos_routine_logs_db',
  HABITS: 'lifeos_habits_db',
  HABIT_LOGS: 'lifeos_habit_logs_db',
  STUDY_SUBJECTS: 'lifeos_study_subjects_db',
  STUDY_SESSIONS: 'lifeos_study_sessions_db',
  GOALS: 'lifeos_goals_db',
  TAGS: 'lifeos_tags_db',
  WORKOUTS: 'lifeos_workouts_db',
  WORKOUT_LOGS: 'lifeos_workout_logs_db',
  JOURNAL: 'lifeos_journal_db',
} as const;

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading key ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving key ${key} to localStorage:`, error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing key ${key} from localStorage:`, error);
  }
}
