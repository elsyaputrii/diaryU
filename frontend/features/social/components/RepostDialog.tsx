'use client';

import { useState } from 'react';
import { Quote, Repeat2, Undo2 } from 'lucide-react';
import Modal from '@/features/private/components/Modal';
import { inputClass, buttonPrimary } from '@/components/ui/styles';
import type { DiarySocial } from '../hooks/useDiarySocial';

const QUOTE_MAX = 280;

interface Props {
  open: boolean;
  onClose: () => void;
  social: DiarySocial;
}

/** Pilihan repost ala X: repost biasa, kutip (tambah komentarmu), atau batalkan repost. */
export default function RepostDialog({ open, onClose, social }: Props) {
  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setQuoting(false);
    setQuote('');
    onClose();
  };

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      close();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title={quoting ? 'Kutip catatan' : 'Bagikan ulang'} onClose={close}>
      {quoting ? (
        <div className="space-y-3">
          <textarea
            value={quote}
            onChange={(e) => setQuote(e.target.value.slice(0, QUOTE_MAX))}
            rows={4}
            autoFocus
            placeholder="Tambahkan komentarmu..."
            aria-label="Kutipan"
            className={inputClass}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-muted">
              {quote.length}/{QUOTE_MAX}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setQuoting(false)} className="px-4 py-2 rounded-2xl text-sm bg-hover text-ink-soft hover:bg-line transition">
                Kembali
              </button>
              <button
                type="button"
                disabled={busy || !quote.trim()}
                onClick={() => run(() => social.repost(quote))}
                className={`${buttonPrimary} !py-2`}
              >
                {busy ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => social.repost())}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-field hover:bg-hover text-sm font-semibold text-ink transition disabled:opacity-50"
          >
            <Repeat2 className="w-4 h-4 text-success" /> {social.reposted ? 'Repost tanpa kutipan' : 'Repost'}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setQuoting(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-field hover:bg-hover text-sm font-semibold text-ink transition disabled:opacity-50"
          >
            <Quote className="w-4 h-4 text-primary" /> Kutip
          </button>
          {social.reposted && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => social.undoRepost())}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-danger-soft hover:opacity-80 text-sm font-semibold text-danger transition disabled:opacity-50"
            >
              <Undo2 className="w-4 h-4" /> Batalkan repost
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
