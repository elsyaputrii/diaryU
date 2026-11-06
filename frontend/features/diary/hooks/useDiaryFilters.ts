'use client';

import { useMemo, useState } from 'react';
import type { Diary } from '@/types';

export interface DiaryFilterValues {
  query: string; // kata kunci judul / isi
  mood: string; // 'all' atau salah satu MoodType
  dateFrom: string; // YYYY-MM-DD atau ''
  dateTo: string; // YYYY-MM-DD atau ''
}

const INITIAL: DiaryFilterValues = { query: '', mood: 'all', dateFrom: '', dateTo: '' };

/** Logika pencarian + filter (mood & rentang tanggal) untuk halaman daftar diary. */
/** `isHidden`: catatan privat yang belum dibuka tidak ikut pencarian teks (supaya isinya tidak bocor). */
export function useDiaryFilters(diaries: Diary[], isHidden: (id: number) => boolean = () => false) {
  const [filters, setFilters] = useState<DiaryFilterValues>(INITIAL);

  const setFilter = <K extends keyof DiaryFilterValues>(key: K, value: DiaryFilterValues[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => setFilters(INITIAL);

  const hasActiveFilters =
    filters.query !== '' || filters.mood !== 'all' || filters.dateFrom !== '' || filters.dateTo !== '';

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return diaries.filter((d) => {
      if (q && (isHidden(d.id) || (!d.title.toLowerCase().includes(q) && !d.content.toLowerCase().includes(q)))) return false;
      if (filters.mood !== 'all' && d.mood !== filters.mood) return false;
      if (filters.dateFrom && d.entry_date < filters.dateFrom) return false;
      if (filters.dateTo && d.entry_date > filters.dateTo) return false;
      return true;
    });
  }, [diaries, filters, isHidden]);

  return { filters, setFilter, reset, hasActiveFilters, filtered };
}
