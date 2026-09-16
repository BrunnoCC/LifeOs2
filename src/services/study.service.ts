import type { StudySubject, StudySession } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const studyService = {
  async getSubjects(userId: string): Promise<StudySubject[]> {
    if (!isSupabaseConfigured()) {
      const subjects = getStorageItem<StudySubject[]>(STORAGE_KEYS.STUDY_SUBJECTS, []);
      return subjects.filter(s => s.user_id === userId);
    }

    try {
      const { data, error } = await supabase
        .from('study_subjects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        name: s.name,
        category: s.category || '',
        target_hours: s.target_hours || 0,
        difficulty: s.difficulty || 'médio',
        color: s.color || '#3b82f6',
        created_at: s.created_at
      }));
    } catch (err) {
      console.error('Error fetching study subjects:', err);
      return [];
    }
  },

  async createSubject(subjectData: Omit<StudySubject, 'id' | 'created_at'>): Promise<StudySubject> {
    if (!isSupabaseConfigured()) {
      const subjects = getStorageItem<StudySubject[]>(STORAGE_KEYS.STUDY_SUBJECTS, []);
      const newSubject: StudySubject = {
        ...subjectData,
        id: `subj-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      subjects.push(newSubject);
      setStorageItem(STORAGE_KEYS.STUDY_SUBJECTS, subjects);
      return newSubject;
    }

    const { data, error } = await supabase
      .from('study_subjects')
      .insert({
        user_id: subjectData.user_id,
        name: subjectData.name,
        category: subjectData.category,
        target_hours: subjectData.target_hours,
        difficulty: subjectData.difficulty,
        color: subjectData.color
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Erro ao criar matéria');

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      category: data.category || '',
      target_hours: data.target_hours || 0,
      difficulty: data.difficulty || 'médio',
      color: data.color || '#3b82f6',
      created_at: data.created_at
    };
  },

  async deleteSubject(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let subjects = getStorageItem<StudySubject[]>(STORAGE_KEYS.STUDY_SUBJECTS, []);
      const initialLen = subjects.length;
      subjects = subjects.filter(s => s.id !== id);
      if (subjects.length !== initialLen) {
        setStorageItem(STORAGE_KEYS.STUDY_SUBJECTS, subjects);
        return true;
      }
      return false;
    }

    const { error } = await supabase.from('study_subjects').delete().eq('id', id);
    return !error;
  },

  async getSessions(userId: string): Promise<StudySession[]> {
    if (!isSupabaseConfigured()) {
      const sessions = getStorageItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
      return sessions.filter(s => s.user_id === userId);
    }

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error || !data) return [];
      return data.map((s: any) => ({
        id: s.id,
        user_id: s.user_id,
        subject_id: s.subject_id || '',
        subject_name: s.subject_name,
        date: s.date,
        duration_minutes: s.duration_minutes || 0,
        questions_solved: s.questions_solved || 0,
        questions_correct: s.questions_correct || 0,
        notes: s.notes || undefined,
        created_at: s.created_at
      }));
    } catch (err) {
      console.error('Error fetching study sessions:', err);
      return [];
    }
  },

  async createSession(sessionData: Omit<StudySession, 'id' | 'created_at'>): Promise<StudySession> {
    if (!isSupabaseConfigured()) {
      const sessions = getStorageItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
      const newSession: StudySession = {
        ...sessionData,
        id: `session-${Date.now()}`,
        created_at: new Date().toISOString()
      };
      sessions.unshift(newSession);
      setStorageItem(STORAGE_KEYS.STUDY_SESSIONS, sessions);
      return newSession;
    }

    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: sessionData.user_id,
        subject_id: sessionData.subject_id || null,
        subject_name: sessionData.subject_name,
        date: sessionData.date,
        duration_minutes: sessionData.duration_minutes,
        questions_solved: sessionData.questions_solved,
        questions_correct: sessionData.questions_correct,
        notes: sessionData.notes
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Erro ao registrar sessão de estudos');

    return {
      id: data.id,
      user_id: data.user_id,
      subject_id: data.subject_id || '',
      subject_name: data.subject_name,
      date: data.date,
      duration_minutes: data.duration_minutes,
      questions_solved: data.questions_solved,
      questions_correct: data.questions_correct,
      notes: data.notes || undefined,
      created_at: data.created_at
    };
  },

  async deleteSession(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let sessions = getStorageItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
      const initialLen = sessions.length;
      sessions = sessions.filter(s => s.id !== id);
      if (sessions.length !== initialLen) {
        setStorageItem(STORAGE_KEYS.STUDY_SESSIONS, sessions);
        return true;
      }
      return false;
    }

    const { error } = await supabase.from('study_sessions').delete().eq('id', id);
    return !error;
  }
};
