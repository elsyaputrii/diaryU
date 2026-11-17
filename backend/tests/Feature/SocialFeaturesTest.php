<?php

namespace Tests\Feature;

use App\Models\Diary;
use App\Models\DiaryImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SocialFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private function register(string $email): string
    {
        $token = $this->postJson('/api/register', [
            'name' => 'User '.strtok($email, '@'),
            'email' => $email,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()->json('token');

        $this->app['auth']->forgetGuards();

        return $token;
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

    private function createDiary(string $token, array $over = []): int
    {
        $id = $this->withToken($token)->postJson('/api/diaries', $this->diary($over))
            ->assertCreated()->json('data.id');
        $this->app['auth']->forgetGuards();

        return $id;
    }

    public function test_new_diaries_are_private_by_default_and_can_be_made_public(): void
    {
        $a = $this->register('a@test.com');

        $this->withToken($a)->postJson('/api/diaries', $this->diary())
            ->assertCreated()
            ->assertJsonPath('data.is_public', false)
            ->assertJsonPath('data.is_owner', true)
            ->assertJsonPath('data.likes_count', 0);

        $this->app['auth']->forgetGuards();
        $id = $this->createDiary($a, ['is_public' => true]);

        $this->withToken($a)->getJson("/api/diaries/{$id}")
            ->assertOk()->assertJsonPath('data.is_public', true);
    }

    public function test_update_without_is_public_keeps_current_visibility(): void
    {
        $a = $this->register('a@test.com');
        $id = $this->createDiary($a, ['is_public' => true]);

        $this->withToken($a)->putJson("/api/diaries/{$id}", $this->diary(['title' => 'Judul baru']))
            ->assertOk()->assertJsonPath('data.is_public', true);
    }

    public function test_public_diary_is_readable_by_others_but_private_is_not(): void
    {
        $a = $this->register('a@test.com');
        $public = $this->createDiary($a, ['is_public' => true]);
        $private = $this->createDiary($a);

        $b = $this->register('b@test.com');

        $this->withToken($b)->getJson("/api/diaries/{$public}")
            ->assertOk()
            ->assertJsonPath('data.is_owner', false)
            ->assertJsonPath('data.author.name', 'User a')
            ->assertJsonMissingPath('data.author.email');

        $this->app['auth']->forgetGuards();
        $this->withToken($b)->getJson("/api/diaries/{$private}")->assertNotFound();

        // Membaca bukan berarti boleh mengubah / menghapus
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->putJson("/api/diaries/{$public}", $this->diary())->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->deleteJson("/api/diaries/{$public}")->assertNotFound();
    }

    public function test_feed_only_lists_public_diaries_and_hides_author_email(): void
    {
        $a = $this->register('a@test.com');
        $this->createDiary($a, ['title' => 'Catatan publik', 'is_public' => true]);
        $this->createDiary($a, ['title' => 'Catatan rahasia']);

        $b = $this->register('b@test.com');

        $response = $this->withToken($b)->getJson('/api/feed')->assertOk();
        $response->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'diary')
            ->assertJsonPath('data.0.diary.title', 'Catatan publik')
            ->assertJsonPath('has_more', false);

        $this->assertStringNotContainsString('a@test.com', $response->getContent());
        $this->assertStringNotContainsString('Catatan rahasia', $response->getContent());
    }

    public function test_feed_paginates(): void
    {
        $a = $this->register('a@test.com');
        for ($i = 0; $i < 17; $i++) {
            $this->createDiary($a, ['title' => "Catatan {$i}", 'is_public' => true]);
        }

        $this->withToken($a)->getJson('/api/feed?page=1')
            ->assertOk()->assertJsonCount(15, 'data')->assertJsonPath('has_more', true);
        $this->app['auth']->forgetGuards();
        $this->withToken($a)->getJson('/api/feed?page=2')
            ->assertOk()->assertJsonCount(2, 'data')->assertJsonPath('has_more', false);
    }

    public function test_like_is_idempotent_and_unlike_works(): void
    {
        $a = $this->register('a@test.com');
        $id = $this->createDiary($a, ['is_public' => true]);
        $b = $this->register('b@test.com');

        $this->withToken($b)->postJson("/api/diaries/{$id}/like")
            ->assertOk()->assertJsonPath('data.liked', true)->assertJsonPath('data.likes_count', 1);
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->postJson("/api/diaries/{$id}/like")
            ->assertOk()->assertJsonPath('data.likes_count', 1);

        $this->app['auth']->forgetGuards();
        $this->withToken($b)->getJson("/api/diaries/{$id}")
            ->assertJsonPath('data.liked', true)->assertJsonPath('data.likes_count', 1);

        $this->app['auth']->forgetGuards();
        $this->withToken($b)->deleteJson("/api/diaries/{$id}/like")
            ->assertOk()->assertJsonPath('data.liked', false)->assertJsonPath('data.likes_count', 0);
    }

    public function test_cannot_interact_with_private_diary(): void
    {
        $a = $this->register('a@test.com');
        $private = $this->createDiary($a);
        $b = $this->register('b@test.com');

        $this->withToken($b)->postJson("/api/diaries/{$private}/like")->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->postJson("/api/diaries/{$private}/repost")->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->getJson("/api/diaries/{$private}/comments")->assertNotFound();
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->postJson("/api/diaries/{$private}/comments", ['body' => 'halo'])->assertNotFound();
    }

    public function test_comments_replies_and_delete_permissions(): void
    {
        $owner = $this->register('owner@test.com');
        $id = $this->createDiary($owner, ['is_public' => true]);
        $b = $this->register('b@test.com');
        $c = $this->register('c@test.com');

        $commentId = $this->withToken($b)->postJson("/api/diaries/{$id}/comments", ['body' => '  Semangat ya!  '])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Semangat ya!')
            ->assertJsonPath('data.can_delete', true)
            ->json('data.id');

        // Balasan ke balasan dipindah ke bawah komentar utama (hanya satu tingkat)
        $this->app['auth']->forgetGuards();
        $replyId = $this->withToken($c)->postJson("/api/diaries/{$id}/comments", ['body' => 'Setuju', 'parent_id' => $commentId])
            ->assertCreated()->json('data.id');
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->postJson("/api/diaries/{$id}/comments", ['body' => 'Makasih', 'parent_id' => $replyId])
            ->assertCreated()->assertJsonPath('data.parent_id', $commentId);

        $this->app['auth']->forgetGuards();
        $this->withToken($c)->getJson("/api/diaries/{$id}/comments")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonCount(2, 'data.0.replies')
            ->assertJsonPath('data.0.can_delete', false)
            ->assertJsonPath('data.0.replies.0.can_delete', true);

        $this->app['auth']->forgetGuards();
        $this->withToken($b)->getJson("/api/diaries/{$id}")->assertJsonPath('data.comments_count', 3);

        // Orang lain tidak boleh menghapus
        $this->app['auth']->forgetGuards();
        $this->withToken($c)->deleteJson("/api/comments/{$commentId}")->assertForbidden();

        // Pemilik catatan boleh menghapus komentar siapa pun; balasan ikut terhapus
        $this->app['auth']->forgetGuards();
        $this->withToken($owner)->deleteJson("/api/comments/{$commentId}")->assertOk();
        $this->assertDatabaseCount('comments', 0);
    }

    public function test_comment_validation(): void
    {
        $a = $this->register('a@test.com');
        $id = $this->createDiary($a, ['is_public' => true]);
        $otherDiary = $this->createDiary($a, ['is_public' => true]);

        $this->withToken($a)->postJson("/api/diaries/{$id}/comments", ['body' => ''])
            ->assertStatus(422)->assertJsonValidationErrors('body');
        $this->app['auth']->forgetGuards();
        $this->withToken($a)->postJson("/api/diaries/{$id}/comments", ['body' => '   '])
            ->assertStatus(422);
        $this->app['auth']->forgetGuards();
        $this->withToken($a)->postJson("/api/diaries/{$id}/comments", ['body' => str_repeat('a', 501)])
            ->assertStatus(422)->assertJsonValidationErrors('body');

        // parent dari catatan lain ditolak
        $this->app['auth']->forgetGuards();
        $foreign = $this->withToken($a)->postJson("/api/diaries/{$otherDiary}/comments", ['body' => 'ok'])->json('data.id');
        $this->app['auth']->forgetGuards();
        $this->withToken($a)->postJson("/api/diaries/{$id}/comments", ['body' => 'x', 'parent_id' => $foreign])
            ->assertStatus(422)->assertJsonValidationErrors('parent_id');
    }

    public function test_repost_quote_and_feed_entry(): void
    {
        $a = $this->register('a@test.com');
        $id = $this->createDiary($a, ['is_public' => true]);
        $b = $this->register('b@test.com');

        $this->withToken($b)->postJson("/api/diaries/{$id}/repost")
            ->assertOk()->assertJsonPath('data.reposted', true)->assertJsonPath('data.reposts_count', 1);

        // Repost lagi dengan kutipan = memperbarui, bukan menggandakan
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->postJson("/api/diaries/{$id}/repost", ['quote' => 'Aku banget ini'])
            ->assertOk()->assertJsonPath('data.reposts_count', 1);

        $this->app['auth']->forgetGuards();
        $feed = $this->withToken($a)->getJson('/api/feed')->assertOk();
        $feed->assertJsonCount(2, 'data');
        $types = collect($feed->json('data'))->pluck('type')->sort()->values()->all();
        $this->assertSame(['diary', 'repost'], $types);
        $repost = collect($feed->json('data'))->firstWhere('type', 'repost');
        $this->assertSame('Aku banget ini', $repost['quote']);
        $this->assertSame('User b', $repost['reposted_by']['name']);
        $this->assertSame($id, $repost['diary']['id']);
        $this->assertFalse(isset($repost['reposted_by']['email']));

        $this->app['auth']->forgetGuards();
        $this->withToken($b)->postJson("/api/diaries/{$id}/repost", ['quote' => str_repeat('a', 281)])
            ->assertStatus(422)->assertJsonValidationErrors('quote');

        $this->app['auth']->forgetGuards();
        $this->withToken($b)->deleteJson("/api/diaries/{$id}/repost")
            ->assertOk()->assertJsonPath('data.reposted', false)->assertJsonPath('data.reposts_count', 0);
    }

    public function test_making_diary_private_removes_it_and_its_reposts_from_feed(): void
    {
        $a = $this->register('a@test.com');
        $id = $this->createDiary($a, ['is_public' => true]);
        $b = $this->register('b@test.com');
        $this->withToken($b)->postJson("/api/diaries/{$id}/repost")->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($a)->putJson("/api/diaries/{$id}", $this->diary(['is_public' => false]))->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($b)->getJson('/api/feed')->assertOk()->assertJsonCount(0, 'data');
        $this->app['auth']->forgetGuards();
        $this->withToken($b)->getJson("/api/diaries/{$id}")->assertNotFound();
    }

    public function test_image_upload_limit_and_delete_remove_files(): void
    {
        Storage::fake('public');

        $a = $this->register('a@test.com');
        $id = $this->createDiary($a, ['is_public' => true]);

        $response = $this->withToken($a)->post("/api/diaries/{$id}/images", [
            'images' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.png')],
        ], ['Accept' => 'application/json'])
            ->assertCreated()->assertJsonCount(2, 'data.images');

        $imageId = $response->json('data.images.0.id');
        $path = DiaryImage::findOrFail($imageId)->path;
        Storage::disk('public')->assertExists($path);

        // Total maksimal 4 gambar
        $this->app['auth']->forgetGuards();
        $this->withToken($a)->post("/api/diaries/{$id}/images", [
            'images' => [UploadedFile::fake()->image('c.jpg'), UploadedFile::fake()->image('d.jpg'), UploadedFile::fake()->image('e.jpg')],
        ], ['Accept' => 'application/json'])->assertStatus(422)->assertJsonValidationErrors('images');

        $this->app['auth']->forgetGuards();
        $this->withToken($a)->deleteJson("/api/diaries/{$id}/images/{$imageId}")
            ->assertOk()->assertJsonCount(1, 'data.images');
        Storage::disk('public')->assertMissing($path);

        // Menghapus catatan menghapus semua file gambarnya
        $remaining = DiaryImage::firstOrFail()->path;
        $this->app['auth']->forgetGuards();
        $this->withToken($a)->deleteJson("/api/diaries/{$id}")->assertOk();
        Storage::disk('public')->assertMissing($remaining);
    }

    public function test_image_upload_rejects_non_images_and_non_owners(): void
    {
        Storage::fake('public');

        $a = $this->register('a@test.com');
        $id = $this->createDiary($a, ['is_public' => true]);

        $this->withToken($a)->post("/api/diaries/{$id}/images", [
            'images' => [UploadedFile::fake()->create('virus.php', 10, 'application/x-php')],
        ], ['Accept' => 'application/json'])->assertStatus(422)->assertJsonValidationErrors('images.0');

        $this->app['auth']->forgetGuards();
        $this->withToken($a)->post("/api/diaries/{$id}/images", [
            'images' => [UploadedFile::fake()->create('big.jpg', 6000, 'image/jpeg')],
        ], ['Accept' => 'application/json'])->assertStatus(422);

        $b = $this->register('b@test.com');
        $this->withToken($b)->post("/api/diaries/{$id}/images", [
            'images' => [UploadedFile::fake()->image('a.jpg')],
        ], ['Accept' => 'application/json'])->assertNotFound();
    }

    public function test_diary_list_includes_social_counts_for_owner(): void
    {
        $a = $this->register('a@test.com');
        $id = $this->createDiary($a, ['is_public' => true]);
        $b = $this->register('b@test.com');
        $this->withToken($b)->postJson("/api/diaries/{$id}/like")->assertOk();

        $this->app['auth']->forgetGuards();
        $this->withToken($a)->getJson('/api/diaries')
            ->assertOk()
            ->assertJsonPath('data.0.likes_count', 1)
            ->assertJsonPath('data.0.liked', false)
            ->assertJsonPath('data.0.images', []);

        $this->assertSame(1, Diary::count());
    }
}
