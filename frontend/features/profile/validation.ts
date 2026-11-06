import { isValidEmail, PASSWORD_MIN_LENGTH } from '@/features/auth/validation';
import type { ChangePasswordInput, ProfileData } from './services/profileService';

export type ProfileErrors = Partial<Record<keyof ProfileData, string>>;

export function validateProfile(values: ProfileData): ProfileErrors {
  const errors: ProfileErrors = {};

  if (!values.name.trim()) errors.name = 'Nama wajib diisi.';
  else if (values.name.trim().length < 2) errors.name = 'Nama minimal 2 karakter.';

  if (!values.email.trim()) errors.email = 'Email wajib diisi.';
  else if (!isValidEmail(values.email)) errors.email = 'Format email tidak valid.';

  return errors;
}

export type PasswordErrors = Partial<Record<keyof ChangePasswordInput, string>>;

export function validatePasswordChange(values: ChangePasswordInput): PasswordErrors {
  const errors: PasswordErrors = {};
  if (!values.currentPassword) errors.currentPassword = 'Password saat ini wajib diisi.';

  if (!values.password) errors.password = 'Password baru wajib diisi.';
  else if (values.password.length < PASSWORD_MIN_LENGTH)
    errors.password = `Password minimal ${PASSWORD_MIN_LENGTH} karakter.`;
  else if (values.password === values.currentPassword)
    errors.password = 'Password baru harus berbeda dari password saat ini.';

  if (!values.passwordConfirmation) errors.passwordConfirmation = 'Konfirmasi password wajib diisi.';
  else if (values.passwordConfirmation !== values.password)
    errors.passwordConfirmation = 'Konfirmasi password tidak sama.';
  return errors;
}
