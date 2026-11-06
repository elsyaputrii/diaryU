'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { Save } from 'lucide-react';
import FormField from '@/components/ui/FormField';
import TextField from '@/components/ui/TextField';
import { buttonPrimary, buttonSecondary, inputClass, inputErrorClass } from '@/components/ui/styles';
import { todayISO } from '@/lib/date';
import { MOODS } from '@/features/mood/constants';
import PrivateToggle from './PrivateToggle';
import { DiaryFormErrors, DiaryFormValues, validateDiary } from '../validation';

interface Props {
  initialValues: DiaryFormValues;
  submitLabel: string;
  submitting: boolean;
  /** Dipanggil HANYA jika semua field lolos validasi. */
  onSubmit: (values: DiaryFormValues) => void;
  /** Tombol "Batal" berupa link (halaman tulis baru) ... */
  cancelHref?: string;
  /** ... atau berupa fungsi (mode edit di halaman detail). */
  onCancel?: () => void;
}

/**
 * Form catatan diary — dipakai untuk TULIS BARU dan EDIT.
 * Validasi dijalankan saat menekan tombol simpan; error tampil di bawah tiap field
 * dan hilang otomatis ketika field tersebut diperbaiki.
 */
export default function DiaryForm({
  initialValues,
  submitLabel,
  submitting,
  onSubmit,
  cancelHref,
  onCancel,
}: Props) {
  const [values, setValues] = useState<DiaryFormValues>(initialValues);
  const [errors, setErrors] = useState<DiaryFormErrors>({});
  const contentId = useId();

  const setField = <K extends keyof DiaryFormValues>(key: K, value: DiaryFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateDiary(values);
    setErrors(validation);
    if (Object.keys(validation).length === 0) onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-surface border border-line rounded-3xl p-6 md:p-8 shadow-xs space-y-6"
    >
      <TextField
        label="Judul Catatan"
        value={values.title}
        onChange={(e) => setField('title', e.target.value)}
        error={errors.title}
        placeholder="Contoh: Hari yang penuh ketenangan di kafe..."
        maxLength={120}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Tanggal"
          type="date"
          value={values.entryDate}
          max={todayISO()}
          onChange={(e) => setField('entryDate', e.target.value)}
          error={errors.entryDate}
        />

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">
            Pilih Suasana Hati (Mood)
          </span>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Suasana hati">
            {MOODS.map((m) => {
              const selected = values.mood === m.type;
              return (
                <button
                  type="button"
                  key={m.type}
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setField('mood', m.type)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-2xl text-xs font-semibold transition border ${
                    selected
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-field text-ink-soft border-line-strong hover:bg-hover'
                  }`}
                >
                  <span aria-hidden>{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
          {errors.mood && <p className="mt-1.5 text-xs text-danger">{errors.mood}</p>}
        </div>
      </div>

      <FormField id={contentId} label="Isi Catatan" error={errors.content}>
        <textarea
          id={contentId}
          value={values.content}
          onChange={(e) => setField('content', e.target.value)}
          rows={8}
          placeholder="Ceritakan harimu di sini..."
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? `${contentId}-error` : undefined}
          className={`${inputClass} ${errors.content ? inputErrorClass : ''}`}
        />
      </FormField>

      <PrivateToggle checked={!!values.isPrivate} onChange={(v) => setField('isPrivate', v)} />

      <div className="flex justify-end gap-3 pt-4 border-t border-line">
        {cancelHref && (
          <Link href={cancelHref} className={buttonSecondary}>
            Batal
          </Link>
        )}
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonSecondary}>
            Batal
          </button>
        )}
        <button type="submit" disabled={submitting} className={buttonPrimary}>
          <Save className="w-4 h-4" /> {submitting ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
