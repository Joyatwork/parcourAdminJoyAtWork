<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class AuthController extends Controller
{
    private const DEFAULT_ADMIN_EMAIL = 'rachid.ouiz@hotmail.com';
    private const DEFAULT_ADMIN_PASSWORD = 'rachidouiz';
    private const DEFAULT_ADMIN_FIRST_NAME = 'Rachid';
    private const DEFAULT_ADMIN_LAST_NAME = 'Ouiz';

    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $this->ensureDefaultAdminAccount();

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'Identifiants invalides.',
            ], 401);
        }

        $hasRoleColumn = Schema::hasColumn('users', 'role');
        $hasRoleIdColumn = Schema::hasColumn('users', 'role_id');
        $hasStatusColumn = Schema::hasColumn('users', 'status');
        $hasIsActiveColumn = Schema::hasColumn('users', 'is_active');
        $isDefaultAdmin = strtolower($user->email) === strtolower(self::DEFAULT_ADMIN_EMAIL);
        $isAdminByRole = $hasRoleColumn && strtolower((string) $user->role) === 'admin';
        $isAdminByRoleId = $hasRoleIdColumn && (int) $user->role_id === 1;

        if (!$isDefaultAdmin && !$isAdminByRole && !$isAdminByRoleId) {
            return response()->json([
                'message' => 'Accès refusé : cette interface est réservée aux administrateurs.',
            ], 403);
        }

        $statusValue = strtolower((string) ($user->status ?? ''));
        $isBlockedByStatus = $hasStatusColumn && in_array($statusValue, ['inactive', 'suspended'], true);
        $isBlockedByActiveFlag = $hasIsActiveColumn && (int) $user->is_active === 0;

        if ($isBlockedByStatus || $isBlockedByActiveFlag) {
            return response()->json([
                'message' => 'Ce compte est inactif. Connexion refusée.',
            ], 403);
        }

        $token = $user->createToken('joyatwork-admin')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name ?: self::DEFAULT_ADMIN_FIRST_NAME,
                'last_name' => $user->last_name ?: self::DEFAULT_ADMIN_LAST_NAME,
                'email' => $user->email,
                'entreprise_id' => null,
                'status' => $user->status ?? null,
                'roles' => ['admin'],
            ],
        ]);
    }

    private function ensureDefaultAdminAccount(): void
    {
        $admin = User::where('email', self::DEFAULT_ADMIN_EMAIL)->first();

        if (!$admin) {
            $payload = [
                'name' => self::DEFAULT_ADMIN_FIRST_NAME . ' ' . self::DEFAULT_ADMIN_LAST_NAME,
                'first_name' => self::DEFAULT_ADMIN_FIRST_NAME,
                'last_name' => self::DEFAULT_ADMIN_LAST_NAME,
                'email' => self::DEFAULT_ADMIN_EMAIL,
                'password' => Hash::make(self::DEFAULT_ADMIN_PASSWORD),
                'email_verified_at' => now(),
            ];

            if (Schema::hasColumn('users', 'role')) {
                $payload['role'] = 'admin';
            }

            if (Schema::hasColumn('users', 'role_id')) {
                $payload['role_id'] = 1;
            }

            if (Schema::hasColumn('users', 'status')) {
                $payload['status'] = 'active';
            }

            if (Schema::hasColumn('users', 'is_active')) {
                $payload['is_active'] = 1;
            }

            User::create($payload);

            return;
        }

        if (!Hash::check(self::DEFAULT_ADMIN_PASSWORD, $admin->password)) {
            $admin->password = Hash::make(self::DEFAULT_ADMIN_PASSWORD);
        }

        $admin->name = self::DEFAULT_ADMIN_FIRST_NAME . ' ' . self::DEFAULT_ADMIN_LAST_NAME;
        $admin->first_name = self::DEFAULT_ADMIN_FIRST_NAME;
        $admin->last_name = self::DEFAULT_ADMIN_LAST_NAME;

        if (Schema::hasColumn('users', 'role')) {
            $admin->role = 'admin';
        }

        if (Schema::hasColumn('users', 'role_id')) {
            $admin->role_id = 1;
        }

        if (Schema::hasColumn('users', 'status')) {
            $admin->status = 'active';
        }

        if (Schema::hasColumn('users', 'is_active')) {
            $admin->is_active = 1;
        }

        $admin->save();
    }
}
