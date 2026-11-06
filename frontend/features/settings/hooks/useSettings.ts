'use client';

import { useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, resetSettings, subscribe, updateSettings } from '../store';
import type { FontName, FontSize, ThemeName } from '../constants';

/** Membaca pengaturan saat ini + fungsi untuk mengubah tema / font / ukuran teks. */
export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    theme: settings.theme,
    font: settings.font,
    size: settings.size,
    setTheme: (theme: ThemeName) => updateSettings({ theme }),
    setFont: (font: FontName) => updateSettings({ font }),
    setSize: (size: FontSize) => updateSettings({ size }),
    reset: resetSettings,
  };
}
