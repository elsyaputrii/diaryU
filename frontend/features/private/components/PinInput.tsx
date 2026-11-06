'use client';

import { useId } from 'react';
import FormField from '@/components/ui/FormField';
import { inputClass, inputErrorClass } from '@/components/ui/styles';
import { PIN_MAX } from '../store';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}

/** Input PIN angka (4-6 digit), tampil sebagai titik. Hanya menerima angka. */
export default function PinInput({ label, value, onChange, error, autoFocus, autoComplete = 'off' }: Props) {
  const id = useId();
  return (
    <FormField id={id} label={label} error={error}>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={PIN_MAX}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholder="••••"
        className={`${inputClass} tracking-[0.5em] text-center text-lg ${error ? inputErrorClass : ''}`}
      />
    </FormField>
  );
}
