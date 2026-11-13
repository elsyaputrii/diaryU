<?php

namespace App\Http\Controllers;

use App\Http\Requests\DiaryRequest;
use App\Models\Diary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiaryController extends Controller
{
    /** Semua catatan milik user (frontend memfilter, menghitung mood, dan kalender di sisi klien). */
    public function index(Request $request): JsonResponse
    {
        $diaries = $request->user()->diaries()
            ->orderByDesc('entry_date')
            ->orderByDesc('id')
            ->get();

        return $this->ok($diaries);
    }

    public function store(DiaryRequest $request): JsonResponse
    {
        $diary = $request->user()->diaries()->create($request->validated());

        return $this->ok($diary, 'Catatan berhasil dibuat.', 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        return $this->ok($this->findOwned($request, $id));
    }

    public function update(DiaryRequest $request, string $id): JsonResponse
    {
        $diary = $this->findOwned($request, $id);
        $diary->update($request->validated());

        return $this->ok($diary->fresh(), 'Catatan berhasil diperbarui.');
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $this->findOwned($request, $id)->delete();

        return response()->json(['success' => true, 'message' => 'Catatan berhasil dihapus.']);
    }

    /** Catatan milik user lain dianggap tidak ada (404), bukan 403. */
    private function findOwned(Request $request, string $id): Diary
    {
        return $request->user()->diaries()->findOrFail($id);
    }

    private function ok(mixed $data, string $message = 'OK', int $status = 200): JsonResponse
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $status);
    }
}
