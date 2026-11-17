<?php

namespace App\Http\Resources;

use App\Models\Diary;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Bentuk JSON satu catatan. Email penulis TIDAK pernah ikut terkirim (hanya id & nama).
 * Field sosial (jumlah like dll.) muncul bila catatan dimuat lewat Diary::withSocial().
 *
 * @mixin Diary
 */
class DiaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewerId = $request->user()?->id;

        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'content' => $this->content,
            'mood' => $this->mood,
            'tags' => $this->tags,
            'entry_date' => $this->entry_date?->format('Y-m-d'),
            'is_public' => (bool) $this->is_public,
            'is_owner' => $viewerId !== null && $viewerId === $this->user_id,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'published_at' => $this->published_at?->toISOString(),
            'author' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
            ]),
            'images' => $this->whenLoaded('images', fn () => $this->images
                ->map(fn ($image) => ['id' => $image->id, 'url' => $image->url()])
                ->values()),
            'likes_count' => $this->whenCounted('likes'),
            'comments_count' => $this->whenCounted('comments'),
            'reposts_count' => $this->whenCounted('reposts'),
            'liked' => (bool) $this->getAttribute('liked'),
            'reposted' => (bool) $this->getAttribute('reposted'),
        ];
    }
}
