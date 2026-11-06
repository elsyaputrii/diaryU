'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { buttonPrimary } from '@/components/ui/styles';
import PinInput from './PinInput';
import ForgotPinDialog from './ForgotPinDialog';
import { usePinAttempts } from '../hooks/usePinAttempts';
import { isValidPin, unlockForSession, verifyPin } from '../store';

/** Layar verifikasi PIN yang menggantikan isi catatan privat sampai PIN benar. */
export default function PinGate({ diaryId, backHref = '/diary' }: { diaryId: number; backHref?: string }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const attempts = usePinAttempts();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts.cooldown > 0) return;
    if (!isValidPin(pin)) {
      setError('Masukkan PIN 4-6 digit.');
      return;
    }
    setBusy(true);
    try {
      if (await verifyPin(pin)) {
        attempts.registerSuccess();
        unlockForSession(diaryId);
      } else {
        attempts.registerFailure();
        setPin('');
        setError('PIN salah.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memverifikasi PIN.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-surface border border-line rounded-3xl p-8 shadow-xs text-center">
      <div className="w-14 h-14 rounded-2xl bg-accent-soft text-primary flex items-center justify-center mx-auto mb-4">
        <Lock className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-1">Catatan Pribadi</h2>
      <p className="text-sm text-ink-muted mb-6">Masukkan PIN untuk membuka catatan ini.</p>

      <form onSubmit={submit} noValidate className="space-y-4 text-left">
        <PinInput
          label="PIN"
          value={pin}
          onChange={(v) => {
            setPin(v);
            setError('');
          }}
          error={attempts.cooldown > 0 ? `Terlalu banyak percobaan. Coba lagi dalam ${attempts.cooldown} detik.` : error}
          autoFocus
        />
        <button type="submit" disabled={busy || attempts.cooldown > 0} className={`${buttonPrimary} w-full`}>
          {busy ? 'Memeriksa...' : 'Buka Catatan'}
        </button>
      </form>

      <div className="flex items-center justify-between mt-5 text-xs">
        <Link href={backHref} className="text-ink-muted hover:text-ink">
          &larr; Kembali
        </Link>
        <button onClick={() => setForgot(true)} className="font-semibold text-primary hover:underline">
          Lupa PIN?
        </button>
      </div>

      <ForgotPinDialog open={forgot} onClose={() => setForgot(false)} />
    </div>
  );
}
