import { useState, useEffect, useCallback } from 'react';
import type { StudySubject, StudySession } from '../types';
import { studyService } from '../services/study.service';
import { useAuthContext } from '../context/AuthContext';

export function useStudies() {
  const { user } = useAuthContext();
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudiesData = useCallback(() => {
    if (!user) {
      setSubjects([]);
      setSessions([]);
      setLoading(false);
      return;
    }
    const userSubjects = studyService.getSubjects(user.id);
    const userSessions = studyService.getSessions(user.id);
    setSubjects(userSubjects);
    setSessions(userSessions);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStudiesData();
  }, [fetchStudiesData]);

  const createSubject = (data: Omit<StudySubject, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const subj = studyService.createSubject({ ...data, user_id: user.id });
    fetchStudiesData();
    return subj;
  };

  const deleteSubject = (id: string) => {
    const res = studyService.deleteSubject(id);
    fetchStudiesData();
    return res;
  };

  const createSession = (data: Omit<StudySession, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    const sess = studyService.createSession({ ...data, user_id: user.id });
    fetchStudiesData();
    return sess;
  };

  const deleteSession = (id: string) => {
    const res = studyService.deleteSession(id);
    fetchStudiesData();
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
