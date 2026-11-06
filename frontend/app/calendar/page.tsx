'use client';

import { useMemo, useState } from 'react';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/components/ui/Loading';
import ErrorNotice from '@/components/ui/ErrorNotice';
import { todayISO } from '@/lib/date';
import { useDiaries } from '@/features/diary/hooks/useDiaries';
import { groupByDate } from '@/features/diary/utils';
import CalendarGrid from '@/features/calendar/components/CalendarGrid';
import DayEntriesPanel from '@/features/calendar/components/DayEntriesPanel';
import MonthSwitcher from '@/features/calendar/components/MonthSwitcher';

export default function CalendarPage() {
  const { diaries, loading, error, reload } = useDiaries();

  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState(today);

  const entriesByDate = useMemo(() => groupByDate(diaries), [diaries]);

  const shiftMonth = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <PageShell width="max-w-4xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Kalender Diary</h1>
          <p className="text-sm text-ink-muted">Telusuri catatan berdasarkan tanggal penulisan.</p>
        </div>
        <MonthSwitcher
          year={cursor.year}
          month={cursor.month}
          onPrev={() => shiftMonth(-1)}
          onNext={() => shiftMonth(1)}
        />
      </div>

      {loading ? (
        <Loading text="Memuat kalender..." />
      ) : error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : (
        <>
          <CalendarGrid
            year={cursor.year}
            month={cursor.month}
            entriesByDate={entriesByDate}
            selectedDate={selectedDate}
            today={today}
            onSelect={setSelectedDate}
          />
          <DayEntriesPanel
            date={selectedDate}
            entries={entriesByDate[selectedDate] ?? []}
            canWrite={selectedDate <= today}
          />
        </>
      )}
    </PageShell>
  );
}
