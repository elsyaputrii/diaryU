/** Lingkaran berisi inisial nama (belum ada foto profil di backend). */
export default function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const dimension = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  return (
    <span
      aria-hidden
      className={`${dimension} shrink-0 rounded-full bg-accent-soft text-primary font-bold flex items-center justify-center`}
    >
      {initial}
    </span>
  );
}
