<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /** Akun demo: demo@diaryu.test / password123 */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'demo@diaryu.test'],
            ['name' => 'Demo User', 'password' => 'password123'],
        );

        if ($user->diaries()->exists()) {
            return;
        }

        $samples = [
            ['Hari yang menyenangkan', 'Hari ini aku jalan-jalan sore dan merasa sangat senang.', 'happy', 0],
            ['Tenang setelah hujan', 'Hujan reda, udara segar, dan pikiran terasa jauh lebih tenang.', 'calm', 1],
            ['Deadline mendekat', 'Banyak tugas menumpuk dan aku agak cemas soal waktunya.', 'anxious', 2],
        ];

        foreach ($samples as [$title, $content, $mood, $daysAgo]) {
            $user->diaries()->create([
                'title' => $title,
                'content' => $content,
                'mood' => $mood,
                'entry_date' => now()->subDays($daysAgo)->toDateString(),
            ]);
        }
    }
}
