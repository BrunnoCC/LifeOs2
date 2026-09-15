export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  theme: ThemeMode;
  accent_color: string;
  enabled_widgets: string[];
  created_at: string;
}

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm
  estimated_duration?: number; // minutos
  recurrence: TaskRecurrence;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
  tags: string[];
}

export type RoutineType = 'morning' | 'afternoon' | 'night' | 'study' | 'workout' | 'custom';

export interface RoutineItem {
  id: string;
  routine_id: string;
  name: string;
  description?: string;
  estimated_duration?: number; // minutos
  time?: string; // HH:mm
  priority: TaskPriority;
  days_of_week: number[]; // 0=Domingo, 1=Segunda, etc.
  order_index: number;
}

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  type: RoutineType;
  color: string;
  items: RoutineItem[];
  created_at: string;
}

export interface RoutineLog {
  id: string;
  routine_item_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  status: 'completed' | 'skipped';
  completed_at: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'weekly_days' | 'custom';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency: HabitFrequency;
  weekly_target?: number; // Ex: 3 vezes por semana
  days_of_week: number[]; // 0=Domingo, 1=Segunda, etc.
  target_value: number;
  unit: string; // ex: 'vezes', 'litros', 'minutos', 'páginas'
  time?: string;
  category?: string;
  color: string;
  archived: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  value: number;
  completed: boolean;
  created_at: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  completedToday: boolean;
  todayLogValue: number;
  weeklyCompletionsCount: number; // Quantas vezes foi concluído esta semana
  logs: HabitLog[];
}

// ESTUDOS
export interface StudySubject {
  id: string;
  user_id: string;
  name: string;
  category: string;
  target_hours: number;
  difficulty: 'fácil' | 'médio' | 'difícil';
  color: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  subject_name: string;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  questions_solved: number;
  questions_correct: number;
  notes?: string;
  created_at: string;
}

// METAS
export type GoalType = 'daily' | 'weekly' | 'monthly' | 'annual' | 'custom';
export type GoalStatus = 'in_progress' | 'achieved' | 'expired';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  type: GoalType;
  current_value: number;
  target_value: number;
  unit: string;
  deadline?: string; // YYYY-MM-DD
  status: GoalStatus;
  color: string;
  created_at: string;
}

// TREINOS
export type MuscleGroup = 'Peito' | 'Costas' | 'Ombros' | 'Bíceps' | 'Tríceps' | 'Pernas' | 'Glúteos' | 'Abdômen' | 'Cardio' | 'Full Body' | 'Outro';
export type WorkoutDifficulty = 'leve' | 'moderado' | 'intenso';

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string; // pode ser '12-15'
  weight?: number; // kg
  rest_seconds?: number;
  notes?: string;
}

export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  muscle_groups: MuscleGroup[];
  difficulty: WorkoutDifficulty;
  estimated_duration: number; // minutos
  exercises: WorkoutExercise[];
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  workout_id: string;
  workout_name: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  difficulty_felt: WorkoutDifficulty;
  notes?: string;
  exercises_done: WorkoutExercise[];
  created_at: string;
}

// DIÁRIO
export type JournalMood = 'great' | 'good' | 'okay' | 'bad' | 'awful';

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  content: string;
  mood?: JournalMood;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
}
