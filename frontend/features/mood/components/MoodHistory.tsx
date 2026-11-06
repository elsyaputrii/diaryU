'use client';

import Link from 'next/link';
import type { Diary } from '@/types';
import { formatLongDate } from '@/lib/date';
import { usePrivacy } from '@/features/private/hooks/usePrivacy';
import { getMood } from '../constants';

/** Riwayat mood: satu baris per catatan pada periode terpilih, terbaru di atas. */
export default function MoodHistory({ diaries }: { diaries: Diary[] }) {
  const { isHidden } = usePrivacy();

  return (
    <ul className="divide-y divide-line">
      {diaries.map((d) => {
        const m = getMood(d.mood);
        const hidden = isHidden(d.id);
        return (
          <li key={d.id}>
            <Link href={`/diary/${d.id}`} className="flex items-center gap-3 py-3 hover:bg-hover rounded-xl px-2 -mx-2 transition">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${m.color}33` }} aria-hidden>
                {m.emoji}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-ink truncate">{hidden ? '🔒 Catatan Pribadi' : d.title}</span>
                <span className="block text-xs text-ink-muted">{m.label}</span>
              </span>
              <span className="text-xs text-ink-muted shrink-0">{formatLongDate(d.entry_date)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
