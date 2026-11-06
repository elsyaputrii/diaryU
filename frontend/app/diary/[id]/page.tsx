'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Edit3, Lock, Trash2, Unlock } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/components/ui/Loading';
import ErrorNotice from '@/components/ui/ErrorNotice';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { buttonPrimary } from '@/components/ui/styles';
import DiaryForm from '@/features/diary/components/DiaryForm';
import MoodBadge from '@/features/mood/components/MoodBadge';
import PinGate from '@/features/private/components/PinGate';
import { usePrivacy } from '@/features/private/hooks/usePrivacy';
import { lockDiary, relock, removeLock } from '@/features/private/store';
import { useDeleteDiary } from '@/features/diary/hooks/useDeleteDiary';
import { getDiary, updateDiary } from '@/features/diary/services/diaryService';
import type { DiaryFormValues } from '@/features/diary/validation';
import { formatLongDate } from '@/lib/date';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/providers/ToastProvider';
import type { Diary } from '@/types';

export default function DiaryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const id = params.id;
  const { isLocked, isHidden } = usePrivacy();

  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const del = useDeleteDiary(() => router.replace('/diary'));

  useEffect(() => {
    let cancelled = false;
    getDiary(id)
      .then((d) => !cancelled && setDiary(d))
      .catch((err) => !cancelled && setError(getErrorMessage(err, 'Catatan tidak ditemukan.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const retry = useCallback(() => {
    setLoading(true);
    setError('');
    setReloadKey((k) => k + 1);
  }, []);

  const handleUpdate = async (values: DiaryFormValues) => {
    if (!diary) return;
    setSaving(true);
    try {
      const updated = await updateDiary(diary.id, {
        title: values.title.trim(),
        content: values.content.trim(),
        mood: values.mood,
        entry_date: values.entryDate,
      });
      if (values.isPrivate && !isLocked(diary.id)) lockDiary(diary.id);
      if (!values.isPrivate && isLocked(diary.id)) removeLock(diary.id);
      setDiary(updated);
      setIsEditing(false);
      toast.success('Perubahan berhasil disimpan.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal memperbarui diary.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell width="max-w-3xl">
        <Loading text="Memuat detail catatan..." />
      </PageShell>
    );
  }

  if (error || !diary) {
    return (
      <PageShell width="max-w-3xl">
        <ErrorNotice message={error || 'Catatan diary tidak ditemukan.'} onRetry={retry} />
        <div className="mt-6">
          <Link href="/diary" className={buttonPrimary}>
            Kembali ke Daftar
          </Link>
        </div>
      </PageShell>
    );
  }

  const locked = isLocked(diary.id);

  // Catatan privat yang belum dibuka: tampilkan hanya layar PIN
  if (isHidden(diary.id)) {
    return (
      <PageShell width="max-w-3xl">
        <PinGate diaryId={diary.id} />
      </PageShell>
    );
  }

  return (
    <PageShell width="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <Link href="/diary" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        {!isEditing && (
          <div className="flex items-center gap-2">
            {locked && (
              <button
                onClick={() => relock(diary.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-hover text-ink-soft hover:bg-line rounded-xl text-xs font-semibold transition"
              >
                <Lock className="w-3.5 h-3.5" /> Kunci Lagi
              </button>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-hover text-primary hover:bg-line rounded-xl text-xs font-semibold transition"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => del.askDelete(diary)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-danger-soft text-danger hover:opacity-80 rounded-xl text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <DiaryForm
          initialValues={{
            title: diary.title,
            content: diary.content,
            mood: diary.mood,
            entryDate: diary.entry_date,
            isPrivate: locked,
          }}
          submitLabel="Simpan Perubahan"
          submitting={saving}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <article className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <span className="inline-flex items-center gap-2">
              <MoodBadge mood={diary.mood} />
              {locked && (
                <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                  <Unlock className="w-3.5 h-3.5" /> Privat (terbuka)
                </span>
              )}
            </span>
            <span className="text-xs text-ink-muted flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {formatLongDate(diary.entry_date)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-ink">{diary.title}</h1>
          <div className="text-ink-soft leading-relaxed whitespace-pre-wrap wrap-break-word">{diary.content}</div>
        </article>
      )}

      <ConfirmDialog
        open={!!del.target}
        title="Hapus catatan ini?"
        message="Catatan akan dihapus permanen dan tidak bisa dikembalikan."
        loading={del.deleting}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </PageShell>
  );
}
