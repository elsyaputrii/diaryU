<?php

namespace App\Http\Controllers;

use App\Http\Resources\DiaryResource;
use App\Models\Diary;
use App\Models\DiaryImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DiaryImageController extends Controller
{
    /** Unggah 1-4 gambar ke catatan milik sendiri (multipart/form-data, field "images[]"). */
    public function store(Request $request, string $id): JsonResponse
    {
        $diary = $request->user()->diaries()->findOrFail($id);

        $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:'.Diary::MAX_IMAGES],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ], [
            'images.required' => 'Pilih minimal satu gambar.',
            'images.max' => 'Maksimal '.Diary::MAX_IMAGES.' gambar per catatan.',
            'images.*.image' => 'File harus berupa gambar.',
            'images.*.mimes' => 'Format gambar harus JPG, PNG, atau WebP.',
            'images.*.max' => 'Ukuran gambar maksimal 5 MB.',
            'images.*.uploaded' => 'Gambar gagal diunggah. Ukurannya mungkin terlalu besar.',
        ]);

        $files = $request->file('images');

        if ($diary->images()->count() + count($files) > Diary::MAX_IMAGES) {
            throw ValidationException::withMessages([
                'images' => 'Maksimal '.Diary::MAX_IMAGES.' gambar per catatan.',
            ]);
        }

        foreach ($files as $file) {
            // Nama file diacak oleh Laravel sehingga URL gambar tidak bisa ditebak.
            $diary->images()->create(['path' => $file->store('diary-images', 'public')]);
        }

        return $this->respond($request, $diary, 'Gambar berhasil diunggah.', 201);
    }

    public function destroy(Request $request, string $id, string $imageId): JsonResponse
    {
        $diary = $request->user()->diaries()->findOrFail($id);
        $diary->images()->findOrFail($imageId)->delete(); // file ikut terhapus (lihat DiaryImage::booted)

        return $this->respond($request, $diary, 'Gambar dihapus.');
    }

    private function respond(Request $request, Diary $diary, string $message, int $status = 200): JsonResponse
    {
        $fresh = Diary::withSocial($request->user()->id)->findOrFail($diary->id);

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => new DiaryResource($fresh),
        ], $status);
    }
}
