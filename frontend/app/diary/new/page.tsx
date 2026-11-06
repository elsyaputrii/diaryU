import { redirect } from 'next/navigation';

/** Alamat lama /diary/new -> halaman tulis catatan yang sebenarnya. */
export default function NewDiaryRedirect() {
  redirect('/diary/create');
}
