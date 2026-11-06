import type { LoginInput, RegisterInput } from './services/authService';

/** Aturan validasi form Login & Register. Mengembalikan objek pesan error per field ({} = valid). */

export type LoginErrors = Partial<Record<keyof LoginInput, string>>;
export type RegisterErrors = Partial<Record<keyof RegisterInput, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (email: string) => EMAIL_REGEX.test(email.trim());

export const PASSWORD_MIN_LENGTH = 8;

export function validateLogin(values: LoginInput): LoginErrors {
  const errors: LoginErrors = {};
  if (!values.email.trim()) errors.email = 'Email wajib diisi.';
  else if (!isValidEmail(values.email)) errors.email = 'Format email tidak valid.';

  if (!values.password) errors.password = 'Password wajib diisi.';
  return errors;
}

export function validateRegister(values: RegisterInput): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.name.trim()) errors.name = 'Nama wajib diisi.';
  else if (values.name.trim().length < 2) errors.name = 'Nama minimal 2 karakter.';

  if (!values.email.trim()) errors.email = 'Email wajib diisi.';
  else if (!isValidEmail(values.email)) errors.email = 'Format email tidak valid.';

  if (!values.password) errors.password = 'Password wajib diisi.';
  else if (values.password.length < PASSWORD_MIN_LENGTH)
    errors.password = `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`;

  if (!values.passwordConfirmation) errors.passwordConfirmation = 'Konfirmasi password wajib diisi.';
  else if (values.passwordConfirmation !== values.password)
    errors.passwordConfirmation = 'Konfirmasi password tidak sama.';

  return errors;
}

export function validateForgotPassword(email: string): string | undefined {
  if (!email.trim()) return 'Email wajib diisi.';
  if (!isValidEmail(email)) return 'Format email tidak valid.';
  return undefined;
}
