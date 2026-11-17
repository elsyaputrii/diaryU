<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diary_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diary_id')->constrained()->cascadeOnDelete();
            $table->string('path'); // relatif terhadap disk "public"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diary_images');
    }
};
