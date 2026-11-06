import { apiClient } from '@/services/api';

export interface ProfileData {
  name: string;
  email: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export async function getProfile(): Promise<ProfileData> {
  const res = await apiClient.get('/user');
  const data = res.data.data || res.data;
  return { name: data.name, email: data.email };
}

export async function updateProfile(input: ProfileData): Promise<ProfileData> {
  const res = await apiClient.put('/user/profile', { name: input.name.trim(), email: input.email.trim() });
  const data = res.data.data || res.data;
  return { name: data.name ?? input.name, email: data.email ?? input.email };
}

/** Kontrak API yang diharapkan: PUT /user/password { current_password, password, password_confirmation }. */
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient.put('/user/password', {
    current_password: input.currentPassword,
    password: input.password,
    password_confirmation: input.passwordConfirmation,
  });
}
