'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FeedItem } from '@/types';
import { getErrorMessage } from '@/lib/errors';
import { getFeed } from '../services/feedService';

/**
 * Jelajah dengan "muat lebih banyak".
 *
 *   const { items, loading, error, hasMore, loadingMore, loadMore, reload } = useFeed();
 */
export function useFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [loadMoreError, setLoadMoreError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getFeed(1)
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setHasMore(data.hasMore);
        setPage(1);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Gagal memuat Jelajah.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    setLoadMoreError('');
    setReloadKey((k) => k + 1);
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setLoadMoreError('');
    try {
      const data = await getFeed(page + 1);
      // Postingan baru bisa menggeser urutan antar halaman -> buang duplikat.
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.key));
        return [...prev, ...data.items.filter((i) => !seen.has(i.key))];
      });
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch (err) {
      setLoadMoreError(getErrorMessage(err, 'Gagal memuat lebih banyak.'));
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, page]);

  return { items, loading, error, hasMore, loadingMore, loadMoreError, loadMore, reload };
}
