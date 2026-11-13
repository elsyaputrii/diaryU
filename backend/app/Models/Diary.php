<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Diary extends Model
{
    public const MOODS = ['happy', 'calm', 'sad', 'anxious', 'excited', 'reflective'];

    protected $fillable = ['title', 'content', 'mood', 'tags', 'entry_date'];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            // Frontend mengharapkan "YYYY-MM-DD", bukan "2026-10-19T00:00:00Z".
            'entry_date' => 'date:Y-m-d',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
