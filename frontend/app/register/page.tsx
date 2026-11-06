'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User } from 'lucide-react';
import AuthShell from '@/features/auth/components/AuthShell';
import TextField from '@/components/ui/TextField';
import ErrorNotice from '@/components/ui/ErrorNotice';
import { buttonPrimary } from '@/components/ui/styles';
import { register, RegisterInput } from '@/features/auth/services/authService';
import { saveSession } from '@/features/auth/tokenStorage';
import { PASSWORD_MIN_LENGTH, RegisterErrors, validateRegister } from '@/features/auth/validation';
import { getErrorMessage, getFieldErrors } from '@/lib/errors';
import { useToast } from '@/providers/ToastProvider';

const INITIAL: RegisterInput = { name: '', email: '', password: '', passwordConfirmation: '' };

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState<RegisterInput>(INITIAL);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key: keyof RegisterInput, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const validation = validateRegister(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    try {
      const token = await register(values);
      if (token) {
        saveSession(token, values.email);
        toast.success('Akun berhasil dibuat. Selamat datang!');
        router.replace('/');
      } else {
        toast.success('Akun berhasil dibuat. Silakan masuk.');
        router.replace('/login');
      }
    } catch (err) {
      const fields = getFieldErrors(err);
      if (Object.keys(fields).length > 0) {
        setErrors({
          name: fields.name,
          email: fields.email,
          password: fields.password,
        });
      }
      setServerError(getErrorMessage(err, 'Pendaftaran gagal. Coba lagi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Buat Akun Elsya Diary ✨"
      subtitle="Mulai simpan cerita dan perasaanmu dengan aman."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Masuk
          </Link>
        </>
      }
    >
      {serverError && (
        <div className="mb-6">
          <ErrorNotice message={serverError} />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Nama"
          icon={User}
          autoComplete="name"
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name}
          placeholder="Nama lengkapmu"
        />
        <TextField
          label="Email"
          type="email"
          icon={Mail}
          autoComplete="email"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          placeholder="elsya@example.com"
        />
        <TextField
          label="Password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
          placeholder={`Minimal ${PASSWORD_MIN_LENGTH} karakter`}
        />
        <TextField
          label="Konfirmasi Password"
          type="password"
          icon={Lock}
          autoComplete="new-password"
          value={values.passwordConfirmation}
          onChange={(e) => setField('passwordConfirmation', e.target.value)}
          error={errors.passwordConfirmation}
          placeholder="Ulangi password"
        />

        <button type="submit" disabled={loading} className={`${buttonPrimary} w-full py-3.5`}>
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
    </AuthShell>
  );
}
