<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DiaryController;
use App\Http\Controllers\DiaryImageController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RepostController;
use Illuminate\Support\Facades\Route;

// Publik (dibatasi 10 permintaan/menit per IP agar tidak bisa di-brute-force)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Perlu token Bearer
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', [ProfileController::class, 'show']);
    Route::put('/user/profile', [ProfileController::class, 'update']);
    Route::put('/user/password', [ProfileController::class, 'updatePassword']);

    Route::apiResource('diaries', DiaryController::class);

    // Gambar catatan (hanya pemilik)
    Route::post('/diaries/{id}/images', [DiaryImageController::class, 'store']);
    Route::delete('/diaries/{id}/images/{imageId}', [DiaryImageController::class, 'destroy']);

    // Jelajah + interaksi sosial (hanya untuk catatan publik)
    Route::get('/feed', [FeedController::class, 'index']);

    Route::post('/diaries/{id}/like', [LikeController::class, 'store']);
    Route::delete('/diaries/{id}/like', [LikeController::class, 'destroy']);

    Route::post('/diaries/{id}/repost', [RepostController::class, 'store']);
    Route::delete('/diaries/{id}/repost', [RepostController::class, 'destroy']);

    Route::get('/diaries/{id}/comments', [CommentController::class, 'index']);
    Route::post('/diaries/{id}/comments', [CommentController::class, 'store'])->middleware('throttle:20,1');
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
});
