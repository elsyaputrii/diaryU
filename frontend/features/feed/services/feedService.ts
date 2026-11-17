import { apiClient } from '@/services/api';
import type { FeedItem } from '@/types';

export interface FeedPage {
  items: FeedItem[];
  hasMore: boolean;
}

/** Jelajah: catatan publik semua pengguna + repost, terbaru dulu (15 item per halaman). */
export async function getFeed(page = 1): Promise<FeedPage> {
  const res = await apiClient.get('/feed', { params: { page } });
  const items: FeedItem[] = (res.data.data ?? []).map((item: FeedItem) => ({
    ...item,
    diary: { ...item.diary, entry_date: item.diary.entry_date.slice(0, 10) },
  }));
  return { items, hasMore: !!res.data.has_more };
}
