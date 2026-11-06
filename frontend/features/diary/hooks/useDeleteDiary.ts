'use client';

import { useState } from 'react';
import type { Diary } from '@/types';
import { useToast } from '@/providers/ToastProvider';
import { getErrorMessage } from '@/lib/errors';
import { removeLock } from '@/features/private/store';
import { deleteDiary } from '../services/diaryService';

/**
 * Alur hapus diary dengan konfirmasi:
 *   1. askDelete(diary)  -> membuka kotak konfirmasi
 *   2. confirm()         -> memanggil API, lalu toast berhasil / gagal
 *   3. cancel()          -> menutup kotak konfirmasi
 *
 * Pasangkan dengan <ConfirmDialog open={!!target} ... />.
 */
export function useDeleteDiary(onDeleted: (diary: Diary) => void) {
  const toast = useToast();
  const [target, setTarget] = useState<Diary | null>(null);
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await deleteDiary(target.id);
      removeLock(target.id);
      toast.success('Catatan berhasil dihapus.');
      onDeleted(target);
      setTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus catatan.'));
    } finally {
      setDeleting(false);
    }
  };

  return {
    target,
    deleting,
    askDelete: (diary: Diary) => setTarget(diary),
    cancel: () => setTarget(null),
    confirm,
  };
}
