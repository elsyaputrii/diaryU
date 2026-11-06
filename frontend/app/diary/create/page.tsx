'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import ErrorNotice from '@/components/ui/ErrorNotice';
import Loading from '@/components/ui/Loading';
import DiaryForm from '@/features/diary/components/DiaryForm';
import { createDiary } from '@/features/diary/services/diaryService';
import type { DiaryFormValues } from '@/features/diary/validation';
import { MOODS } from '@/features/mood/constants';
import { lockDiary } from '@/features/private/store';
import { getErrorMessage } from '@/lib/errors';
import { todayISO } from '@/lib/date';
import { useToast } from '@/providers/ToastProvider';
import type { MoodType } from '@/types';

function CreateDiaryContent() {
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Bisa dibuka dari kalender (?date=2026-10-19) atau Mood Tracker (?mood=happy)
  const dateParam = params.get('date') ?? '';
  const moodParam = params.get('mood') as MoodType | null;
  const initialValues: DiaryFormValues = {
    title: '',
    content: '',
    mood: MOODS.some((m) => m.type === moodParam) ? (moodParam as MoodType) : 'happy',
    entryDate: /^\d{4}-\d{2}-\d{2}$/.test(dateParam) && dateParam <= todayISO() ? dateParam : todayISO(),
    isPrivate: false,
  };

  const handleSubmit = async (values: DiaryFormValues) => {
    setSubmitting(true);
    setError('');
    try {
      const created = await createDiary({
        title: values.title.trim(),
        content: values.content.trim(),
        mood: values.mood,
        entry_date: values.entryDate,
      });
      if (values.isPrivate) lockDiary(created.id);
      toast.success('Catatan berhasil disimpan.');
      router.push('/diary');
    } catch (err) {
      const message = getErrorMessage(err, 'Gagal menyimpan diary.');
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Link href="/diary" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Diary
        </Link>
        <h1 className="text-2xl font-bold text-ink">Tulis Catatan Baru</h1>
        <p className="text-sm text-ink-muted">Abadikan momen dan perasaanmu hari ini.</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorNotice message={error} />
        </div>
      )}

      <DiaryForm initialValues={initialValues} submitLabel="Simpan Catatan" submitting={submitting} onSubmit={handleSubmit} cancelHref="/diary" />
    </>
  );
}

export default function CreateDiaryPage() {
  return (
    <PageShell width="max-w-3xl">
      <Suspense fallback={<Loading />}>
        <CreateDiaryContent />
      </Suspense>
    </PageShell>
  );
}
