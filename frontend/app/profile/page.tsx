'use client';

import { useEffect, useState } from 'react';
import { Mail, Save, User as UserIcon } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/components/ui/Loading';
import ErrorNotice from '@/components/ui/ErrorNotice';
import TextField from '@/components/ui/TextField';
import { buttonPrimary } from '@/components/ui/styles';
import ChangePasswordForm from '@/features/profile/components/ChangePasswordForm';
import { getProfile, ProfileData, updateProfile } from '@/features/profile/services/profileService';
import { ProfileErrors, validateProfile } from '@/features/profile/validation';
import { getSessionEmail } from '@/features/auth/tokenStorage';
import { migratePrivacyKey } from '@/features/private/store';
import { getErrorMessage, getFieldErrors } from '@/lib/errors';
import { useToast } from '@/providers/ToastProvider';

export default function ProfilePage() {
  const toast = useToast();
  const [values, setValues] = useState<ProfileData>({ name: '', email: '' });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((p) => !cancelled && setValues(p))
      .catch((err) => !cancelled && setLoadError(getErrorMessage(err, 'Gagal mengambil profil.')))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const setField = (key: keyof ProfileData, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfile(values);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setSaving(true);
    try {
      const saved = await updateProfile(values);
      setValues(saved);
      // Email berubah -> data lokal (PIN diary pribadi) ikut dipindah agar tidak hilang
      if (saved.email.trim().toLowerCase() !== getSessionEmail()) migratePrivacyKey(getSessionEmail(), saved.email);
      toast.success('Profil berhasil diperbarui.');
    } catch (err) {
      const fields = getFieldErrors(err);
      if (fields.name || fields.email) setErrors({ name: fields.name, email: fields.email });
      toast.error(getErrorMessage(err, 'Gagal memperbarui profil.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageShell width="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Profil Saya</h1>
        <p className="text-sm text-ink-muted">Kelola informasi akun dan keamanan.</p>
      </div>

      {loading ? (
        <Loading text="Memuat profil..." />
      ) : loadError ? (
        <ErrorNotice
          message={loadError}
          onRetry={() => {
            setLoading(true);
            setLoadError('');
            setReloadKey((k) => k + 1);
          }}
        />
      ) : (
        <div className="space-y-8">
          <section className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-accent-soft text-primary flex items-center justify-center text-2xl font-bold" aria-hidden>
                {values.name.trim().charAt(0).toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-ink truncate">{values.name}</p>
                <p className="text-sm text-ink-muted truncate">{values.email}</p>
              </div>
            </div>

            <form onSubmit={submit} noValidate className="space-y-5">
              <TextField label="Nama" icon={UserIcon} autoComplete="name" value={values.name} onChange={(e) => setField('name', e.target.value)} error={errors.name} />
              <TextField label="Email" type="email" icon={Mail} autoComplete="email" value={values.email} onChange={(e) => setField('email', e.target.value)} error={errors.email} />
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving} className={buttonPrimary}>
                  <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-ink mb-5">Ganti Password</h2>
            <ChangePasswordForm />
          </section>
        </div>
      )}
    </PageShell>
  );
}
