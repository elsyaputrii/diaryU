import { todayISO } from '@/lib/date';
import type { MoodType } from '@/types';

/** Nilai yang diisi pengguna di form diary. */
export interface DiaryFormValues {
  title: string;
  content: string;
  mood: MoodType;
  entryDate: string; // YYYY-MM-DD
  /** Catatan privat (dikunci PIN). Disimpan di sisi browser, bukan dikirim ke API. */
  isPrivate?: boolean;
}

export type DiaryFormErrors = Partial<Record<keyof DiaryFormValues, string>>;

export const TITLE_MAX = 100;
export const CONTENT_MIN = 10;

/** Mengembalikan pesan error per field. Objek kosong ({}) berarti form valid. */
export function validateDiary(values: DiaryFormValues): DiaryFormErrors {
  const errors: DiaryFormErrors = {};

  const title = values.title.trim();
  if (!title) errors.title = 'Judul wajib diisi.';
  else if (title.length < 3) errors.title = 'Judul minimal 3 karakter.';
  else if (title.length > TITLE_MAX) errors.title = `Judul maksimal ${TITLE_MAX} karakter.`;

  const content = values.content.trim();
  if (!content) errors.content = 'Isi catatan wajib diisi.';
  else if (content.length < CONTENT_MIN) errors.content = `Isi catatan minimal ${CONTENT_MIN} karakter.`;

  if (!values.entryDate) errors.entryDate = 'Tanggal wajib diisi.';
  else if (values.entryDate > todayISO()) errors.entryDate = 'Tanggal tidak boleh di masa depan.';

  if (!values.mood) errors.mood = 'Pilih salah satu suasana hati.';

  return errors;
}
