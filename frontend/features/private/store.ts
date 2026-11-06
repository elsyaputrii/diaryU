import { getSessionEmail, setSessionEmail } from '@/features/auth/tokenStorage';

/**
 * Penyimpanan Diary Pribadi (kunci PIN) di browser.
 *
 * - PIN TIDAK disimpan polos: hanya hash PBKDF2 + salt acak (localStorage).
 * - Daftar id catatan yang dikunci juga di localStorage, dipisah per akun (kunci = email login).
 * - Catatan yang sudah dibuka disimpan di sessionStorage -> terkunci lagi saat tab ditutup.
 *
 * Catatan: ini kunci tampilan (UI lock) — melindungi dari orang yang ikut melihat layar/perangkat,
 * bukan enkripsi data di server. Untuk dipindah ke backend, cukup ganti isi file ini.
 */

export interface PrivacyState {
  hasPin: boolean;
  locked: number[];
  unlocked: number[];
}

interface Stored {
  salt: string;
  hash: string;
  locked: number[];
}

export const PIN_MIN = 4;
export const PIN_MAX = 6;
const ITERATIONS = 100_000;
const EMPTY: PrivacyState = { hasPin: false, locked: [], unlocked: [] };

const UNLOCK_KEY = 'elsya-diary-unlocked';
const storageKey = () => `elsya-diary-private:${getSessionEmail()}`;

const listeners = new Set<() => void>();
let cached: PrivacyState | null = null;

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(storageKey());
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

function writeStored(value: Stored | null) {
  try {
    if (value) localStorage.setItem(storageKey(), JSON.stringify(value));
    else localStorage.removeItem(storageKey());
  } catch {
    throw new Error('Penyimpanan browser tidak tersedia.');
  }
}

function readUnlocked(): number[] {
  try {
    return JSON.parse(sessionStorage.getItem(`${UNLOCK_KEY}:${getSessionEmail()}`) || '[]');
  } catch {
    return [];
  }
}

function writeUnlocked(ids: number[]) {
  try {
    sessionStorage.setItem(`${UNLOCK_KEY}:${getSessionEmail()}`, JSON.stringify(ids));
  } catch {
    // diabaikan: hanya berarti catatan terkunci lagi setelah reload
  }
}

function refresh() {
  const s = readStored();
  cached = s ? { hasPin: true, locked: s.locked ?? [], unlocked: readUnlocked() } : { ...EMPTY, unlocked: [] };
  listeners.forEach((l) => l());
}

export function getSnapshot(): PrivacyState {
  if (!cached) {
    const s = readStored();
    cached = s ? { hasPin: true, locked: s.locked ?? [], unlocked: readUnlocked() } : EMPTY;
  }
  return cached;
}

export const getServerSnapshot = (): PrivacyState => EMPTY;

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = () => refresh();
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Panggil setelah login/logout agar state mengikuti akun yang sedang aktif. */
export function resetPrivacyCache() {
  cached = null;
  listeners.forEach((l) => l());
}

/** Email akun berubah -> pindahkan data PIN ke kunci baru. */
export function migratePrivacyKey(oldEmail: string, newEmail: string) {
  const from = `elsya-diary-private:${oldEmail.trim().toLowerCase()}`;
  const to = `elsya-diary-private:${newEmail.trim().toLowerCase()}`;
  try {
    const raw = localStorage.getItem(from);
    if (raw && from !== to) {
      localStorage.setItem(to, raw);
      localStorage.removeItem(from);
    }
  } catch {
    // diabaikan
  }
  setSessionEmail(newEmail);
  resetPrivacyCache();
}

// ---------- hashing ----------

const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

async function hashPin(pin: string, saltHex: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Browser ini tidak mendukung penyimpanan PIN aman (butuh HTTPS atau localhost).');
  }
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, key, 256);
  return toHex(bits);
}

export const isValidPin = (pin: string) => new RegExp(`^\\d{${PIN_MIN},${PIN_MAX}}$`).test(pin);

// ---------- aksi ----------

export async function setPin(pin: string): Promise<void> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer as ArrayBuffer);
  const hash = await hashPin(pin, salt);
  writeStored({ salt, hash, locked: readStored()?.locked ?? [] });
  refresh();
}

export async function verifyPin(pin: string): Promise<boolean> {
  const s = readStored();
  if (!s) return false;
  return (await hashPin(pin, s.salt)) === s.hash;
}

/** Ganti PIN. Mengembalikan false bila PIN lama salah. */
export async function changePin(oldPin: string, newPin: string): Promise<boolean> {
  if (!(await verifyPin(oldPin))) return false;
  await setPin(newPin);
  return true;
}

/** Hapus PIN + semua tanda kunci (catatan jadi terbuka). Butuh PIN yang benar. */
export async function removePin(pin: string): Promise<boolean> {
  if (!(await verifyPin(pin))) return false;
  writeStored(null);
  writeUnlocked([]);
  refresh();
  return true;
}

/** Dipakai untuk "Lupa PIN" setelah akun diverifikasi ulang dengan password. */
export function forceRemovePin() {
  writeStored(null);
  writeUnlocked([]);
  refresh();
}

export function lockDiary(id: number) {
  const s = readStored();
  if (!s) return;
  if (!s.locked.includes(id)) writeStored({ ...s, locked: [...s.locked, id] });
  writeUnlocked(readUnlocked().filter((x) => x !== id));
  refresh();
}

/** Hapus tanda kunci selamanya (butuh catatan sudah dibuka). */
export function removeLock(id: number) {
  const s = readStored();
  if (!s) return;
  writeStored({ ...s, locked: s.locked.filter((x) => x !== id) });
  writeUnlocked(readUnlocked().filter((x) => x !== id));
  refresh();
}

/** Buka sementara selama sesi tab ini. */
export function unlockForSession(id: number) {
  const ids = readUnlocked();
  if (!ids.includes(id)) writeUnlocked([...ids, id]);
  refresh();
}

/** Kunci ulang segera (tanpa menghapus tanda kunci). */
export function relock(id: number) {
  writeUnlocked(readUnlocked().filter((x) => x !== id));
  refresh();
}
