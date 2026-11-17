'use client';

import { useCallback, useEffect, useState } from 'react';
import { CornerDownRight, Send, Trash2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import ErrorNotice from '@/components/ui/ErrorNotice';
import { inputClass } from '@/components/ui/styles';
import { timeAgo } from '@/lib/date';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/providers/ToastProvider';
import type { DiaryComment } from '@/types';
import { addComment, deleteComment, getComments } from '../services/socialService';

const BODY_MAX = 500;

interface Props {
  diaryId: number;
  /** Dipanggil setiap jumlah komentar berubah, supaya angka di ActionBar ikut berubah. */
  onCountChange: (delta: number) => void;
}

function CommentItem({
  comment,
  isReply,
  onReply,
  onDelete,
}: {
  comment: DiaryComment;
  isReply?: boolean;
  onReply: (c: DiaryComment) => void;
  onDelete: (c: DiaryComment) => void;
}) {
  return (
    <div className="flex gap-3">
      <Avatar name={comment.author.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-ink truncate">{comment.author.name}</span>
          <span className="text-ink-muted shrink-0">{timeAgo(comment.created_at)}</span>
        </div>
        <p className="text-sm text-ink-soft whitespace-pre-wrap wrap-break-word">{comment.body}</p>
        <div className="flex items-center gap-3 mt-1">
          <button type="button" onClick={() => onReply(comment)} className="text-xs font-semibold text-ink-muted hover:text-primary transition">
            Balas
          </button>
          {comment.can_delete && (
            <button
              type="button"
              onClick={() => onDelete(comment)}
              aria-label="Hapus komentar"
              className="text-ink-muted hover:text-danger transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-line">
            {comment.replies.map((r) => (
              <CommentItem key={r.id} comment={r} isReply onReply={onReply} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Daftar komentar + kolom tulis. Hanya dibuka (dimuat) ketika pengguna menekan ikon komentar. */
export default function CommentSection({ diaryId, onCountChange }: Props) {
  const toast = useToast();
  const [comments, setComments] = useState<DiaryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<DiaryComment | null>(null);
  const [sending, setSending] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getComments(diaryId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Gagal memuat komentar.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [diaryId, reloadKey]);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    setReloadKey((k) => k + 1);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      const created = await addComment(diaryId, body, replyTo?.id);
      setComments((prev) => {
        if (!created.parent_id) return [...prev, { ...created, replies: [] }];
        return prev.map((c) => (c.id === created.parent_id ? { ...c, replies: [...(c.replies ?? []), created] } : c));
      });
      onCountChange(1);
      setText('');
      setReplyTo(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal mengirim komentar.'));
    } finally {
      setSending(false);
    }
  };

  const remove = async (target: DiaryComment) => {
    try {
      await deleteComment(target.id);
      // Menghapus komentar utama ikut menghapus semua balasannya.
      const removed = 1 + (target.replies?.length ?? 0);
      setComments((prev) =>
        target.parent_id
          ? prev.map((c) => ({ ...c, replies: c.replies?.filter((r) => r.id !== target.id) }))
          : prev.filter((c) => c.id !== target.id)
      );
      onCountChange(-removed);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Gagal menghapus komentar.'));
    }
  };

  return (
    <div className="pt-4 space-y-4">
      {loading ? (
        <p className="text-sm text-ink-muted">Memuat komentar...</p>
      ) : error ? (
        <ErrorNotice message={error} onRetry={load} />
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-muted">Belum ada komentar. Jadilah yang pertama.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CommentItem key={c.id} comment={c} onReply={setReplyTo} onDelete={remove} />
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-2">
        {replyTo && (
          <div className="flex items-center justify-between text-xs text-ink-muted bg-field rounded-xl px-3 py-2">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <CornerDownRight className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Membalas {replyTo.author.name}</span>
            </span>
            <button type="button" onClick={() => setReplyTo(null)} className="font-semibold hover:text-ink">
              Batal
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, BODY_MAX))}
            placeholder="Tulis komentar..."
            aria-label="Tulis komentar"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Kirim komentar"
            className="shrink-0 w-11 h-11 rounded-2xl bg-primary hover:bg-primary-hover text-on-primary flex items-center justify-center transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
