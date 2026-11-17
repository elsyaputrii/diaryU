'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Repeat2 } from 'lucide-react';
import type { DiarySocial } from '../hooks/useDiarySocial';
import RepostDialog from './RepostDialog';

interface Props {
  social: DiarySocial;
  /** Dipanggil saat ikon komentar ditekan (buka/tutup bagian komentar). */
  onToggleComments: () => void;
  commentsOpen: boolean;
}

const base = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition';

/** Baris tombol ala X: komentar, repost, like. Angka di sebelah ikon = jumlahnya. */
export default function ActionBar({ social, onToggleComments, commentsOpen }: Props) {
  const [repostOpen, setRepostOpen] = useState(false);
  const { liked, likes, reposted, reposts, comments } = social;

  return (
    <>
      <div className="flex items-center justify-between -mx-2 pt-3 border-t border-line">
        <button
          type="button"
          onClick={onToggleComments}
          aria-expanded={commentsOpen}
          aria-label={`Komentar, ${comments}`}
          className={`${base} ${commentsOpen ? 'text-primary bg-accent-soft' : 'text-ink-muted hover:bg-hover hover:text-primary'}`}
        >
          <MessageCircle className="w-4 h-4" /> {comments}
        </button>

        <button
          type="button"
          onClick={() => setRepostOpen(true)}
          aria-label={`Repost, ${reposts}`}
          aria-pressed={reposted}
          className={`${base} ${reposted ? 'text-success bg-success-soft' : 'text-ink-muted hover:bg-hover hover:text-success'}`}
        >
          <Repeat2 className="w-4 h-4" /> {reposts}
        </button>

        <button
          type="button"
          onClick={social.toggleLike}
          aria-label={`${liked ? 'Batal suka' : 'Suka'}, ${likes}`}
          aria-pressed={liked}
          className={`${base} ${liked ? 'text-accent bg-accent-soft' : 'text-ink-muted hover:bg-hover hover:text-accent'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} /> {likes}
        </button>
      </div>

      <RepostDialog open={repostOpen} onClose={() => setRepostOpen(false)} social={social} />
    </>
  );
}
