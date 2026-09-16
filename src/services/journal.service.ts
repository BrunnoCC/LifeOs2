import type { JournalEntry } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem } from '../storage/localStorage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const journalService = {
  async getEntries(userId: string): Promise<JournalEntry[]> {
    if (!isSupabaseConfigured()) {
      const all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
      return all
        .filter(e => e.user_id === userId)
        .sort((a, b) => b.date.localeCompare(a.date));
    }

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error || !data) return [];
      return data.map((e: any) => ({
        id: e.id,
        user_id: e.user_id,
        date: e.date,
        title: e.title || undefined,
        content: e.content,
        mood: e.mood || undefined,
        tags: e.tags || [],
        created_at: e.created_at,
        updated_at: e.updated_at
      }));
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      return [];
    }
  },

  async getEntryByDate(userId: string, date: string): Promise<JournalEntry | null> {
    if (!isSupabaseConfigured()) {
      const all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
      return all.find(e => e.user_id === userId && e.date === date) ?? null;
    }

    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (!data) return null;
    return {
      id: data.id,
      user_id: data.user_id,
      date: data.date,
      title: data.title || undefined,
      content: data.content,
      mood: data.mood || undefined,
      tags: data.tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async createEntry(data: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> {
    if (!isSupabaseConfigured()) {
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
    }

    const { data: inserted, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: data.user_id,
        date: data.date,
        title: data.title,
        content: data.content,
        mood: data.mood,
        tags: data.tags
      })
      .select()
      .single();

    if (error || !inserted) throw new Error(error?.message || 'Erro ao salvar diário');

    return {
      id: inserted.id,
      user_id: inserted.user_id,
      date: inserted.date,
      title: inserted.title || undefined,
      content: inserted.content,
      mood: inserted.mood || undefined,
      tags: inserted.tags || [],
      created_at: inserted.created_at,
      updated_at: inserted.updated_at
    };
  },

  async updateEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry | null> {
    if (!isSupabaseConfigured()) {
      const all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
      const idx = all.findIndex(e => e.id === id);
      if (idx === -1) return null;
      all[idx] = { ...all[idx], ...updates, updated_at: new Date().toISOString() };
      setStorageItem(STORAGE_KEYS.JOURNAL, all);
      return all[idx];
    }

    const payload: any = { ...updates, updated_at: new Date().toISOString() };
    delete payload.id;

    const { data, error } = await supabase
      .from('journal_entries')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      user_id: data.user_id,
      date: data.date,
      title: data.title || undefined,
      content: data.content,
      mood: data.mood || undefined,
      tags: data.tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async saveOrUpdate(userId: string, data: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> {
    const existing = await this.getEntryByDate(userId, data.date);
    if (existing) {
      const updated = await this.updateEntry(existing.id, data);
      return updated ?? existing;
    }
    return this.createEntry({ ...data, user_id: userId });
  },

  async deleteEntry(id: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      let all = getStorageItem<JournalEntry[]>(STORAGE_KEYS.JOURNAL, []);
      const prev = all.length;
      all = all.filter(e => e.id !== id);
      if (all.length !== prev) {
        setStorageItem(STORAGE_KEYS.JOURNAL, all);
        return true;
      }
      return false;
    }

    const { error } = await supabase.from('journal_entries').delete().eq('id', id);
    return !error;
  },
};
