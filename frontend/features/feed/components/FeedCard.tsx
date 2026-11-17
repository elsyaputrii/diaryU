'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Repeat2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import ImageGallery from '@/features/images/components/ImageGallery';
import MoodBadge from '@/features/mood/components/MoodBadge';
import ActionBar from '@/features/social/components/ActionBar';
import CommentSection from '@/features/social/components/CommentSection';
import { useDiarySocial } from '@/features/social/hooks/useDiarySocial';
import { timeAgo } from '@/lib/date';
import type { Diary, FeedItem } from '@/types';

const PREVIEW_CHARS = 280;

/** Isi catatan + aksi sosial. Dipisah supaya state like/komentar ter-reset per catatan (lewat key). */
function DiaryBody({ diary }: { diary: Diary }) {
  const social = useDiarySocial(diary);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const long = diary.content.length > PREVIEW_CHARS;
  const text = expanded || !long ? diary.content : `${diary.content.slice(0, PREVIEW_CHARS).trimEnd()}…`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Avatar name={diary.author?.name ?? '?'} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink truncate">
            {diary.author?.name ?? 'Pengguna'}
            {diary.is_owner && <span className="ml-1.5 text-xs font-normal text-ink-muted">(kamu)</span>}
          </p>
          <p className="text-xs text-ink-muted">{timeAgo(diary.published_at ?? diary.created_at)}</p>
        </div>
        <MoodBadge mood={diary.mood} />
      </div>

      <div>
        <Link href={`/diary/${diary.id}`} className="block text-lg font-bold text-ink hover:underline wrap-break-word">
          {diary.title}
        </Link>
        <p className="text-sm text-ink-soft whitespace-pre-wrap wrap-break-word mt-1">{text}</p>
        {long && (
          <button type="button" onClick={() => setExpanded((v) => !v)} className="text-xs font-bold text-primary hover:underline mt-1">
            {expanded ? 'Ringkas' : 'Baca selengkapnya'}
          </button>
        )}
      </div>

      {diary.images && diary.images.length > 0 && <ImageGallery images={diary.images} />}

      <ActionBar social={social} commentsOpen={commentsOpen} onToggleComments={() => setCommentsOpen((v) => !v)} />
      {commentsOpen && (
        <CommentSection diaryId={diary.id} onCountChange={(delta) => social.setComments((n) => Math.max(0, n + delta))} />
      )}
    </div>
  );
}

/** Satu kartu di Jelajah: catatan publik, atau repost (dengan label "X me-repost" dan kutipan bila ada). */
export default function FeedCard({ item }: { item: FeedItem }) {
  const isRepost = item.type === 'repost';

  return (
    <article className="bg-surface border border-line rounded-3xl p-5 md:p-6 shadow-xs">
      {isRepost && item.reposted_by && (
        <div className="mb-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
            <Repeat2 className="w-3.5 h-3.5" /> {item.reposted_by.name} me-repost · {timeAgo(item.at)}
          </p>
          {item.quote && <p className="mt-2 text-sm text-ink whitespace-pre-wrap wrap-break-word">{item.quote}</p>}
        </div>
      )}

      <div className={isRepost && item.quote ? 'border border-line rounded-2xl p-4' : ''}>
        <DiaryBody key={item.diary.id} diary={item.diary} />
      </div>
    </article>
  );
}
