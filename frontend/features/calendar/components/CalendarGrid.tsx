'use client';

import type { Diary } from '@/types';
import { DAY_NAMES_SHORT } from '@/lib/date';
import { getMood } from '@/features/mood/constants';
import { usePrivacy } from '@/features/private/hooks/usePrivacy';
import { buildMonthCells } from '../utils';

interface Props {
  year: number;
  month: number;
  entriesByDate: Record<string, Diary[]>;
  selectedDate: string;
  today: string;
  onSelect: (date: string) => void;
}

/**
 * Grid kalender bulanan. Satu tanggal bisa berisi BANYAK catatan:
 *  - di layar lebar: tampil 2 judul pertama + "+N lainnya"
 *  - di ponsel: tampil emoji mood + jumlah catatan (ruang sempit)
 * Klik tanggal -> catatan lengkapnya tampil di DayEntriesPanel.
 */
export default function CalendarGrid({ year, month, entriesByDate, selectedDate, today, onSelect }: Props) {
  const cells = buildMonthCells(year, month);
  const { isHidden } = usePrivacy();

  return (
    <div className="bg-surface border border-line rounded-3xl p-3 sm:p-6 shadow-xs">
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 text-center font-semibold text-[10px] sm:text-xs text-ink-muted uppercase">
        {DAY_NAMES_SHORT.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;

          const entries = entriesByDate[date] ?? [];
          const day = Number(date.slice(8));
          const isSelected = date === selectedDate;
          const isToday = date === today;

          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              aria-pressed={isSelected}
              aria-label={`${day}, ${entries.length} catatan`}
              className={`min-h-14 sm:min-h-24 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border text-left flex flex-col gap-1 transition overflow-hidden ${
                isSelected
                  ? 'bg-accent-soft border-primary'
                  : entries.length > 0
                    ? 'bg-accent-soft/50 border-line-strong hover:bg-accent-soft'
                    : 'bg-field border-line hover:bg-hover'
              }`}
            >
              <span
                className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-primary text-on-primary' : 'text-ink'
                }`}
              >
                {day}
              </span>

              {entries.length > 0 && (
                <>
                  {/* Ponsel */}
                  <span className="sm:hidden text-[11px] text-ink-soft leading-none">
                    {isHidden(entries[0].id) ? '🔒' : getMood(entries[0].mood).emoji}
                    {entries.length > 1 && <b className="ml-0.5">×{entries.length}</b>}
                  </span>

                  {/* Layar lebar */}
                  <span className="hidden sm:block space-y-0.5 min-w-0">
                    {entries.slice(0, 2).map((e) => (
                      <span key={e.id} className="block text-[10px] font-semibold text-primary truncate">
                        {isHidden(e.id) ? '🔒 Privat' : `${getMood(e.mood).emoji} ${e.title}`}
                      </span>
                    ))}
                    {entries.length > 2 && (
                      <span className="block text-[10px] text-ink-muted">+{entries.length - 2} lainnya</span>
                    )}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
