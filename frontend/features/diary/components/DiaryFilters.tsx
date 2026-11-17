'use client';

import { Search, RotateCcw } from 'lucide-react';
import { MOODS } from '@/features/mood/constants';
import { inputClass } from '@/components/ui/styles';
import type { DiaryFilterValues } from '../hooks/useDiaryFilters';

interface Props {
  filters: DiaryFilterValues;
  onChange: <K extends keyof DiaryFilterValues>(key: K, value: DiaryFilterValues[K]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

/** Panel pencarian + filter mood + filter rentang tanggal. */
export default function DiaryFilters({ filters, onChange, onReset, hasActiveFilters }: Props) {
  const moodOptions = [{ type: 'all', label: 'Semua', emoji: '' }, ...MOODS];

  return (
    <section
      aria-label="Pencarian dan filter catatan"
      className="bg-surface border border-line rounded-3xl p-4 md:p-6 mb-8 space-y-4 shadow-xs"
    >
      {/* Baris 1: pencarian + rentang tanggal */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-ink-muted">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onChange('query', e.target.value)}
            placeholder="Cari judul atau isi catatan..."
            aria-label="Cari catatan"
            className={`${inputClass} pl-12 py-2.5`}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(e) => onChange('dateFrom', e.target.value)}
            aria-label="Dari tanggal"
            className={`${inputClass} py-2.5`}
          />
          <span className="text-ink-muted text-sm">s/d</span>
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(e) => onChange('dateTo', e.target.value)}
            aria-label="Sampai tanggal"
            className={`${inputClass} py-2.5`}
          />
        </div>
      </div>

      {/* Baris 2: chip mood */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {moodOptions.map((m) => (
          <button
            key={m.type}
            onClick={() => onChange('mood', m.type)}
            aria-pressed={filters.mood === m.type}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition ${
              filters.mood === m.type
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-hover text-ink-soft hover:bg-line'
            }`}
          >
            {m.emoji && <span className="mr-1">{m.emoji}</span>}
            {m.label}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-danger hover:bg-danger-soft transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset filter
          </button>
        )}
      </div>
    </section>
  );
}