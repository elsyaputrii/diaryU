'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/components/ui/Loading';
import ErrorNotice from '@/components/ui/ErrorNotice';
import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import DayEntriesPanel from '@/features/calendar/components/DayEntriesPanel';
import MonthSwitcher from '@/features/calendar/components/MonthSwitcher';
import { useDiaries } from '@/features/diary/hooks/useDiaries';
import { groupByDate } from '@/features/diary/utils';
import { parseISODate, todayISO } from '@/lib/date';

function CalendarContent() {
  const params = useSearchParams();
  const today = todayISO();
  const dateParam = params.get('date');
  const initial = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today;

  const { diaries, loading, error, reload } = useDiaries();
  const [selected, setSelected] = useState(initial);
  const [view, setView] = useState(() => {
    const d = parseISODate(initial);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const byDate = useMemo(() => groupByDate(diaries), [diaries]);

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Kalender Diary</h1>
          <p className="text-sm text-ink-muted">Telusuri catatan berdasarkan tanggal penulisan.</p>
        </div>
        <MonthSwitcher year={view.year} month={view.month} onPrev={() => shift(-1)} onNext={() => shift(1)} />
      </div>

      {loading ? (
        <Loading text="Memuat kalender..." />
      ) : error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : (
        <>
          <CalendarGrid
            year={view.year}
            month={view.month}
            entriesByDate={byDate}
            selectedDate={selected}
            today={today}
            onSelect={setSelected}
          />
          <DayEntriesPanel date={selected} entries={byDate[selected] ?? []} canWrite={selected <= today} />
        </>
      )}
    </>
  );
}

export default function CalendarPage() {
  return (
    <PageShell width="max-w-4xl">
      <Suspense fallback={<Loading />}>
        <CalendarContent />
      </Suspense>
    </PageShell>
  );
}