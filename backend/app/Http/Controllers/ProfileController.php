<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json(['success' => true, 'message' => 'OK', 'data' => $request->user()]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json(['success' => true, 'message' => 'Profil berhasil diperbarui.', 'data' => $user]);
    }

    public function updatePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['password' => $request->validated('password')]);

        // Cabut token di perangkat lain, token yang sedang dipakai tetap hidup.
        $current = $request->attributes->get('api_token');
        $user->apiTokens()->when($current, fn ($q) => $q->where('id', '!=', $current->id))->delete();

        return response()->json(['success' => true, 'message' => 'Password berhasil diubah.']);
    }
}
