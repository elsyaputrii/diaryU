import { apiClient } from '@/services/api';
import type { Diary, DiaryPayload } from '@/types';
import { sortNewestFirst } from '../utils';

/**
 * Semua panggilan API diary ada di sini. Komponen & halaman tidak perlu tahu
 * URL atau bentuk respons backend — cukup panggil fungsi-fungsi ini.
 */

/** Pastikan entry_date selalu "YYYY-MM-DD" (Laravel kadang mengirim "2026-10-19T00:00:00Z"). */
function normalize(diary: Diary): Diary {
  return { ...diary, entry_date: diary.entry_date.slice(0, 10) };
}

export async function getDiaries(): Promise<Diary[]> {
  const res = await apiClient.get('/diaries');
  // Mendukung respons biasa (data: [...]) maupun paginasi (data: { data: [...] })
  const list: Diary[] = res.data.data?.data || res.data.data || [];
  return sortNewestFirst(list.map(normalize));
}

export async function getDiary(id: string | number): Promise<Diary> {
  const res = await apiClient.get(`/diaries/${id}`);
  return normalize(res.data.data);
}

export async function createDiary(payload: DiaryPayload): Promise<Diary> {
  const res = await apiClient.post('/diaries', payload);
  return normalize(res.data.data);
}

export async function updateDiary(id: string | number, payload: DiaryPayload): Promise<Diary> {
  const res = await apiClient.put(`/diaries/${id}`, payload);
  return normalize(res.data.data);
}

export async function deleteDiary(id: string | number): Promise<void> {
  await apiClient.delete(`/diaries/${id}`);
}

/**
 * Unggah 1-4 gambar ke catatan milik sendiri. Mengembalikan catatan terbaru (lengkap dengan daftar gambar).
 * Header multipart wajib diisi manual karena apiClient memakai JSON sebagai default.
 */
export async function uploadDiaryImages(id: string | number, files: File[]): Promise<Diary> {
  const form = new FormData();
  files.forEach((file) => form.append('images[]', file));
  const res = await apiClient.post(`/diaries/${id}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalize(res.data.data);
}

export async function deleteDiaryImage(id: string | number, imageId: number): Promise<Diary> {
  const res = await apiClient.delete(`/diaries/${id}/images/${imageId}`);
  return normalize(res.data.data);
}
