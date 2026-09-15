import type { StudySubject, StudySession } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';

export const studyService = {
  getSubjects(userId: string): StudySubject[] {
    const subjects = getStorageItem<StudySubject[]>(STORAGE_KEYS.STUDY_SUBJECTS, []);
    return subjects.filter(s => s.user_id === userId);
  },

  createSubject(subjectData: Omit<StudySubject, 'id' | 'created_at'>): StudySubject {
    const subjects = getStorageItem<StudySubject[]>(STORAGE_KEYS.STUDY_SUBJECTS, []);
    const newSubject: StudySubject = {
      ...subjectData,
      id: `subj-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    subjects.push(newSubject);
    setStorageItem(STORAGE_KEYS.STUDY_SUBJECTS, subjects);
    return newSubject;
  },

  deleteSubject(id: string): boolean {
    let subjects = getStorageItem<StudySubject[]>(STORAGE_KEYS.STUDY_SUBJECTS, []);
    const initialLen = subjects.length;
    subjects = subjects.filter(s => s.id !== id);
    if (subjects.length !== initialLen) {
      setStorageItem(STORAGE_KEYS.STUDY_SUBJECTS, subjects);
      return true;
    }
    return false;
  },

  getSessions(userId: string): StudySession[] {
    const sessions = getStorageItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
    return sessions.filter(s => s.user_id === userId);
  },

  createSession(sessionData: Omit<StudySession, 'id' | 'created_at'>): StudySession {
    const sessions = getStorageItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
    const newSession: StudySession = {
      ...sessionData,
      id: `session-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    sessions.unshift(newSession);
    setStorageItem(STORAGE_KEYS.STUDY_SESSIONS, sessions);
    return newSession;
  },

  deleteSession(id: string): boolean {
    let sessions = getStorageItem<StudySession[]>(STORAGE_KEYS.STUDY_SESSIONS, []);
    const initialLen = sessions.length;
    sessions = sessions.filter(s => s.id !== id);
    if (sessions.length !== initialLen) {
      setStorageItem(STORAGE_KEYS.STUDY_SESSIONS, sessions);
      return true;
    }
    return false;
  }
};
