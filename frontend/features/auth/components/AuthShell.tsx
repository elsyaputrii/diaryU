'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useAuthStatus } from '../tokenStorage';

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** Kartu tengah layar untuk Login, Register, dan Lupa Password. Pengguna yang sudah login dialihkan ke Home. */
export default function AuthShell({ title, subtitle, children, footer }: Props) {
  const router = useRouter();
  const status = useAuthStatus();

  useEffect(() => {
    if (status === 'in') router.replace('/');
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4 py-10">
      <div className="max-w-md w-full bg-surface border border-line rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-soft text-primary mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-ink">{title}</h1>
          <p className="text-sm text-ink-muted mt-1">{subtitle}</p>
        </div>

        {children}

        <p className="text-center text-sm text-ink-muted mt-6">{footer}</p>
      </div>
    </div>
  );
}
