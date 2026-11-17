'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';
import { ACCEPTED_TYPES, compressImage, MAX_IMAGES, MAX_IMAGE_BYTES } from '@/lib/image';
import { useToast } from '@/providers/ToastProvider';
import type { DiaryImage } from '@/types';
import CameraDialog from './CameraDialog';

interface Props {
  /** Gambar baru yang belum diunggah. */
  files: File[];
  onFilesChange: (files: File[]) => void;
  /** Gambar yang sudah tersimpan di server (mode edit). */
  existing?: DiaryImage[];
  onRemoveExisting?: (imageId: number) => void;
}

/** Tombol Galeri + Kamera, pratinjau, dan hapus. Foto otomatis diperkecil sebelum diunggah. */
export default function ImagePicker({ files, onFilesChange, existing = [], onRemoveExisting }: Props) {
  const toast = useToast();
  const galleryRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const total = existing.length + files.length;
  const full = total >= MAX_IMAGES;

  const previews = useMemo(() => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })), [files]);
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

  const add = async (incoming: File[]) => {
    if (incoming.length === 0) return;

    const room = MAX_IMAGES - total;
    if (room <= 0) {
      toast.error(`Maksimal ${MAX_IMAGES} gambar per catatan.`);
      return;
    }
    if (incoming.length > room) toast.info(`Hanya ${room} gambar lagi yang muat (maks ${MAX_IMAGES}).`);

    setProcessing(true);
    try {
      const accepted: File[] = [];
      for (const file of incoming.slice(0, room)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          toast.error(`${file.name}: format harus JPG, PNG, atau WebP.`);
          continue;
        }
        const processed = await compressImage(file);
        if (processed.size > MAX_IMAGE_BYTES) {
          toast.error(`${file.name}: ukuran lebih dari 5 MB.`);
          continue;
        }
        accepted.push(processed);
      }
      if (accepted.length) onFilesChange([...files, ...accepted]);
    } finally {
      setProcessing(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ''; // supaya file yang sama bisa dipilih lagi
    void add(picked);
  };

  const openCamera = () => {
    if (typeof navigator.mediaDevices?.getUserMedia === 'function') setCameraOpen(true);
    else captureRef.current?.click(); // browser tanpa getUserMedia: pakai kamera bawaan HP
  };

  const btn =
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium bg-hover text-ink-soft hover:bg-line transition disabled:opacity-50';

  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">
        Foto (opsional, maks {MAX_IMAGES})
      </span>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => galleryRef.current?.click()} disabled={full || processing} className={btn}>
          <ImagePlus className="w-4 h-4" /> Galeri
        </button>
        <button type="button" onClick={openCamera} disabled={full || processing} className={btn}>
          <Camera className="w-4 h-4" /> Kamera
        </button>
        {processing && <span className="self-center text-xs text-ink-muted">Memproses foto...</span>}
      </div>

      <input ref={galleryRef} type="file" accept={ACCEPTED_TYPES.join(',')} multiple hidden onChange={onPick} />
      <input ref={captureRef} type="file" accept="image/*" capture="environment" hidden onChange={onPick} />

      {total > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {existing.map((img) => (
            <li key={`e${img.id}`} className="relative aspect-square rounded-2xl overflow-hidden bg-field">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="Foto tersimpan" className="w-full h-full object-cover" />
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(img.id)}
                  aria-label="Hapus foto"
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
          {previews.map((p, i) => (
            <li key={`n${p.url}`} className="relative aspect-square rounded-2xl overflow-hidden bg-field">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Foto baru ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((f) => f !== p.file))}
                aria-label="Buang foto"
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <CameraDialog open={cameraOpen} onClose={() => setCameraOpen(false)} onCapture={(f) => void add([f])} />
    </div>
  );
}
