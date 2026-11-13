'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Loading from '@/components/ui/Loading';
import { useAuthStatus } from '@/features/auth/tokenStorage';

interface Props {
  children: React.ReactNode;
  /** Lebar maksimum konten, mis. "max-w-6xl" (lebar) atau "max-w-3xl" (form). */
  width?: string;
}

/**
 * Kerangka halaman yang sudah login: Navbar + area konten.
 * Sekaligus penjaga (guard): tanpa token, pengguna diarahkan ke /login.
 */
export default function PageShell({ children, width = 'max-w-6xl' }: Props) {
  const router = useRouter();
  const status = useAuthStatus();

  useEffect(() => {
    if (status === 'out') router.replace('/login');
  }, [status, router]);

  if (status !== 'in') {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <Loading text="Memuat..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />
      <main className={`flex-1 ${width} w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-12`}>
        {children}
      </main>
    </div>
  );
}