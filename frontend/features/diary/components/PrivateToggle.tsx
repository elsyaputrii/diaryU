'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import Modal from '@/features/private/components/Modal';
import PinSetupForm from '@/features/private/components/PinSetupForm';
import { usePrivacy } from '@/features/private/hooks/usePrivacy';

interface Props {
  checked: boolean;
  onChange: (value: boolean) => void;
}

/** Checkbox "Kunci catatan ini dengan PIN". Jika PIN belum ada, minta pengguna membuatnya dulu. */
export default function PrivateToggle({ checked, onChange }: Props) {
  const { hasPin } = usePrivacy();
  const [setupOpen, setSetupOpen] = useState(false);

  const toggle = (value: boolean) => {
    if (value && !hasPin) setSetupOpen(true);
    else onChange(value);
  };

  return (
    <>
      <label className="flex items-start gap-3 p-4 rounded-2xl border border-line bg-field cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[var(--c-primary)]"
        />
        <span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Lock className="w-4 h-4" /> Kunci sebagai catatan privat
          </span>
          <span className="block text-xs text-ink-muted mt-0.5">
            Isi catatan disembunyikan dan butuh PIN untuk dibuka.
          </span>
        </span>
      </label>

      <Modal open={setupOpen} title="Buat PIN Diary Pribadi" onClose={() => setSetupOpen(false)}>
        <p className="text-sm text-ink-soft mb-4">Buat PIN 4-6 digit untuk mengunci catatan privatmu.</p>
        <PinSetupForm
          onDone={() => {
            setSetupOpen(false);
            onChange(true);
          }}
          onCancel={() => setSetupOpen(false)}
        />
      </Modal>
    </>
  );
}
