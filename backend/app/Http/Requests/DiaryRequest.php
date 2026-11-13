<?php

namespace App\Http\Requests;

use App\Models\Diary;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:100'],
            'content' => ['required', 'string', 'min:10'],
            'mood' => ['required', Rule::in(Diary::MOODS)],
            'entry_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:30'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Judul wajib diisi.',
            'title.min' => 'Judul minimal 3 karakter.',
            'title.max' => 'Judul maksimal 100 karakter.',
            'content.required' => 'Isi catatan wajib diisi.',
            'content.min' => 'Isi catatan minimal 10 karakter.',
            'mood.required' => 'Pilih salah satu suasana hati.',
            'mood.in' => 'Suasana hati tidak valid.',
            'entry_date.required' => 'Tanggal wajib diisi.',
            'entry_date.date_format' => 'Format tanggal harus YYYY-MM-DD.',
            'entry_date.before_or_equal' => 'Tanggal tidak boleh di masa depan.',
        ];
    }
}
