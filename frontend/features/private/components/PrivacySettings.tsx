'use client';

import { useState } from 'react';
import { KeyRound, Lock, ShieldCheck, ShieldOff } from 'lucide-react';
import { buttonPrimary, buttonSecondary } from '@/components/ui/styles';
import { useToast } from '@/providers/ToastProvider';
import Modal from './Modal';
import PinInput from './PinInput';
import PinSetupForm from './PinSetupForm';
import ForgotPinDialog from './ForgotPinDialog';
import { usePrivacy } from '../hooks/usePrivacy';
import { usePinAttempts } from '../hooks/usePinAttempts';
import { PIN_MAX, PIN_MIN, changePin, isValidPin, removePin } from '../store';

type Dialog = null | 'setup' | 'change' | 'remove' | 'forgot';

/** Bagian Pengaturan untuk Diary Pribadi: buat PIN, ganti PIN, hapus PIN. */
export default function PrivacySettings() {
  const toast = useToast();
  const { hasPin } = usePrivacy();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  return (
    <div>
      <div className="flex items-start gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasPin ? 'bg-success-soft text-success' : 'bg-hover text-ink-muted'}`}>
          {hasPin ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{hasPin ? 'PIN aktif' : 'PIN belum dibuat'}</p>
          <p className="text-xs text-ink-muted">
            {hasPin
              ? 'Catatan privat butuh PIN untuk dibuka. Kunci dibuat per catatan saat menulis atau mengedit.'
              : 'Buat PIN 4-6 digit untuk mengunci catatan pribadimu.'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {hasPin ? (
          <>
            <button onClick={() => setDialog('change')} className={buttonPrimary}>
              <KeyRound className="w-4 h-4" /> Ganti PIN
            </button>
            <button onClick={() => setDialog('remove')} className={buttonSecondary}>
              Hapus PIN
            </button>
            <button onClick={() => setDialog('forgot')} className="text-sm font-semibold text-primary hover:underline px-2">
              Lupa PIN?
            </button>
          </>
        ) : (
          <button onClick={() => setDialog('setup')} className={buttonPrimary}>
            <Lock className="w-4 h-4" /> Buat PIN
          </button>
        )}
      </div>

      <Modal open={dialog === 'setup'} title="Buat PIN" onClose={close}>
        <PinSetupForm onDone={close} onCancel={close} />
      </Modal>

      <Modal open={dialog === 'change'} title="Ganti PIN" onClose={close}>
        <ChangePinForm onDone={() => { toast.success('PIN berhasil diganti.'); close(); }} onCancel={close} />
      </Modal>

      <Modal open={dialog === 'remove'} title="Hapus PIN" onClose={close}>
        <RemovePinForm onDone={() => { toast.success('PIN dihapus. Semua catatan kini terbuka.'); close(); }} onCancel={close} />
      </Modal>

      <ForgotPinDialog open={dialog === 'forgot'} onClose={close} />
    </div>
  );
}

function ChangePinForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [oldPin, setOld] = useState('');
  const [newPin, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ old?: string; next?: string; confirm?: string }>({});
  const [busy, setBusy] = useState(false);
  const attempts = usePinAttempts();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts.cooldown > 0) return;
    const next: typeof errors = {};
    if (!isValidPin(oldPin)) next.old = 'Masukkan PIN lama.';
    if (!isValidPin(newPin)) next.next = `PIN baru harus ${PIN_MIN}-${PIN_MAX} digit angka.`;
    else if (newPin === oldPin) next.next = 'PIN baru harus berbeda dari PIN lama.';
    if (confirm !== newPin) next.confirm = 'Konfirmasi PIN tidak sama.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      if (await changePin(oldPin, newPin)) {
        attempts.registerSuccess();
        onDone();
      } else {
        attempts.registerFailure();
        setErrors({ old: 'PIN lama salah.' });
      }
    } catch (err) {
      setErrors({ old: err instanceof Error ? err.message : 'Gagal mengganti PIN.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <PinInput label="PIN Lama" value={oldPin} onChange={(v) => { setOld(v); setErrors((e) => ({ ...e, old: undefined })); }} error={attempts.cooldown > 0 ? `Terlalu banyak percobaan. Coba lagi dalam ${attempts.cooldown} detik.` : errors.old} autoFocus />
      <PinInput label="PIN Baru" value={newPin} onChange={(v) => { setNew(v); setErrors((e) => ({ ...e, next: undefined })); }} error={errors.next} autoComplete="new-password" />
      <PinInput label="Ulangi PIN Baru" value={confirm} onChange={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: undefined })); }} error={errors.confirm} autoComplete="new-password" />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={buttonSecondary}>Batal</button>
        <button type="submit" disabled={busy || attempts.cooldown > 0} className={buttonPrimary}>{busy ? 'Menyimpan...' : 'Ganti PIN'}</button>
      </div>
    </form>
  );
}

function RemovePinForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const attempts = usePinAttempts();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts.cooldown > 0) return;
    if (!isValidPin(pin)) {
      setError('Masukkan PIN saat ini.');
      return;
    }
    setBusy(true);
    try {
      if (await removePin(pin)) onDone();
      else {
        attempts.registerFailure();
        setError('PIN salah.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus PIN.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="text-sm text-ink-soft">Menghapus PIN akan membuka kunci semua catatan privat. Masukkan PIN untuk melanjutkan.</p>
      <PinInput label="PIN Saat Ini" value={pin} onChange={(v) => { setPin(v); setError(''); }} error={attempts.cooldown > 0 ? `Terlalu banyak percobaan. Coba lagi dalam ${attempts.cooldown} detik.` : error} autoFocus />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className={buttonSecondary}>Batal</button>
        <button type="submit" disabled={busy || attempts.cooldown > 0} className="inline-flex items-center justify-center px-6 py-3 bg-danger text-on-primary font-medium rounded-2xl text-sm disabled:opacity-50">
          {busy ? 'Memeriksa...' : 'Hapus PIN'}
        </button>
      </div>
    </form>
  );
}
