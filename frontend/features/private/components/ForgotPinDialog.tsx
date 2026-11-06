'use client';

import { useState } from 'react';
import TextField from '@/components/ui/TextField';
import { buttonPrimary, buttonSecondary } from '@/components/ui/styles';
import Modal from './Modal';
import { login } from '@/features/auth/services/authService';
import { getSessionEmail, saveSession } from '@/features/auth/tokenStorage';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/providers/ToastProvider';
import { forceRemovePin } from '../store';

/**
 * Reset PIN dengan verifikasi ulang password akun.
 * Konsekuensi: PIN dan tanda kunci dihapus — semua catatan terbuka, lalu PIN baru bisa dibuat di Pengaturan.
 */
export default function ForgotPinDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password wajib diisi.');
      return;
    }
    const email = getSessionEmail();
    setBusy(true);
    try {
      const token = await login({ email, password });
      if (token) saveSession(token, email);
      forceRemovePin();
      toast.success('PIN direset. Buat PIN baru di Pengaturan > Diary Pribadi.');
      setPassword('');
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Password akun salah.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="Reset PIN" onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-ink-soft">
          Masukkan password akunmu untuk mereset PIN. Semua catatan privat akan terbuka dan kamu bisa membuat PIN baru.
        </p>
        <TextField
          label="Password Akun"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          error={error}
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className={buttonSecondary}>
            Batal
          </button>
          <button type="submit" disabled={busy} className={buttonPrimary}>
            {busy ? 'Memeriksa...' : 'Reset PIN'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
