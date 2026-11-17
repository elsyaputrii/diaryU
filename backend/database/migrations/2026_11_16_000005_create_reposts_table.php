<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reposts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('diary_id')->constrained()->cascadeOnDelete();
            $table->string('quote', 280)->nullable(); // diisi = kutip (quote repost)
            $table->timestamps();

            $table->unique(['user_id', 'diary_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reposts');
    }
};
