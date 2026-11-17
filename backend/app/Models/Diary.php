<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Diary extends Model
{
    public const MOODS = ['happy', 'calm', 'sad', 'anxious', 'excited', 'reflective'];

    /** Jumlah gambar maksimum per catatan. */
    public const MAX_IMAGES = 4;

    protected $fillable = ['title', 'content', 'mood', 'tags', 'entry_date', 'is_public'];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'entry_date' => 'date:Y-m-d',
            'is_public' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        // Catat waktu dibagikan setiap kali catatan berubah dari privat -> publik.
        static::saving(function (Diary $diary) {
            if ($diary->is_public && ($diary->isDirty('is_public') || ! $diary->published_at)) {
                $diary->published_at = now();
            }
        });

        // Baris gambar ikut terhapus lewat cascade DB, tapi file-nya harus dihapus manual.
        static::deleting(function (Diary $diary) {
            $diary->images()->get()->each->delete();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(DiaryImage::class)->orderBy('id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(Repost::class);
    }

    /** Catatan milik sendiri ATAU catatan publik milik orang lain. */
    public function scopeVisibleTo(Builder $query, int $userId): Builder
    {
        return $query->where(fn (Builder $q) => $q->where('user_id', $userId)->orWhere('is_public', true));
    }

    /** Muat penulis (hanya id & nama, TANPA email), gambar, jumlah like/komentar/repost, dan status like/repost si pembaca. */
    public function scopeWithSocial(Builder $query, int $userId): Builder
    {
        return $query
            ->with(['user:id,name', 'images'])
            ->withCount(['likes', 'comments', 'reposts'])
            ->withExists([
                'likes as liked' => fn (Builder $q) => $q->where('user_id', $userId),
                'reposts as reposted' => fn (Builder $q) => $q->where('user_id', $userId),
            ]);
    }
}
