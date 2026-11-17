export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'excited' | 'reflective';

/** Penulis catatan. Backend hanya mengirim id & nama (tanpa email). */
export interface Author {
  id: number;
  name: string;
}

export interface DiaryImage {
  id: number;
  url: string;
}

export interface Diary {
  id: number;
  user_id: number;
  title: string;
  content: string;
  mood: MoodType;
  tags?: string[];
  entry_date: string;
  created_at: string;
  updated_at: string;
  /** Waktu catatan mulai dibagikan ke Jelajah (null bila privat). */
  published_at?: string | null;
  /** Catatan publik tampil di Jelajah. Catatan baru selalu privat kecuali dipilih lain. */
  is_public?: boolean;
  /** true bila catatan ini milik pengguna yang sedang login. */
  is_owner?: boolean;
  author?: Author;
  images?: DiaryImage[];
  likes_count?: number;
  comments_count?: number;
  reposts_count?: number;
  liked?: boolean;
  reposted?: boolean;
}

export interface DiaryComment {
  id: number;
  diary_id: number;
  parent_id: number | null;
  body: string;
  created_at: string;
  author: Author;
  can_delete: boolean;
  replies?: DiaryComment[];
}

/** Satu baris di Jelajah: catatan publik biasa, atau repost (dengan/tanpa kutipan). */
export interface FeedItem {
  type: 'diary' | 'repost';
  key: string;
  at: string | null;
  diary: Diary;
  reposted_by?: Author;
  quote?: string | null;
}

export interface MoodStats {
  mood: MoodType;
  count: number;
  percentage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: T[];
    per_page: number;
    total: number;
  };
}

/** Data yang dikirim ke backend saat membuat / mengubah diary. */
export interface DiaryPayload {
  title: string;
  content: string;
  mood: MoodType;
  entry_date: string; // format YYYY-MM-DD
  /** Kosongkan = tidak diubah. */
  is_public?: boolean;
}
