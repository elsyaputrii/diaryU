<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ApiToken extends Model
{
    public const LIFETIME_DAYS = 30;

    protected $fillable = ['user_id', 'token', 'last_used_at', 'expires_at'];

    protected $hidden = ['token'];

    protected function casts(): array
    {
        return [
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Buat token baru. Token asli hanya dikembalikan sekali; di DB hanya tersimpan hash-nya. */
    public static function issueFor(User $user): string
    {
        $plain = Str::random(64);

        static::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plain),
            'expires_at' => now()->addDays(self::LIFETIME_DAYS),
        ]);

        return $plain;
    }

    /** Cari token yang masih berlaku dari token asli (bearer). */
    public static function findValid(string $plain): ?self
    {
        $token = static::with('user')->where('token', hash('sha256', $plain))->first();

        if (! $token || ! $token->user) {
            return null;
        }

        if ($token->expires_at && $token->expires_at->isPast()) {
            $token->delete();

            return null;
        }

        return $token;
    }
}
