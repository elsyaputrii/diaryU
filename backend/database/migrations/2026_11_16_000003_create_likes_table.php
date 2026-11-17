<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('diary_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            // Satu user hanya bisa like satu kali per catatan.
            $table->unique(['user_id', 'diary_id']);
            $table->index('diary_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};
