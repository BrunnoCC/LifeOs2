import type { JournalEntry } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';

export const journalService = {
  getEntries(userId: string): JournalEntry[] {
    const all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
    return all
      .filter(e => e.user_id === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  getEntryByDate(userId: string, date: string): JournalEntry | null {
    const all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
    return all.find(e => e.user_id === userId && e.date === date) ?? null;
  },

  createEntry(data: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): JournalEntry {
    const all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
    const now = new Date().toISOString();
    const entry: JournalEntry = {
      ...data,
      id: `journal-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    all.push(entry);
    setStorageItem(STORAGE_KEYS.JOURNAL, all);
    return entry;
  },

  updateEntry(id: string, updates: Partial<JournalEntry>): JournalEntry | null {
    const all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
    const idx = all.findIndex(e => e.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
    setStorageItem(STORAGE_KEYS.JOURNAL, all);
    return all[idx];
  },

  saveOrUpdate(userId: string, data: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): JournalEntry {
    const existing = this.getEntryByDate(userId, data.date);
    if (existing) {
      return this.updateEntry(existing.id, data) ?? existing;
    }
    return this.createEntry({ ...data, user_id: userId });
  },

  deleteEntry(id: string): boolean {
    let all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
    const prev = all.length;
    all = all.filter(e => e.id !== id);
    if (all.length !== prev) {
      setStorageItem(STORAGE_KEYS.JOURNAL, all);
      return true;
    }
    return false;
  },
};
