'use client';

import { Globe } from 'lucide-react';

interface Props {
  checked: boolean;
  onChange: (value: boolean) => void;
  /** Catatan yang dikunci PIN tidak boleh dibagikan. */
  disabled?: boolean;
}

/** Checkbox "Bagikan ke Jelajah". Catatan baru selalu privat sampai dicentang. */
export default function PublicToggle({ checked, onChange, disabled = false }: Props) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-2xl border border-line bg-field ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        type="checkbox"
        checked={checked && !disabled}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 accent-[var(--c-primary)]"
      />
      <span>
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          <Globe className="w-4 h-4" /> Bagikan ke Jelajah
        </span>
        <span className="block text-xs text-ink-muted mt-0.5">
          {disabled
            ? 'Catatan yang dikunci PIN tidak bisa dibagikan.'
            : 'Pengguna lain bisa membaca, menyukai, mengomentari, dan me-repost catatan ini. Nama kamu ikut tampil, emailmu tidak.'}
        </span>
      </span>
    </label>
  );
}
