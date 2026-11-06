'use client';

import { FONT_SIZES, FontSize } from '../constants';

const SAMPLE_SIZE: Record<FontSize, string> = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };

export default function FontSizePicker({ value, onChange }: { value: FontSize; onChange: (v: FontSize) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Ukuran teks">
      {FONT_SIZES.map((s) => {
        const selected = value === s.value;
        return (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(s.value)}
            className={`rounded-2xl border-2 p-3 text-center transition ${selected ? 'border-primary bg-accent-soft' : 'border-line hover:bg-hover'}`}
          >
            <span className={`block font-bold text-ink ${SAMPLE_SIZE[s.value]}`}>{s.sample}</span>
            <span className="block text-sm font-semibold text-ink">{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}
