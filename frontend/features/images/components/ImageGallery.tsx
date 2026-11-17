import type { DiaryImage } from '@/types';

/** Susunan gambar ala X: 1 = lebar penuh, 2-4 = kotak 2 kolom. Klik membuka gambar penuh di tab baru. */
export default function ImageGallery({ images }: { images: DiaryImage[] }) {
  if (images.length === 0) return null;
  const single = images.length === 1;

  return (
    <div className={`grid gap-1.5 rounded-2xl overflow-hidden ${single ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {images.map((img) => (
        <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer" className="block bg-field">
          {/* eslint-disable-next-line @next/next/no-img-element -- gambar dari backend (domain berbeda), tak perlu optimasi next/image */}
          <img
            src={img.url}
            alt="Lampiran catatan"
            loading="lazy"
            className={`w-full object-cover ${single ? 'max-h-96' : 'h-40 sm:h-48'}`}
          />
        </a>
      ))}
    </div>
  );
}
