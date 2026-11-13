<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DiaryUApiTest extends TestCase
{
    use RefreshDatabase;

    private function register(string $email = 'a@test.com'): string
    {
        return $this->postJson('/api/register', [
            'name' => 'Elsya',
            'email' => $email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()->json('token');
    }

    private function diary(array $over = []): array
    {
        return array_merge([
            'title' => 'Hari ini',
            'content' => 'Isi catatan yang cukup panjang.',
            'mood' => 'happy',
            'entry_date' => now()->toDateString(),
        ], $over);
    }

    public function test_register_login_and_profile(): void
    {
        $token = $this->register();

        $this->withToken($token)->getJson('/api/user')
            ->assertOk()->assertJsonPath('data.email', 'a@test.com');

        $this->postJson('/api/login', ['email' => 'a@test.com', 'password' => 'salah'])
            ->assertStatus(401)->assertJsonPath('message', 'Email atau password salah.');

        $this->postJson('/api/login', ['email' => 'a@test.com', 'password' => 'password123'])
            ->assertOk()->assertJsonStructure(['token']);
    }

    public function test_register_validation_and_duplicate_email(): void
    {
        $this->register();

        $this->postJson('/api/register', [
            'name' => 'X', 'email' => 'a@test.com', 'password' => 'short', 'password_confirmation' => 'x',
        ])->assertStatus(422)->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_protected_routes_need_token_and_logout_revokes_it(): void
    {
        $this->getJson('/api/diaries')->assertStatus(401);

        $token = $this->register();
        $this->withToken($token)->postJson('/api/logout')->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/user')->assertStatus(401);
    }

    public function test_diary_crud_with_date_only_format(): void
    {
        $token = $this->register();
        $date = now()->toDateString();

        $id = $this->withToken($token)->postJson('/api/diaries', $this->diary())
            ->assertCreated()->assertJsonPath('data.entry_date', $date)->json('data.id');

        $this->withToken($token)->getJson('/api/diaries')
            ->assertOk()->assertJsonCount(1, 'data');

        $this->withToken($token)->putJson("/api/diaries/{$id}", $this->diary(['title' => 'Diubah', 'mood' => 'calm']))
            ->assertOk()->assertJsonPath('data.title', 'Diubah')->assertJsonPath('data.mood', 'calm');

        $this->withToken($token)->deleteJson("/api/diaries/{$id}")->assertOk();
        $this->withToken($token)->getJson("/api/diaries/{$id}")->assertNotFound();
    }

    public function test_diary_validation(): void
    {
        $token = $this->register();

        $this->withToken($token)->postJson('/api/diaries', $this->diary([
            'mood' => 'marah', 'entry_date' => now()->addDays(3)->toDateString(), 'title' => 'ab',
        ]))->assertStatus(422)->assertJsonValidationErrors(['mood', 'entry_date', 'title']);
    }

    public function test_user_cannot_touch_other_users_diary(): void
    {
        $a = $this->register('a@test.com');
        $id = $this->withToken($a)->postJson('/api/diaries', $this->diary())->json('data.id');

        $this->app['auth']->forgetGuards();
        $b = $this->register('b@test.com');

        $this->app['auth']->forgetGuards();
        $this->withToken($b)->getJson("/api/diaries/{$id}")->assertNotFound();
        $this->withToken($b)->deleteJson("/api/diaries/{$id}")->assertNotFound();
        $this->withToken($b)->getJson('/api/diaries')->assertJsonCount(0, 'data');
    }

    public function test_update_profile_and_change_password(): void
    {
        $token = $this->register();

        $this->withToken($token)->putJson('/api/user/profile', ['name' => 'Baru', 'email' => 'baru@test.com'])
            ->assertOk()->assertJsonPath('data.email', 'baru@test.com');

        $this->withToken($token)->putJson('/api/user/password', [
            'current_password' => 'salah', 'password' => 'passwordbaru1', 'password_confirmation' => 'passwordbaru1',
        ])->assertStatus(422)->assertJsonValidationErrors('current_password');

        $this->withToken($token)->putJson('/api/user/password', [
            'current_password' => 'password123', 'password' => 'passwordbaru1', 'password_confirmation' => 'passwordbaru1',
        ])->assertOk();

        $this->postJson('/api/login', ['email' => 'baru@test.com', 'password' => 'passwordbaru1'])->assertOk();
    }

    public function test_forgot_password_always_succeeds(): void
    {
        $this->postJson('/api/forgot-password', ['email' => 'tidakada@test.com'])->assertOk();

        User::factory()->create(['email' => 'ada@test.com']);
        $this->postJson('/api/forgot-password', ['email' => 'ada@test.com'])->assertOk();
    }
}
