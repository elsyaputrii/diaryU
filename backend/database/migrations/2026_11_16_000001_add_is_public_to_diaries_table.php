<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diaries', function (Blueprint $table) {
            // Semua catatan lama otomatis privat (false). Hanya yang sengaja dibagikan yang tampil di Jelajah.
            $table->boolean('is_public')->default(false)->after('entry_date');
            // Kapan catatan dibagikan: dipakai mengurutkan Jelajah (catatan lama yang baru dipublikasikan tetap muncul di atas).
            $table->timestamp('published_at')->nullable()->after('is_public');
            $table->index(['is_public', 'published_at']);
        });
    }

    public function down(): void
    {
        Schema::table('diaries', function (Blueprint $table) {
            $table->dropIndex(['is_public', 'published_at']);
            $table->dropColumn(['is_public', 'published_at']);
        });
    }
};
