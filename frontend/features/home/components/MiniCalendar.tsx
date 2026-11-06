'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DAY_NAMES_SHORT, todayISO } from '@/lib/date';
import MonthSwitcher from '@/features/calendar/components/MonthSwitcher';
import { buildMonthCells } from '@/features/calendar/utils';

/** Kalender ringkas untuk Home: titik = ada catatan. Klik tanggal -> halaman Kalender. */
export default function MiniCalendar({ datesWithEntries }: { datesWithEntries: Set<string> }) {
  const [view, setView] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const today = todayISO();
  const cells = buildMonthCells(view.year, view.month);

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <section aria-label="Kalender ringkas" className="bg-surface border border-line rounded-3xl p-5">
      <div className="flex justify-center mb-4">
        <MonthSwitcher year={view.year} month={view.month} onPrev={() => shift(-1)} onNext={() => shift(1)} />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-ink-muted uppercase mb-1">
        {DAY_NAMES_SHORT.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />;
          const has = datesWithEntries.has(date);
          const isToday = date === today;
          return (
            <Link
              key={date}
              href={`/calendar?date=${date}`}
              aria-label={`${Number(date.slice(8))}${has ? ', ada catatan' : ''}`}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-semibold transition hover:bg-hover ${
                isToday ? 'bg-primary text-on-primary hover:bg-primary-hover' : 'text-ink'
              }`}
            >
              {Number(date.slice(8))}
              <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${has ? (isToday ? 'bg-on-primary' : 'bg-accent') : 'bg-transparent'}`} />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
