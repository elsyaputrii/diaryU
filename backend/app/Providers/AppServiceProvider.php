<?php

namespace App\Providers;

use App\Models\ApiToken;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Guard "api": baca token dari header "Authorization: Bearer <token>".
        Auth::viaRequest('api-token', function (Request $request) {
            $plain = $request->bearerToken();
            if (! $plain) {
                return null;
            }

            $token = ApiToken::findValid($plain);
            if (! $token) {
                return null;
            }

            // Dipakai oleh logout / ganti password untuk tahu token mana yang sedang aktif.
            $request->attributes->set('api_token', $token);

            if (! $token->last_used_at || $token->last_used_at->lt(now()->subMinutes(5))) {
                $token->forceFill(['last_used_at' => now()])->save();
            }

            return $token->user;
        });

        // Tautan reset password mengarah ke frontend.
        ResetPassword::createUrlUsing(function ($user, string $token) {
            $frontend = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/');

            return $frontend.'/reset-password?token='.$token.'&email='.urlencode($user->email);
        });
    }
}
