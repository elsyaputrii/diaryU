'use client';

import { useState } from 'react';
import { buttonPrimary, buttonSecondary } from '@/components/ui/styles';
import { useToast } from '@/providers/ToastProvider';
import PinInput from './PinInput';
import { PIN_MAX, PIN_MIN, isValidPin, setPin } from '../store';

interface Props {
  onDone: () => void;
  onCancel?: () => void;
}

/** Form membuat PIN baru (PIN + konfirmasi). */
export default function PinSetupForm({ onDone, onCancel }: Props) {
  const toast = useToast();
  const [pin, setPinValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ pin?: string; confirm?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // event React menembus portal ke <form> induk (mis. form diary)
    const next: typeof errors = {};
    if (!isValidPin(pin)) next.pin = `PIN harus ${PIN_MIN}-${PIN_MAX} digit angka.`;
    if (confirm !== pin) next.confirm = 'Konfirmasi PIN tidak sama.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await setPin(pin);
      toast.success('PIN Diary Pribadi berhasil dibuat.');
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan PIN.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <PinInput label="PIN Baru" value={pin} onChange={(v) => { setPinValue(v); setErrors((e) => ({ ...e, pin: undefined })); }} error={errors.pin} autoFocus autoComplete="new-password" />
      <PinInput label="Ulangi PIN" value={confirm} onChange={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: undefined })); }} error={errors.confirm} autoComplete="new-password" />
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonSecondary}>
            Batal
          </button>
        )}
        <button type="submit" disabled={busy} className={buttonPrimary}>
          {busy ? 'Menyimpan...' : 'Simpan PIN'}
        </button>
      </div>
    </form>
  );
}
