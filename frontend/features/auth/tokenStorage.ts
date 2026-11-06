import { useSyncExternalStore } from 'react';

/** Tempat menyimpan sesi login. Key token harus sama dengan yang dibaca services/api.ts. */
const TOKEN_KEY = 'auth_token';
const EMAIL_KEY = 'auth_email';

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const getToken = (): string | null => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveToken = (token: string) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  notify();
};

/** Simpan token + email (email dipakai sebagai kunci data lokal seperti PIN diary pribadi). */
export const saveSession = (token: string, email: string) => {
  sessionStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
  saveToken(token);
};

export const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EMAIL_KEY);
  notify();
};

export const getSessionEmail = (): string => {
  try {
    return sessionStorage.getItem(EMAIL_KEY) || 'default';
  } catch {
    return 'default';
  }
};

export const setSessionEmail = (email: string) => {
  sessionStorage.setItem(EMAIL_KEY, email.trim().toLowerCase());
};

/** 'checking' saat server-render, lalu 'in' / 'out'. */
export function useAuthStatus(): 'checking' | 'in' | 'out' {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => (getToken() ? 'in' : 'out'),
    () => 'checking'
  );
}
