import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, JournalMood } from '../types';
import { journalService } from '../services/journal.service';
import { useAuthContext } from '../context/AuthContext';

export function useJournal() {
  const { user } = useAuthContext();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    try {
      const userEntries = await journalService.getEntries(user.id);
      setEntries(userEntries);
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const saveEntry = async (data: {
    date: string;
    title?: string;
    content: string;
    mood?: JournalMood;
    tags: string[];
  }) => {
    if (!user) return null;
    const entry = await journalService.saveOrUpdate(user.id, data);
    await fetchEntries();
    return entry;
  };

  const deleteEntry = async (id: string) => {
    await journalService.deleteEntry(id);
    await fetchEntries();
  };

  const getEntryByDate = (date: string): JournalEntry | null => {
    if (!user) return null;
    return entries.find(e => e.date === date) || null;
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
