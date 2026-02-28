import type { User, UserFilters } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE KEYS
// ─────────────────────────────────────────────────────────────────────────────

const LS_KEYS = {
  USER: 'tb_user',
  FILTERS: 'tb_filters',
  AUTH: 'tb_auth',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE UTILITIES
// All user state (name, email, resume, filters) is persisted here.
// API calls are NOT made on every filter change — filters are read from LS.
// ─────────────────────────────────────────────────────────────────────────────

export const storage = {
  // User data
  getUser: (): User | null => {
    try {
      const data = localStorage.getItem(LS_KEYS.USER);
      return data ? (JSON.parse(data) as User) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    try {
      localStorage.setItem(LS_KEYS.USER, JSON.stringify(user));
    } catch {
      console.error('[Storage] Failed to save user');
    }
  },

  // Filters (stored separately so they can be updated independently)
  getFilters: (): UserFilters | null => {
    try {
      const data = localStorage.getItem(LS_KEYS.FILTERS);
      return data ? (JSON.parse(data) as UserFilters) : null;
    } catch {
      return null;
    }
  },

  setFilters: (filters: UserFilters): void => {
    try {
      localStorage.setItem(LS_KEYS.FILTERS, JSON.stringify(filters));
    } catch {
      console.error('[Storage] Failed to save filters');
    }
  },

  // Authentication flag
  isAuthenticated: (): boolean => {
    return localStorage.getItem(LS_KEYS.AUTH) === 'true';
  },

  setAuth: (value: boolean): void => {
    localStorage.setItem(LS_KEYS.AUTH, value ? 'true' : 'false');
  },

  // Clear all Talent Bridge data on sign-out
  clear: (): void => {
    localStorage.removeItem(LS_KEYS.USER);
    localStorage.removeItem(LS_KEYS.FILTERS);
    localStorage.removeItem(LS_KEYS.AUTH);
  },
};
