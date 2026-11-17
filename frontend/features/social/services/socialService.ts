import { apiClient } from '@/services/api';
import type { DiaryComment } from '@/types';

/** Semua panggilan like / repost / komentar. Hanya berlaku untuk catatan yang publik. */

export interface LikeState {
  liked: boolean;
  likes_count: number;
}

export interface RepostState {
  reposted: boolean;
  reposts_count: number;
}

export async function likeDiary(id: number): Promise<LikeState> {
  const res = await apiClient.post(`/diaries/${id}/like`);
  return res.data.data;
}

export async function unlikeDiary(id: number): Promise<LikeState> {
  const res = await apiClient.delete(`/diaries/${id}/like`);
  return res.data.data;
}

/** quote kosong = repost biasa; diisi = kutip. */
export async function repostDiary(id: number, quote?: string): Promise<RepostState> {
  const body = quote?.trim() ? { quote: quote.trim() } : {};
  const res = await apiClient.post(`/diaries/${id}/repost`, body);
  return res.data.data;
}

export async function unrepostDiary(id: number): Promise<RepostState> {
  const res = await apiClient.delete(`/diaries/${id}/repost`);
  return res.data.data;
}

export async function getComments(diaryId: number): Promise<DiaryComment[]> {
  const res = await apiClient.get(`/diaries/${diaryId}/comments`);
  return res.data.data ?? [];
}

export async function addComment(diaryId: number, body: string, parentId?: number): Promise<DiaryComment> {
  const res = await apiClient.post(`/diaries/${diaryId}/comments`, {
    body: body.trim(),
    ...(parentId ? { parent_id: parentId } : {}),
  });
  return res.data.data;
}

export async function deleteComment(commentId: number): Promise<void> {
  await apiClient.delete(`/comments/${commentId}`);
}
