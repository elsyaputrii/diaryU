'use client';

import Link from 'next/link';
import { Compass, PlusCircle } from 'lucide-react';
import PageShell from '@/components/layout/PageShell';
import Loading from '@/components/ui/Loading';
import ErrorNotice from '@/components/ui/ErrorNotice';
import EmptyState from '@/components/ui/EmptyState';
import { buttonPrimary, buttonSecondary } from '@/components/ui/styles';
import FeedCard from '@/features/feed/components/FeedCard';
import { useFeed } from '@/features/feed/hooks/useFeed';

export default function ExplorePage() {
  const { items, loading, error, hasMore, loadingMore, loadMoreError, loadMore, reload } = useFeed();

  return (
    <PageShell width="max-w-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" /> Jelajah
          </h1>
          <p className="text-sm text-ink-muted">Cerita yang dibagikan pengguna lain.</p>
        </div>
        <Link href="/diary/create" className={buttonPrimary}>
          <PlusCircle className="w-5 h-5" /> Tulis
        </Link>
      </div>

      {loading ? (
        <Loading text="Memuat Jelajah..." />
      ) : error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Belum ada yang dibagikan"
          description="Tulis catatan lalu centang “Bagikan ke Jelajah” untuk jadi yang pertama."
          action={{ label: 'Tulis Catatan', href: '/diary/create' }}
        />
      ) : (
        <div className="space-y-5">
          {items.map((item) => (
            <FeedCard key={item.key} item={item} />
          ))}

          {loadMoreError && <ErrorNotice message={loadMoreError} />}
          {hasMore && (
            <div className="text-center">
              <button type="button" onClick={loadMore} disabled={loadingMore} className={buttonSecondary}>
                {loadingMore ? 'Memuat...' : 'Muat lebih banyak'}
              </button>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
