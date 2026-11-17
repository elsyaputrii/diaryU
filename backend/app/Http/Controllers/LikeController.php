<?php

namespace App\Http\Controllers;

use App\Models\Diary;
use App\Models\Like;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    /** Idempotent: menekan like dua kali tetap menghasilkan satu like. */
    public function store(Request $request, string $id): JsonResponse
    {
        $diary = Diary::where('is_public', true)->findOrFail($id);

        Like::query()->insertOrIgnore([
            'user_id' => $request->user()->id,
            'diary_id' => $diary->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->state($request, $diary, true);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $diary = Diary::where('is_public', true)->findOrFail($id);

        Like::where('user_id', $request->user()->id)->where('diary_id', $diary->id)->delete();

        return $this->state($request, $diary, false);
    }

    private function state(Request $request, Diary $diary, bool $liked): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'OK',
            'data' => ['liked' => $liked, 'likes_count' => $diary->likes()->count()],
        ]);
    }
}
