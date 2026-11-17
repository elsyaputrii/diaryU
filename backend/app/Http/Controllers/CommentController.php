<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Models\Diary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CommentController extends Controller
{
    /** Komentar utama (terlama dulu) beserta balasannya. */
    public function index(Request $request, string $id): JsonResponse
    {
        $diary = Diary::where('is_public', true)->findOrFail($id);

        $comments = $diary->comments()
            ->whereNull('parent_id')
            ->with(['user:id,name', 'diary:id,user_id', 'replies.user:id,name', 'replies.diary:id,user_id'])
            ->orderBy('id')
            ->limit(200)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'OK',
            'data' => CommentResource::collection($comments),
        ]);
    }

    public function store(Request $request, string $id): JsonResponse
    {
        $diary = Diary::where('is_public', true)->findOrFail($id);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:500'],
            // Balasan harus ke komentar di catatan yang sama.
            'parent_id' => ['nullable', 'integer', Rule::exists('comments', 'id')->where('diary_id', $diary->id)],
        ], [
            'body.required' => 'Komentar tidak boleh kosong.',
            'body.max' => 'Komentar maksimal 500 karakter.',
            'parent_id.exists' => 'Komentar yang dibalas tidak ditemukan.',
        ]);

        $body = trim($data['body']);
        if ($body === '') {
            return response()->json([
                'success' => false,
                'message' => 'Komentar tidak boleh kosong.',
                'errors' => ['body' => ['Komentar tidak boleh kosong.']],
            ], 422);
        }

        // Hanya satu tingkat: membalas balasan akan ditaruh di bawah komentar utamanya.
        $parentId = null;
        if (! empty($data['parent_id'])) {
            $parent = Comment::findOrFail($data['parent_id']);
            $parentId = $parent->parent_id ?? $parent->id;
        }

        $comment = $diary->comments()->create([
            'user_id' => $request->user()->id,
            'parent_id' => $parentId,
            'body' => $body,
        ]);

        $comment->load(['user:id,name', 'diary:id,user_id']);

        return response()->json([
            'success' => true,
            'message' => 'Komentar terkirim.',
            'data' => new CommentResource($comment),
        ], 201);
    }

    /** Boleh dihapus oleh penulis komentar ATAU pemilik catatan. */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $comment = Comment::with('diary:id,user_id')->findOrFail($id);
        $userId = $request->user()->id;

        if ($comment->user_id !== $userId && $comment->diary->user_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Kamu tidak bisa menghapus komentar ini.',
            ], 403);
        }

        $comment->delete();

        return response()->json(['success' => true, 'message' => 'Komentar dihapus.']);
    }
}
