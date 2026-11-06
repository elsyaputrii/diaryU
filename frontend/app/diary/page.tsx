'use client';

import Link from 'next/link';
import { BookOpen, PlusCircle, SearchX } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/components/ui/Loading';
import ErrorNotice from '@/components/ui/ErrorNotice';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { buttonPrimary } from '@/components/ui/styles';
import DiaryCard from '@/features/diary/components/DiaryCard';
import DiaryFilters from '@/features/diary/components/DiaryFilters';
import { useDiaries } from '@/features/diary/hooks/useDiaries';
import { useDiaryFilters } from '@/features/diary/hooks/useDiaryFilters';
import { useDeleteDiary } from '@/features/diary/hooks/useDeleteDiary';
import { usePrivacy } from '@/features/private/hooks/usePrivacy';

export default function DiaryListPage() {
  const { diaries, loading, error, reload, removeLocal } = useDiaries();
  const { isHidden } = usePrivacy();
  const { filters, setFilter, reset, hasActiveFilters, filtered } = useDiaryFilters(diaries, isHidden);
  const del = useDeleteDiary((d) => removeLocal(d.id));

  return (
    <PageShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Semua Catatan Diary</h1>
          <p className="text-sm text-ink-muted">Arsip lengkap cerita dan perjalanan emosimu.</p>
        </div>
        <Link href="/diary/create" className={buttonPrimary}>
          <PlusCircle className="w-5 h-5" /> Tulis Baru
        </Link>
      </div>

      <DiaryFilters filters={filters} onChange={setFilter} onReset={reset} hasActiveFilters={hasActiveFilters} />

      {loading ? (
        <Loading text="Memuat daftar diary..." />
      ) : error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : diaries.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada catatan"
          description="Mulai tulis cerita pertamamu hari ini."
          action={{ label: 'Tulis Catatan Pertama', href: '/diary/create' }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Tidak ada catatan ditemukan"
          description="Coba ubah kata kunci pencarian, filter mood, atau rentang tanggal."
        />
      ) : (
        <>
          <p className="text-xs text-ink-muted mb-4" aria-live="polite">
            Menampilkan {filtered.length} dari {diaries.length} catatan
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((d) => (
              <DiaryCard key={d.id} diary={d} onDelete={del.askDelete} />
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!del.target}
        title="Hapus catatan ini?"
        message={`"${del.target?.title ?? ''}" akan dihapus permanen dan tidak bisa dikembalikan.`}
        loading={del.deleting}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </PageShell>
  );
}
