<?php

namespace App\Http\Controllers;

use App\Http\Resources\DiaryResource;
use App\Models\Diary;
use App\Models\Repost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    private const PER_PAGE = 15;

    /**
     * Jelajah: catatan publik semua pengguna + repost, digabung dan diurutkan dari yang terbaru.
     * Query: ?page=1. Respons: { data: [item...], has_more: bool }.
     *
     * Item: { type: 'diary' | 'repost', key, at, diary, reposted_by?, quote? }
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $page = max(1, (int) $request->query('page', 1));
        $offset = ($page - 1) * self::PER_PAGE;

        // Ambil (offset + per_page + 1) teratas dari tiap sumber: cukup untuk menggabung dengan urutan yang benar
        // dan mengetahui apakah masih ada halaman berikutnya.
        $take = $offset + self::PER_PAGE + 1;

        $diaries = Diary::where('is_public', true)
            ->withSocial($userId)
            ->orderByDesc('published_at')->orderByDesc('id')
            ->limit($take)->get()
            ->map(fn (Diary $d) => [
                'type' => 'diary',
                'key' => 'd'.$d->id,
                'sort' => $d->published_at?->getTimestamp() ?? 0,
                'at' => $d->published_at?->toISOString(),
                'diary' => new DiaryResource($d),
            ]);

        $reposts = Repost::whereHas('diary', fn ($q) => $q->where('is_public', true))
            ->with([
                'user:id,name',
                'diary' => fn ($q) => $q->withSocial($userId),
            ])
            ->orderByDesc('created_at')->orderByDesc('id')
            ->limit($take)->get()
            ->map(fn (Repost $r) => [
                'type' => 'repost',
                'key' => 'r'.$r->id,
                'sort' => $r->created_at->getTimestamp(),
                'at' => $r->created_at->toISOString(),
                'reposted_by' => ['id' => $r->user->id, 'name' => $r->user->name],
                'quote' => $r->quote,
                'diary' => new DiaryResource($r->diary),
            ]);

        $merged = $diaries->concat($reposts)
            ->sortByDesc(fn (array $item) => $item['sort'])
            ->values();

        $items = $merged->slice($offset, self::PER_PAGE)
            ->map(fn (array $item) => collect($item)->except('sort')->all())
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'OK',
            'data' => $items,
            'has_more' => $merged->count() > $offset + self::PER_PAGE,
        ]);
    }
}
