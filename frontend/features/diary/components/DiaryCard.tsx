'use client';

import Link from 'next/link';
import { Calendar, Lock, Trash2 } from 'lucide-react';
import type { Diary } from '@/types';
import { formatLongDate } from '@/lib/date';
import MoodBadge from '@/features/mood/components/MoodBadge';
import { usePrivacy } from '@/features/private/hooks/usePrivacy';

interface Props {
  diary: Diary;
  /** Jika diisi, tombol hapus (ikon tempat sampah) akan muncul. */
  onDelete?: (diary: Diary) => void;
}

/**
 * Kartu ringkasan satu catatan. Dipakai di Home, Daftar Diary, dan Kalender.
 * Catatan privat yang belum dibuka tampil tersamar (judul & isi disembunyikan).
 */
export default function DiaryCard({ diary, onDelete }: Props) {
  const { isLocked, isHidden } = usePrivacy();
  const hidden = isHidden(diary.id);
  const locked = isLocked(diary.id);

  return (
    <article className="bg-surface border border-line rounded-3xl p-6 hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          {hidden ? (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-accent-soft text-primary rounded-full font-medium">
              <Lock className="w-3 h-3" /> Privat
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <MoodBadge mood={diary.mood} />
              {locked && <Lock className="w-3.5 h-3.5 text-ink-muted" aria-label="Catatan privat" />}
            </span>
          )}
          <span className="text-xs text-ink-muted flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5" /> {formatLongDate(diary.entry_date)}
          </span>
        </div>
        <h3 className="text-lg font-bold text-ink mb-2 line-clamp-1">{hidden ? 'Catatan Pribadi' : diary.title}</h3>
        <p className="text-sm text-ink-soft line-clamp-3 mb-5">
          {hidden ? 'Isi catatan ini terkunci. Masukkan PIN untuk membukanya.' : diary.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-line">
        <Link href={`/diary/${diary.id}`} className="text-xs font-bold text-primary hover:underline">
          {hidden ? 'Buka dengan PIN' : 'Baca Selengkapnya'} &rarr;
        </Link>
        {onDelete && !hidden && (
          <button
            onClick={() => onDelete(diary)}
            className="text-danger hover:bg-danger-soft p-2 rounded-xl transition"
            title="Hapus catatan"
            aria-label={`Hapus catatan ${diary.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </article>
  );
}
