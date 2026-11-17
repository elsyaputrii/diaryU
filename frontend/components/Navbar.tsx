'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Calendar, Compass, Home, Smile, User, LogOut, Settings } from 'lucide-react';
import { logout } from '@/features/auth/services/authService';
import { clearToken } from '@/features/auth/tokenStorage';
import { useToast } from '@/providers/ToastProvider';

// `short` = label pendek untuk bar bawah di ponsel (7 menu harus muat)
const navItems = [
  { name: 'Home', short: 'Home', href: '/', icon: Home },
  { name: 'Jelajah', short: 'Jelajah', href: '/explore', icon: Compass },
  { name: 'Diaries', short: 'Diary', href: '/diary', icon: BookOpen },
  { name: 'Mood Tracker', short: 'Mood', href: '/mood', icon: Smile },
  { name: 'Calendar', short: 'Kalender', href: '/calendar', icon: Calendar },
  { name: 'Profile', short: 'Profil', href: '/profile', icon: User },
  { name: 'Settings', short: 'Atur', href: '/settings', icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();

  // Halaman anak (mis. /diary/create) tetap menandai menu induknya (/diary)
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    } finally {
      clearToken();
      toast.info('Kamu sudah keluar. Sampai jumpa!');
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-line shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary tracking-tight hover:opacity-80 transition">
          ✨ Elsya Diary
        </Link>

        <nav className="hidden md:flex items-center space-x-1" aria-label="Menu utama">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(item.href) ? 'bg-accent-soft text-primary shadow-xs' : 'text-ink-soft hover:bg-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-danger hover:bg-danger-soft transition border border-danger-line"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        {/* Ponsel: tombol logout kecil di kanan atas (menu utama ada di bar bawah) */}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="md:hidden p-2 rounded-full text-danger hover:bg-danger-soft transition"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Menu utama (ponsel)"
        className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-line px-1 py-2 flex justify-around items-center z-50 shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`flex flex-col items-center px-1 py-1.5 rounded-xl text-[10px] font-medium transition ${
                isActive(item.href) ? 'text-primary font-bold' : 'text-ink-muted'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.short}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
