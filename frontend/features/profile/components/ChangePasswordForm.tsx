'use client';

import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import TextField from '@/components/ui/TextField';
import { buttonPrimary } from '@/components/ui/styles';
import { changePassword, ChangePasswordInput } from '../services/profileService';
import { PasswordErrors, validatePasswordChange } from '../validation';
import { getErrorMessage, getFieldErrors } from '@/lib/errors';
import { useToast } from '@/providers/ToastProvider';

const INITIAL: ChangePasswordInput = { currentPassword: '', password: '', passwordConfirmation: '' };

export default function ChangePasswordForm() {
  const toast = useToast();
  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof ChangePasswordInput, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePasswordChange(values);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSaving(true);
    try {
      await changePassword(values);
      toast.success('Password berhasil diganti.');
      setValues(INITIAL);
    } catch (err) {
      const fields = getFieldErrors(err);
      if (fields.current_password) setErrors({ currentPassword: fields.current_password });
      else toast.error(getErrorMessage(err, 'Gagal mengganti password.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <TextField label="Password Saat Ini" type="password" autoComplete="current-password" value={values.currentPassword} onChange={(e) => setField('currentPassword', e.target.value)} error={errors.currentPassword} />
      <TextField label="Password Baru" type="password" autoComplete="new-password" value={values.password} onChange={(e) => setField('password', e.target.value)} error={errors.password} />
      <TextField label="Konfirmasi Password Baru" type="password" autoComplete="new-password" value={values.passwordConfirmation} onChange={(e) => setField('passwordConfirmation', e.target.value)} error={errors.passwordConfirmation} />
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={buttonPrimary}>
          <KeyRound className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Ganti Password'}
        </button>
      </div>
    </form>
  );
}
