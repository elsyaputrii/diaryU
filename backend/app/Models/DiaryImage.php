<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class DiaryImage extends Model
{
    protected $fillable = ['path'];

    protected static function booted(): void
    {
        static::deleting(function (DiaryImage $image) {
            Storage::disk('public')->delete($image->path);
        });
    }

    public function diary(): BelongsTo
    {
        return $this->belongsTo(Diary::class);
    }

    public function url(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
