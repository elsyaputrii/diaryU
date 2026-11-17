<?php

namespace App\Http\Controllers;

use App\Models\Diary;
use App\Models\Repost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RepostController extends Controller
{
    /** Repost biasa (tanpa "quote") atau kutip (dengan "quote"). Memposting ulang = memperbarui kutipannya. */
    public function store(Request $request, string $id): JsonResponse
    {
        $diary = Diary::where('is_public', true)->findOrFail($id);

        $data = $request->validate([
            'quote' => ['nullable', 'string', 'max:280'],
        ], [
            'quote.max' => 'Kutipan maksimal 280 karakter.',
        ]);

        $quote = isset($data['quote']) ? trim($data['quote']) : null;

        Repost::updateOrCreate(
            ['user_id' => $request->user()->id, 'diary_id' => $diary->id],
            ['quote' => $quote === '' ? null : $quote],
        );

        return $this->state($diary, true);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $diary = Diary::where('is_public', true)->findOrFail($id);

        Repost::where('user_id', $request->user()->id)->where('diary_id', $diary->id)->delete();

        return $this->state($diary, false);
    }

    private function state(Diary $diary, bool $reposted): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'OK',
            'data' => ['reposted' => $reposted, 'reposts_count' => $diary->reposts()->count()],
        ]);
    }
}
