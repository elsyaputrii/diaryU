'use client';

import { RotateCcw } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { buttonSecondary } from '@/components/ui/styles';
import FontPicker from '@/features/settings/components/FontPicker';
import FontSizePicker from '@/features/settings/components/FontSizePicker';
import ThemePicker from '@/features/settings/components/ThemePicker';
import PrivacySettings from '@/features/private/components/PrivacySettings';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useToast } from '@/providers/ToastProvider';

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-xs">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="text-sm text-ink-muted mb-5">{description}</p>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { theme, font, size, setTheme, setFont, setSize, reset } = useSettings();
  const toast = useToast();

  return (
    <PageShell width="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Pengaturan</h1>
        <p className="text-sm text-ink-muted">Sesuaikan tampilan dan keamanan Elsya Diary. Tersimpan otomatis di perangkat ini.</p>
      </div>

      <div className="space-y-6">
        <Section title="Tema" description="Pilih suasana warna aplikasi.">
          <ThemePicker value={theme} onChange={setTheme} />
        </Section>

        <Section title="Font" description="Jenis huruf untuk seluruh aplikasi.">
          <FontPicker value={font} onChange={setFont} />
        </Section>

        <Section title="Ukuran Teks" description="Perbesar atau perkecil teks agar nyaman dibaca.">
          <FontSizePicker value={size} onChange={setSize} />
        </Section>

        <Section title="Diary Pribadi" description="PIN untuk mengunci catatan-catatan rahasiamu.">
          <PrivacySettings />
        </Section>

        <div className="flex justify-end">
          <button
            onClick={() => {
              reset();
              toast.info('Pengaturan tampilan dikembalikan ke default.');
            }}
            className={buttonSecondary}
          >
            <RotateCcw className="w-4 h-4" /> Reset Tampilan
          </button>
        </div>
      </div>
    </PageShell>
  );
}
