import type { UserProfile } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem, removeStorageItem } from '../storage/localStorage';
import { initializeDatabaseIfNeeded, INITIAL_USER } from '../storage/seedData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      initializeDatabaseIfNeeded();
      return getStorageItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USER);
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        return {
          id: profile.id,
          email: user.email || '',
          full_name: profile.full_name || user.email?.split('@')[0] || 'Usuário',
          avatar_url: profile.avatar_url,
          theme: profile.theme || 'system',
          accent_color: profile.accent_color || '#6366f1',
          enabled_widgets: profile.enabled_widgets || ['today', 'daily_progress', 'habits', 'routines', 'studies', 'focus'],
          created_at: profile.created_at || new Date().toISOString()
        };
      }

      // Default profile structure if table fetch fails
      return {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        theme: 'system',
        accent_color: '#6366f1',
        enabled_widgets: ['today', 'daily_progress', 'habits', 'routines', 'studies', 'focus'],
        created_at: new Date().toISOString()
      };
    } catch (err) {
      console.error('Error in getCurrentUser:', err);
      return null;
    }
  },

  async login(email: string, password: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      initializeDatabaseIfNeeded();
      const users = getStorageItem<UserProfile[]>(STORAGE_KEYS.USERS, []);
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!found) {
        const newUser: UserProfile = {
          id: `user-${Date.now()}`,
          email: email.toLowerCase(),
          full_name: email.split('@')[0],
          theme: 'dark',
          accent_color: '#6366f1',
          enabled_widgets: ['today', 'daily_progress', 'habits', 'routines', 'studies', 'focus'],
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        setStorageItem(STORAGE_KEYS.USERS, users);
        setStorageItem(STORAGE_KEYS.CURRENT_USER, newUser);
        return { user: newUser, error: null };
      }

      setStorageItem(STORAGE_KEYS.CURRENT_USER, found);
      return { user: found, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Falha no login.' };
      }

      const userProfile = await this.getCurrentUser();
      return { user: userProfile, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erro de conexão com o Supabase.' };
    }
  },

  async register(email: string, password: string, fullName: string): Promise<{ user: UserProfile | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      initializeDatabaseIfNeeded();
      const users = getStorageItem<UserProfile[]>(STORAGE_KEYS.USERS, []);
      
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { user: null, error: 'Este e-mail já está cadastrado.' };
      }

      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        full_name: fullName || email.split('@')[0],
        theme: 'dark',
        accent_color: '#6366f1',
        enabled_widgets: ['today', 'daily_progress', 'habits', 'routines', 'studies', 'focus'],
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      setStorageItem(STORAGE_KEYS.USERS, users);
      setStorageItem(STORAGE_KEYS.CURRENT_USER, newUser);

      return { user: newUser, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Não foi possível cadastrar.' };
      }

      const userProfile = await this.getCurrentUser();
      return { user: userProfile, error: null };
    } catch (err: any) {
      return { user: null, error: err.message || 'Erro de conexão com o Supabase.' };
    }
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) {
      removeStorageItem(STORAGE_KEYS.CURRENT_USER);
      return;
    }
    await supabase.auth.signOut();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      const current = getStorageItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USER);
      if (!current) return null;

      const updated: UserProfile = { ...current, ...updates };
      setStorageItem(STORAGE_KEYS.CURRENT_USER, updated);

      const users = getStorageItem<UserProfile[]>(STORAGE_KEYS.USERS, []);
      const index = users.findIndex(u => u.id === current.id);
      if (index !== -1) {
        users[index] = updated;
        setStorageItem(STORAGE_KEYS.USERS, users);
      }

      return updated;
    }

    const current = await this.getCurrentUser();
    if (!current) return null;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        theme: updates.theme,
        accent_color: updates.accent_color,
        enabled_widgets: updates.enabled_widgets,
        updated_at: new Date().toISOString()
      })
      .eq('id', current.id);

    if (error) {
      console.error('Error updating profile in Supabase:', error);
      return null;
    }

    return { ...current, ...updates };
  }
};
