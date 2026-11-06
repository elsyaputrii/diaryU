'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import AuthShell from '@/features/auth/components/AuthShell';
import TextField from '@/components/ui/TextField';
import ErrorNotice from '@/components/ui/ErrorNotice';
import { buttonPrimary } from '@/components/ui/styles';
import { login } from '@/features/auth/services/authService';
import { saveSession } from '@/features/auth/tokenStorage';
import { LoginErrors, validateLogin } from '@/features/auth/validation';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/providers/ToastProvider';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (key: 'email' | 'password', value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const validation = validateLogin(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setLoading(true);
    try {
      const token = await login(values);
      if (!token) {
        setServerError('Login gagal: token tidak ditemukan dalam respons server.');
        return;
      }
      saveSession(token, values.email);
      toast.success('Selamat datang kembali!');
      router.replace('/');
    } catch (err) {
      setServerError(getErrorMessage(err, 'Terjadi kesalahan saat masuk. Periksa kembali email dan password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back to Elsya Diary ❤️"
      subtitle="Silakan masuk untuk menulis dan membaca diary kamu."
      footer={
        <>
          Belum punya akun?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Daftar
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
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
          placeholder="••••••••"
        />

        <div className="text-right -mt-2">
          <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
            Lupa password?
          </Link>
        </div>

        <button type="submit" disabled={loading} className={`${buttonPrimary} w-full py-3.5`}>
          {loading ? 'Memproses...' : 'Masuk ke Diary'}
        </button>
      </form>
    </AuthShell>
  );
}
