'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, PlusCircle, Sparkles, Smile } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/components/ui/Loading';
import ErrorNotice from '@/components/ui/ErrorNotice';
import EmptyState from '@/components/ui/EmptyState';
import { buttonPrimary } from '@/components/ui/styles';
import DiaryCard from '@/features/diary/components/DiaryCard';
import { useDiaries } from '@/features/diary/hooks/useDiaries';
import SummaryCards from '@/features/home/components/SummaryCards';
import MiniCalendar from '@/features/home/components/MiniCalendar';
import { summarizeActivity } from '@/features/home/utils';
import MoodDistribution from '@/features/mood/components/MoodDistribution';
import { getMoodDistribution } from '@/features/mood/utils/stats';

export default function HomePage() {
  const { diaries, loading, error, reload } = useDiaries();

  const summary = useMemo(() => summarizeActivity(diaries), [diaries]);
  const distribution = useMemo(() => getMoodDistribution(diaries), [diaries]);
  const dates = useMemo(() => new Set(diaries.map((d) => d.entry_date)), [diaries]);

  return (
    <PageShell>
      {/* Hero */}
      <div className="bg-linear-to-r from-hero-from to-hero-to rounded-3xl p-8 md:p-12 mb-8 border border-line shadow-sm">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface/70 text-primary text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Elsya Personal Sanctuary
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-ink mb-3">
            Catat setiap cerita, emosi, dan kenangan indahmu hari ini.
          </h1>
          <p className="text-ink-soft text-sm md:text-base mb-6">
            Tempat aman untuk merenung, melacak suasana hati, dan merekam perjalanan hidupmu dengan gaya minimalis dan elegan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/diary/create" className={buttonPrimary}>
              <PlusCircle className="w-5 h-5" /> Tulis Diary Baru
            </Link>
            <Link
              href="/diary"
              className="inline-flex items-center gap-2 px-6 py-3 bg-surface/80 hover:bg-surface text-primary font-medium rounded-2xl border border-line-strong transition text-sm"
            >
              Lihat Semua Catatan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading text="Memuat ringkasan..." />
      ) : error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : (
        <>
          <SummaryCards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Aktivitas terbaru */}
            <section className="lg:col-span-2 space-y-5" aria-label="Catatan terbaru">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Catatan Terbaru
                </h2>
                <Link href="/diary" className="text-sm font-semibold text-accent hover:underline">
                  Lihat Semua &rarr;
                </Link>
              </div>
              {diaries.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title="Belum ada catatan"
                  description="Belum ada catatan diary yang tersimpan."
                  action={{ label: 'Buat Catatan Pertama', href: '/diary/create' }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {diaries.slice(0, 4).map((d) => (
                    <DiaryCard key={d.id} diary={d} />
                  ))}
                </div>
              )}
            </section>

            {/* Kalender + mood */}
            <aside className="space-y-6">
              <MiniCalendar datesWithEntries={dates} />
              <section aria-label="Ringkasan mood" className="bg-surface border border-line rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-ink flex items-center gap-2">
                    <Smile className="w-4 h-4 text-primary" /> Mood Kamu
                  </h2>
                  <Link href="/mood" className="text-xs font-semibold text-accent hover:underline">
                    Detail &rarr;
                  </Link>
                </div>
                {distribution.length === 0 ? (
                  <p className="text-sm text-ink-muted">Belum ada data mood.</p>
                ) : (
                  <MoodDistribution stats={distribution.slice(0, 4)} />
                )}
              </section>
            </aside>
          </div>
        </>
      )}
    </PageShell>
  );
}