import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, JournalMood } from '../types';
import { journalService } from '../services/journal.service';
import { useAuthContext } from '../context/AuthContext';

export function useJournal() {
  const { user } = useAuthContext();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(() => {
    if (!user) { setEntries([]); setLoading(false); return; }
    setEntries(journalService.getEntries(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const saveEntry = (data: {
    date: string;
    title?: string;
    content: string;
    mood?: JournalMood;
    tags: string[];
  }) => {
    if (!user) return null;
    const entry = journalService.saveOrUpdate(user.id, data);
    fetchEntries();
    return entry;
  };

  const deleteEntry = (id: string) => {
    journalService.deleteEntry(id);
    fetchEntries();
  };

  const getEntryByDate = (date: string): JournalEntry | null => {
    if (!user) return null;
    return journalService.getEntryByDate(user.id, date);
  };

  return {
    entries,
    loading,
    saveEntry,
    deleteEntry,
    getEntryByDate,
    refresh: fetchEntries,
  };
}
