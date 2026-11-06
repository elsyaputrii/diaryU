/** Pilihan tema, font, ukuran teks + nilai default. Satu-satunya tempat daftar ini ditulis. */

export const THEMES = [
  { value: 'light', label: 'Light', description: 'Terang & hangat' },
  { value: 'dark', label: 'Dark', description: 'Nyaman di malam hari' },
  { value: 'pastel', label: 'Pastel', description: 'Lembut pink & lavender' },
] as const;

export const FONTS = [
  { value: 'poppins', label: 'Poppins', description: 'Modern & bersih' },
  { value: 'nunito', label: 'Nunito', description: 'Bulat & ramah' },
  { value: 'playfair', label: 'Playfair Display', description: 'Elegan ala buku' },
] as const;

export const FONT_SIZES = [
  { value: 'sm', label: 'Kecil', sample: 'Aa', description: 'Lebih banyak teks per layar' },
  { value: 'md', label: 'Sedang', sample: 'Aa', description: 'Ukuran standar' },
  { value: 'lg', label: 'Besar', sample: 'Aa', description: 'Lebih mudah dibaca' },
] as const;

export type ThemeName = (typeof THEMES)[number]['value'];
export type FontName = (typeof FONTS)[number]['value'];
export type FontSize = (typeof FONT_SIZES)[number]['value'];

export interface AppSettings {
  theme: ThemeName;
  font: FontName;
  size: FontSize;
}

export const DEFAULT_SETTINGS: AppSettings = { theme: 'light', font: 'poppins', size: 'md' };
export const SETTINGS_STORAGE_KEY = 'elsya-diary-settings';
