'use client';

import { useCallback, useRef, useState } from 'react';
import type { Diary } from '@/types';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/providers/ToastProvider';
import { likeDiary, repostDiary, unlikeDiary, unrepostDiary } from '../services/socialService';

/**
 * Status & aksi sosial untuk SATU catatan: like, repost, jumlah komentar.
 * Like/repost memakai optimistic update: angka langsung berubah, lalu dikembalikan kalau server menolak.
 * Pakai `key={diary.id}` di komponen induk agar state ikut ter-reset untuk catatan lain.
 */
export function useDiarySocial(diary: Diary) {
  const toast = useToast();
  const [liked, setLiked] = useState(!!diary.liked);
  const [likes, setLikes] = useState(diary.likes_count ?? 0);
  const [reposted, setReposted] = useState(!!diary.reposted);
  const [reposts, setReposts] = useState(diary.reposts_count ?? 0);
  const [comments, setComments] = useState(diary.comments_count ?? 0);

  // Cegah klik beruntun mengirim permintaan ganda
  const busy = useRef({ like: false, repost: false });

  const toggleLike = useCallback(async () => {
    if (busy.current.like) return;
    busy.current.like = true;

    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikes((n) => Math.max(0, n + (wasLiked ? -1 : 1)));

    try {
      const state = await (wasLiked ? unlikeDiary(diary.id) : likeDiary(diary.id));
      setLiked(state.liked);
      setLikes(state.likes_count);
    } catch (err) {
      setLiked(wasLiked);
      setLikes((n) => Math.max(0, n + (wasLiked ? 1 : -1)));
      toast.error(getErrorMessage(err, 'Gagal memperbarui like.'));
    } finally {
      busy.current.like = false;
    }
  }, [liked, diary.id, toast]);

  /** Repost biasa / kutip (quote). Jika sudah repost, ini memperbarui kutipannya. */
  const repost = useCallback(
    async (quote?: string): Promise<boolean> => {
      if (busy.current.repost) return false;
      busy.current.repost = true;
      try {
        const state = await repostDiary(diary.id, quote);
        setReposted(state.reposted);
        setReposts(state.reposts_count);
        toast.success(quote?.trim() ? 'Kutipan dibagikan.' : 'Berhasil di-repost.');
        return true;
      } catch (err) {
        toast.error(getErrorMessage(err, 'Gagal me-repost.'));
        return false;
      } finally {
        busy.current.repost = false;
      }
    },
    [diary.id, toast]
  );

  const undoRepost = useCallback(async () => {
    if (busy.current.repost) return;
    busy.current.repost = true;
    try {
      const state = await unrepostDiary(diary.id);
      setReposted(state.reposted);
      setReposts(state.reposts_count);
      toast.info('Repost dibatalkan.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal membatalkan repost.'));
    } finally {
      busy.current.repost = false;
    }
  }, [diary.id, toast]);

  return { liked, likes, reposted, reposts, comments, setComments, toggleLike, repost, undoRepost };
}

export type DiarySocial = ReturnType<typeof useDiarySocial>;
