import type { UserProfile } from '../types';
import { STORAGE_KEYS, getStorageItem, setStorageItem, removeStorageItem } from '../storage/localStorage';
import { initializeDatabaseIfNeeded, INITIAL_USER } from '../storage/seedData';

export const authService = {
  getCurrentUser(): UserProfile | null {
    initializeDatabaseIfNeeded();
    return getStorageItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USER);
  },

  login(email: string, _password: string): { user: UserProfile | null; error: string | null } {
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
  },

  register(email: string, _password: string, fullName: string): { user: UserProfile | null; error: string | null } {
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
  },

  logout(): void {
    removeStorageItem(STORAGE_KEYS.CURRENT_USER);
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    const current = this.getCurrentUser();
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
};
