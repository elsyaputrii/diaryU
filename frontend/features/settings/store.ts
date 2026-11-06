import {
  AppSettings,
  DEFAULT_SETTINGS,
  FONTS,
  FONT_SIZES,
  SETTINGS_STORAGE_KEY,
  THEMES,
} from './constants';

/**
 * Penyimpanan pengaturan tema, font & ukuran teks di localStorage.
 * Dibuat sebagai "store" kecil agar bisa dipakai React lewat useSyncExternalStore
 * (lihat hooks/useSettings.ts). Nanti bisa diganti ke backend tanpa mengubah komponen.
 */

let cached: AppSettings | null = null;
const listeners = new Set<() => void>();

function read(): AppSettings {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
    return {
      theme: THEMES.some((t) => t.value === raw.theme) ? raw.theme : DEFAULT_SETTINGS.theme,
      font: FONTS.some((f) => f.value === raw.font) ? raw.font : DEFAULT_SETTINGS.font,
      size: FONT_SIZES.some((s) => s.value === raw.size) ? raw.size : DEFAULT_SETTINGS.size,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Pasang pengaturan ke <html data-theme data-font data-size> -> CSS di globals.css yang bekerja. */
function applyToDocument(settings: AppSettings) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.font = settings.font;
  root.dataset.size = settings.size;
}

function notify() {
  listeners.forEach((l) => l());
}

export function getSnapshot(): AppSettings {
  if (!cached) cached = read();
  return cached;
}

/** Dipakai saat render di server (localStorage belum ada). */
export function getServerSnapshot(): AppSettings {
  return DEFAULT_SETTINGS;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // Sinkron antar tab browser
  const onStorage = (e: StorageEvent) => {
    if (e.key !== SETTINGS_STORAGE_KEY) return;
    cached = read();
    applyToDocument(cached);
    notify();
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function updateSettings(patch: Partial<AppSettings>) {
  cached = { ...getSnapshot(), ...patch };
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // localStorage penuh / diblokir: pengaturan tetap aktif selama tab terbuka
  }
  applyToDocument(cached);
  notify();
}

export function resetSettings() {
  updateSettings(DEFAULT_SETTINGS);
}
