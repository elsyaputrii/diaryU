'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BarChart2, History, Smile, Sparkles } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/components/ui/Loading';
import ErrorNotice from '@/components/ui/ErrorNotice';
import EmptyState from '@/components/ui/EmptyState';
import MonthSwitcher from '@/features/calendar/components/MonthSwitcher';
import { useDiaries } from '@/features/diary/hooks/useDiaries';
import { MOODS } from '@/features/mood/constants';
import MoodDistribution from '@/features/mood/components/MoodDistribution';
import MoodHistory from '@/features/mood/components/MoodHistory';
import MoodTrendChart from '@/features/mood/components/MoodTrendChart';
import {
  filterByRange,
  getMonthRange,
  getMonthlyTrend,
  getMoodDistribution,
  getWeekRange,
  getWeeklyTrend,
} from '@/features/mood/utils/stats';
import { todayISO } from '@/lib/date';

type Period = 'week' | 'month';

export default function MoodTrackerPage() {
  const { diaries, loading, error, reload } = useDiaries();
  const [period, setPeriod] = useState<Period>('week');
  const [view, setView] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const { inRange, points } = useMemo(() => {
    const range = period === 'week' ? getWeekRange() : getMonthRange(view.year, view.month);
    return {
      inRange: filterByRange(diaries, range.from, range.to),
      points: period === 'week' ? getWeeklyTrend(diaries) : getMonthlyTrend(diaries, view.year, view.month),
    };
  }, [diaries, period, view]);

  const distribution = useMemo(() => getMoodDistribution(inRange), [inRange]);

  return (
    <PageShell width="max-w-4xl">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-primary text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Emotional Well-being
        </span>
        <h1 className="text-2xl font-bold text-ink">Mood Tracker & Statistik</h1>
        <p className="text-sm text-ink-muted">Analisis suasana hati berdasarkan catatan diary harianmu.</p>
      </div>

      {/* Check-in mood hari ini */}
      <section aria-label="Pilih mood hari ini" className="bg-surface border border-line rounded-3xl p-5 mb-6">
        <h2 className="text-sm font-bold text-ink mb-3">Bagaimana perasaanmu hari ini?</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {MOODS.map((m) => (
            <Link
              key={m.type}
              href={`/diary/create?mood=${m.type}&date=${todayISO()}`}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl border border-line-strong bg-field hover:bg-hover transition text-xs font-semibold text-ink-soft"
            >
              <span className="text-2xl" aria-hidden>{m.emoji}</span>
              {m.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-ink-muted mt-3">Pilih mood untuk langsung menulis catatan hari ini.</p>
      </section>

      {loading ? (
        <Loading text="Menghitung statistik mood..." />
      ) : error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : diaries.length === 0 ? (
        <EmptyState
          icon={Smile}
          title="Belum ada data mood"
          description="Mulai tulis diary dengan memilih mood harianmu."
          action={{ label: 'Tulis Diary', href: '/diary/create' }}
        />
      ) : (
        <div className="space-y-6">
          {/* Pilih periode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div role="tablist" aria-label="Periode" className="inline-flex bg-hover rounded-2xl p-1 self-start">
              {([['week', '7 Hari Terakhir'], ['month', 'Bulanan']] as const).map(([value, label]) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={period === value}
                  onClick={() => setPeriod(value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    period === value ? 'bg-surface text-primary shadow-xs' : 'text-ink-soft'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {period === 'month' && (
              <MonthSwitcher year={view.year} month={view.month} onPrev={() => shift(-1)} onNext={() => shift(1)} />
            )}
          </div>

          <section className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-5">
              <BarChart2 className="w-5 h-5 text-primary" /> Grafik Suasana Hati
            </h3>
            <MoodTrendChart points={points} showEmoji={period === 'week'} />
          </section>

          <section className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-ink mb-5">Distribusi Suasana Hati</h3>
            {distribution.length === 0 ? (
              <p className="text-sm text-ink-muted">Belum ada catatan pada periode ini.</p>
            ) : (
              <MoodDistribution stats={distribution} />
            )}
          </section>

          <section className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-xs">
            <h3 className="text-lg font-bold text-ink flex items-center gap-2 mb-3">
              <History className="w-5 h-5 text-primary" /> Riwayat Mood
            </h3>
            {inRange.length === 0 ? (
              <p className="text-sm text-ink-muted">Belum ada catatan pada periode ini.</p>
            ) : (
              <MoodHistory diaries={inRange} />
            )}
          </section>
        </div>
      )}
    </PageShell>
  );
}
