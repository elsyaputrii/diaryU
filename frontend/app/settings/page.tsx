'use client';

import { Palette, Type } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import { useToast } from '@/providers/ToastProvider';
import { useSettings } from '@/features/settings/hooks/useSettings';
import ThemePicker from '@/features/settings/components/ThemePicker';
import FontPicker from '@/features/settings/components/FontPicker';

export default function SettingsPage() {
  const { theme, font, setTheme, setFont } = useSettings();
  const toast = useToast();

  return (
    <PageShell width="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Pengaturan Tampilan</h1>
        <p className="text-sm text-ink-muted">
          Sesuaikan tema dan font agar menulis diary terasa lebih nyaman. Perubahan langsung tersimpan.
        </p>
      </div>

      <div className="space-y-6">
        <section className="bg-surface border border-line rounded-3xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-primary" /> Tema
          </h2>
          <ThemePicker
            value={theme}
            onChange={(t) => {
              setTheme(t);
              toast.success(`Tema ${t} diterapkan.`);
            }}
          />
        </section>

        <section className="bg-surface border border-line rounded-3xl p-6 md:p-8">
          <h2 className="text-lg font-bold text-ink flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-primary" /> Jenis Font
          </h2>
          <FontPicker
            value={font}
            onChange={(f) => {
              setFont(f);
              toast.success('Font berhasil diganti.');
            }}
          />
        </section>
      </div>
    </PageShell>
  );
}
