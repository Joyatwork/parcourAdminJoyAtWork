<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $requestedColumns = [
            'id',
            'entreprise_id',
            'email',
            'phone',
            'password_hash',
            'first_name',
            'last_name',
            'is_active',
            'created_at',
            'updated_at',
            'name',
            'email_verified_at',
            'password',
            'role',
            'remember_token',
            'birth_date',
            'gender',
            'bio',
            'avatar',
            'preferences',
            'health_goals',
            'status',
            'last_login_at',
            'google_id',
            'provider',
            'avatar_url',
            'role_id',
        ];

        $availableColumns = Schema::getColumnListing('users');
        $selectedColumns = array_values(array_intersect($requestedColumns, $availableColumns));

        if (empty($selectedColumns)) {
            return response()->json([]);
        }

        $users = User::query()
            ->select($selectedColumns)
            ->orderByDesc('id')
            ->get();

        return response()->json($users);
    }

    public function storeAdmin(Request $request): JsonResponse
    {
        $firstName = trim((string) $request->input('first_name', ''));
        $lastName = trim((string) $request->input('last_name', ''));
        $email = strtolower(trim((string) $request->input('email', '')));
        $phone = trim((string) $request->input('phone', ''));
        $password = (string) $request->input('password', '');

        if ($firstName === '' || $lastName === '' || $email === '' || $password === '') {
            return response()->json([
                'message' => 'Prénom, nom, email et mot de passe sont obligatoires.',
            ], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'message' => 'Format email invalide.',
            ], 422);
        }

        if (mb_strlen($password) < 8) {
            return response()->json([
                'message' => 'Le mot de passe doit contenir au moins 8 caractères.',
            ], 422);
        }

        if (User::query()->where('email', $email)->exists()) {
            return response()->json([
                'message' => 'Cet email est déjà utilisé par un autre compte.',
            ], 422);
        }

        $availableColumns = Schema::getColumnListing('users');

        if (in_array('phone', $availableColumns, true) && $phone !== '') {
            $isPhoneUsed = User::query()->where('phone', $phone)->exists();
            if ($isPhoneUsed) {
                return response()->json([
                    'message' => 'Ce numéro de téléphone est déjà utilisé par un autre compte.',
                ], 422);
            }
        }

        $payload = [];

        if (in_array('name', $availableColumns, true)) {
            $payload['name'] = trim($firstName . ' ' . $lastName);
        }

        if (in_array('first_name', $availableColumns, true)) {
            $payload['first_name'] = $firstName;
        }

        if (in_array('last_name', $availableColumns, true)) {
            $payload['last_name'] = $lastName;
        }

        if (in_array('email', $availableColumns, true)) {
            $payload['email'] = $email;
        }

        if (in_array('phone', $availableColumns, true) && $phone !== '') {
            $payload['phone'] = $phone;
        }

        if (in_array('password', $availableColumns, true)) {
            $payload['password'] = $password;
        }

        if (in_array('role', $availableColumns, true)) {
            $payload['role'] = 'admin';
        }

        if (in_array('role_id', $availableColumns, true)) {
            $payload['role_id'] = 1;
        }

        if (in_array('status', $availableColumns, true)) {
            $payload['status'] = 'active';
        }

        if (in_array('is_active', $availableColumns, true)) {
            $payload['is_active'] = 1;
        }

        $user = User::query()->create($payload);

        return response()->json($user->fresh(), 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::query()->findOrFail($id);

        $updatableRequestedColumns = [
            'entreprise_id',
            'email',
            'phone',
            'first_name',
            'last_name',
            'is_active',
            'name',
            'role',
            'birth_date',
            'gender',
            'bio',
            'avatar',
            'status',
            'avatar_url',
            'role_id',
        ];

        $availableColumns = Schema::getColumnListing('users');
        $updatableColumns = array_values(array_intersect($updatableRequestedColumns, $availableColumns));

        if (empty($updatableColumns)) {
            return response()->json([
                'message' => 'Aucune colonne modifiable disponible dans la table users.',
            ], 400);
        }

        $payload = $request->only($updatableColumns);

        if (array_key_exists('email', $payload) && !empty($payload['email'])) {
            $isUsed = User::query()
                ->where('email', $payload['email'])
                ->where('id', '!=', $user->id)
                ->exists();

            if ($isUsed) {
                return response()->json([
                    'message' => 'Cet email est déjà utilisé par un autre compte.',
                ], 422);
            }
        }

        if (array_key_exists('is_active', $payload)) {
            $payload['is_active'] = (int) ((bool) $payload['is_active']);
        }

        $user->fill($payload);
        $user->save();

        return response()->json($user->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::query()->find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Compte introuvable.',
            ], 404);
        }

        try {
            if (Schema::hasTable('sessions') && Schema::hasColumn('sessions', 'user_id')) {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }

            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            $user->delete();

            return response()->json([
                'message' => 'Compte supprimé avec succès.',
            ]);
        } catch (QueryException $exception) {
            if ((string) $exception->getCode() === '23000') {
                $deactivationPayload = [];

                if (Schema::hasColumn('users', 'is_active')) {
                    $deactivationPayload['is_active'] = 0;
                }

                if (Schema::hasColumn('users', 'status')) {
                    $deactivationPayload['status'] = 'inactive';
                }

                if (!empty($deactivationPayload)) {
                    $user->fill($deactivationPayload);
                    $user->save();

                    return response()->json([
                        'action' => 'deactivated',
                        'message' => 'Suppression refusée car ce compte est lié à d\'autres données. Le compte a été désactivé automatiquement.',
                        'user' => $user->fresh(),
                    ]);
                }

                return response()->json([
                    'message' => 'Suppression refusée: ce compte est lié à d\'autres données (rendez-vous, contrats, historiques, etc.).',
                ], 409);
            }

            return response()->json([
                'message' => 'Erreur SQL lors de la suppression du compte.',
            ], 500);
        }
    }
}
