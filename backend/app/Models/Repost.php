<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Repost extends Model
{
    protected $fillable = ['user_id', 'diary_id', 'quote'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function diary(): BelongsTo
    {
        return $this->belongsTo(Diary::class);
    }
}
