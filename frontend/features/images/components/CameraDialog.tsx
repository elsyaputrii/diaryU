'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, SwitchCamera } from 'lucide-react';
import Modal from '@/features/private/components/Modal';
import { buttonPrimary } from '@/components/ui/styles';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Dipanggil dengan foto hasil jepretan (JPEG). */
  onCapture: (file: File) => void;
}

function cameraErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError') return 'Izin kamera ditolak. Aktifkan izin kamera di pengaturan browser.';
  if (name === 'NotFoundError') return 'Kamera tidak ditemukan di perangkat ini.';
  if (name === 'NotReadableError') return 'Kamera sedang dipakai aplikasi lain.';
  return 'Kamera tidak bisa dibuka. Coba pakai tombol Galeri.';
}

/**
 * Kamera langsung di dalam halaman (getUserMedia): pratinjau -> jepret -> foto masuk ke daftar gambar.
 * Butuh HTTPS atau localhost. Stream dimatikan saat dialog ditutup.
 */
export default function CameraDialog({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    (async () => {
      setReady(false);
      setError('');
      stop();
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch (err) {
        if (!cancelled) setError(cameraErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [open, facing, stop]);

  const snap = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `kamera-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }));
        onClose();
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <Modal open={open} title="Ambil Foto" onClose={onClose} wide>
      {error ? (
        <p role="alert" className="text-sm text-danger bg-danger-soft border border-danger-line rounded-2xl p-4">
          {error}
        </p>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              aria-label="Pratinjau kamera"
              className={`w-full h-full object-cover ${facing === 'user' ? '-scale-x-100' : ''}`}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">Membuka kamera...</div>
            )}
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
              aria-label="Ganti kamera"
              className="w-11 h-11 rounded-full bg-hover text-ink-soft hover:bg-line flex items-center justify-center transition"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
            <button type="button" onClick={snap} disabled={!ready} className={buttonPrimary}>
              <Camera className="w-5 h-5" /> Jepret
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
