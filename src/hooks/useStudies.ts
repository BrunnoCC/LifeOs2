import { useState, useEffect, useCallback } from 'react';
import type { StudySubject, StudySession } from '../types';
import { studyService } from '../services/study.service';
import { useAuthContext } from '../context/AuthContext';

export function useStudies() {
  const { user } = useAuthContext();
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudiesData = useCallback(async () => {
    if (!user) {
      setSubjects([]);
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      const userSubjects = await studyService.getSubjects(user.id);
      const userSessions = await studyService.getSessions(user.id);
      setSubjects(userSubjects);
      setSessions(userSessions);
    } catch (err) {
      console.error('Failed to fetch studies data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudiesData();
  }, [fetchStudiesData]);

  const createSubject = async (data: Omit<StudySubject, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const subj = await studyService.createSubject({ ...data, user_id: user.id });
    await fetchStudiesData();
    return subj;
  };

  const deleteSubject = async (id: string) => {
    const res = await studyService.deleteSubject(id);
    await fetchStudiesData();
    return res;
  };

  const createSession = async (data: Omit<StudySession, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const sess = await studyService.createSession({ ...data, user_id: user.id });
    await fetchStudiesData();
    return sess;
  };

  const deleteSession = async (id: string) => {
    const res = await studyService.deleteSession(id);
    await fetchStudiesData();
    return res;
  };

  // Metrics computation
  const totalMinutes = sessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const totalQuestions = sessions.reduce((acc, s) => acc + s.questions_solved, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.questions_correct, 0);
  const accuracyRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return {
    subjects,
    sessions,
    totalMinutes,
    totalQuestions,
    totalCorrect,
    accuracyRate,
    loading,
    refreshStudies: fetchStudiesData,
    createSubject,
    deleteSubject,
    createSession,
    deleteSession
  };
}
