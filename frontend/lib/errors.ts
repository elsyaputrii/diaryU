import axios from 'axios';

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>; // format validasi Laravel
};

/**
 * Mengambil pesan error yang ramah dari error axios.
 * Urutan: error validasi Laravel -> message dari server -> fallback.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.';
    }
    const data = err.response.data as ApiErrorBody | undefined;
    const firstValidation = data?.errors ? Object.values(data.errors)[0]?.[0] : undefined;
    if (firstValidation || data?.message) return (firstValidation || data?.message) as string;
    if (err.response.status === 404 || err.response.status === 405) {
      return 'Fitur ini belum tersedia di server.';
    }
    return fallback;
  }
  return fallback;
}

/** Error validasi Laravel per field: { email: 'Email sudah dipakai.' } (kosong jika bukan error 422). */
export function getFieldErrors(err: unknown): Record<string, string> {
  if (!axios.isAxiosError(err)) return {};
  const errors = (err.response?.data as ApiErrorBody | undefined)?.errors;
  if (!errors) return {};
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));
}