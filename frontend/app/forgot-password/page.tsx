'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Mail } from 'lucide-react';
import AuthShell from '@/features/auth/components/AuthShell';
import TextField from '@/components/ui/TextField';
import ErrorNotice from '@/components/ui/ErrorNotice';
import { buttonPrimary } from '@/components/ui/styles';
import { forgotPassword } from '@/features/auth/services/authService';
import { validateForgotPassword } from '@/features/auth/validation';
import { getErrorMessage } from '@/lib/errors';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const validation = validateForgotPassword(email);
    setError(validation);
    if (validation) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setServerError(getErrorMessage(err, 'Gagal mengirim permintaan reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Lupa Password?"
      subtitle="Masukkan email akunmu, kami kirimkan tautan untuk mengatur ulang password."
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Kembali ke halaman masuk
        </Link>
      }
    >
      {sent ? (
        <div role="status" className="p-4 rounded-2xl bg-success-soft border border-success-line text-success text-sm flex items-start gap-3">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>
            Jika <b>{email.trim()}</b> terdaftar, tautan reset password sudah dikirim. Periksa kotak masuk (dan folder spam).
          </span>
        </div>
      ) : (
        <>
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(undefined);
              }}
              error={error}
              placeholder="elsya@example.com"
            />
            <button type="submit" disabled={loading} className={`${buttonPrimary} w-full py-3.5`}>
              {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
