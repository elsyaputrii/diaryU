<?php

namespace App\Http\Resources;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Muat relasi `user:id,name` dan `diary:id,user_id` agar pemilik catatan bisa menghapus komentar di catatannya.
 *
 * @mixin Comment
 */
class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewerId = $request->user()?->id;

        return [
            'id' => $this->id,
            'diary_id' => $this->diary_id,
            'parent_id' => $this->parent_id,
            'body' => $this->body,
            'created_at' => $this->created_at?->toISOString(),
            'author' => ['id' => $this->user->id, 'name' => $this->user->name],
            'can_delete' => $viewerId !== null
                && ($viewerId === $this->user_id || $viewerId === $this->diary?->user_id),
            'replies' => $this->whenLoaded('replies', fn () => self::collection($this->replies)),
        ];
    }
}
