<?php

namespace App\Http\Controllers;

use App\Models\Diagnostic;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DiagnosticController extends Controller
{
    public function get_company_health_per_month(): JsonResponse
    {
        $results = DB::select(<<<'SQL'
            SELECT
                c.company_id AS entreprise_id,
                e.name AS company_name,
                c.month,
                CAST(AVG(c.stress_level) AS DECIMAL(5,1)) AS avg_stress,
                CAST(AVG(c.energy_level) AS DECIMAL(5,1)) AS avg_energy,
                CAST(AVG(c.avg_sleep) AS DECIMAL(5,1)) AS avg_sleep,
                CAST(AVG(c.avg_mood) AS DECIMAL(5,1)) AS avg_mood,
                CAST(AVG(c.avg_pressure) AS DECIMAL(5,1)) AS avg_pressure
            FROM (
                SELECT
                    COALESCE(
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.company_id')) AS UNSIGNED),
                        u.entreprise_id
                    ) AS company_id,
                    COALESCE(
                        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.period')), 'null'),
                        DATE_FORMAT(d.created_at, '%Y-%m')
                    ) AS month,
                    CAST(d.stress_level AS DECIMAL(5,2)) AS stress_level,
                    CAST(d.energy_level AS DECIMAL(5,2)) AS energy_level,
                    COALESCE(
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.avg_sleep')) AS DECIMAL(5,2)),
                        CASE
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Excellent%' THEN 10
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Bon%' THEN 8
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Moyen%' THEN 6
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Difficile%' THEN 4
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Très mauvais%' THEN 2
                            ELSE NULL
                        END
                    ) AS avg_sleep,
                    COALESCE(
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.avg_mood')) AS DECIMAL(5,2)),
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.mood_emoji')) AS UNSIGNED) * 2
                    ) AS avg_mood,
                    CAST(d.work_pressure AS DECIMAL(5,2)) AS avg_pressure
                FROM diagnostics d
                LEFT JOIN users u ON u.id = d.user_id
                WHERE
                    JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.creation_type')) = 'company_diagnostic'
                    OR d.scope = 'company'
            ) c
            JOIN entreprises e ON e.id = c.company_id
            GROUP BY c.company_id, e.name, c.month
            ORDER BY c.month DESC
        SQL);
        return response()->json($results);
    }

    public function get_users_health_per_month(): JsonResponse
    {
        $results = DB::select(<<<'SQL'
            SELECT
                u.id AS user_id,
                u.first_name,
                u.last_name,
                COALESCE(
                    NULLIF(TRIM(CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, ''))), ''),
                    NULLIF(u.name, ''),
                    CONCAT('Utilisateur #', u.id)
                ) AS display_name,
                COALESCE(e.name, 'Sans entreprise') AS company_name,
                m.company_id AS entreprise_id,
                m.month,
                CAST(AVG(m.stress_level) AS DECIMAL(5,1)) AS avg_stress,
                CAST(AVG(m.energy_level) AS DECIMAL(5,1)) AS avg_energy,
                CAST(AVG(m.avg_sleep) AS DECIMAL(5,1)) AS avg_sleep,
                CAST(AVG(m.avg_mood) AS DECIMAL(5,1)) AS avg_mood,
                CAST(AVG(m.avg_pressure) AS DECIMAL(5,1)) AS avg_pressure
            FROM (
                SELECT
                    d.user_id,
                    COALESCE(
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.company_id')) AS UNSIGNED),
                        u.entreprise_id
                    ) AS company_id,
                    COALESCE(
                        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.period')), 'null'),
                        DATE_FORMAT(d.created_at, '%Y-%m')
                    ) AS month,
                    CAST(d.stress_level AS DECIMAL(5,2)) AS stress_level,
                    CAST(d.energy_level AS DECIMAL(5,2)) AS energy_level,
                    COALESCE(
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.avg_sleep')) AS DECIMAL(5,2)),
                        CASE
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Excellent%' THEN 10
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Bon%' THEN 8
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Moyen%' THEN 6
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Difficile%' THEN 4
                            WHEN JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.sleep_quality')) LIKE 'Très mauvais%' THEN 2
                            ELSE NULL
                        END
                    ) AS avg_sleep,
                    COALESCE(
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.avg_mood')) AS DECIMAL(5,2)),
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.mood_emoji')) AS UNSIGNED) * 2
                    ) AS avg_mood,
                    CAST(d.work_pressure AS DECIMAL(5,2)) AS avg_pressure
                FROM diagnostics d
                LEFT JOIN users u ON u.id = d.user_id
                WHERE
                    JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.creation_type')) = 'user_diagnostic'
                    OR d.scope = 'user'
            ) m
            JOIN users u ON u.id = m.user_id
            LEFT JOIN entreprises e ON e.id = m.company_id
            GROUP BY u.id, u.first_name, u.last_name, u.name, e.name, m.company_id, m.month
            ORDER BY m.month DESC
        SQL);
        return response()->json($results);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'creation_type' => 'required|string|in:questionnaire,user_diagnostic,company_diagnostic',
            'user_id' => 'nullable|integer|exists:users,id',
            'company_id' => 'nullable|integer|exists:entreprises,id',
            'questionnaire' => 'nullable|string|max:255',
            'scope' => 'nullable|string|max:20',
            'stress_level' => 'nullable|integer|min:0|max:10',
            'energy_level' => 'nullable|integer|min:0|max:10',
            'work_pressure' => 'nullable|integer|min:0|max:10',
            'completed_at' => 'nullable|date',
            'answers' => 'nullable|array',
        ])->validate();

        $creationType = $validated['creation_type'];
        $questionnaire = trim((string) ($validated['questionnaire'] ?? ''));

        if ($questionnaire === '' && $creationType === 'questionnaire') {
            return response()->json([
                'message' => 'Le nom du questionnaire est requis.',
            ], 422);
        }

        if ($questionnaire === '') {
            $questionnaireMap = [
                'user_diagnostic' => 'Diagnostic utilisateur',
                'company_diagnostic' => 'Diagnostic entreprise',
            ];
            $questionnaire = $questionnaireMap[$creationType] ?? 'Diagnostic';
        }

        if ($creationType === 'user_diagnostic' && empty($validated['user_id'])) {
            return response()->json([
                'message' => 'Un utilisateur est requis pour ce type de création.',
            ], 422);
        }

        if ($creationType === 'company_diagnostic' && empty($validated['company_id'])) {
            return response()->json([
                'message' => 'Une entreprise est requise pour ce type de création.',
            ], 422);
        }

        $resolvedUserId = $validated['user_id'] ?? null;
        $resolvedCompanyId = $validated['company_id'] ?? null;

        if ($creationType === 'user_diagnostic' && $resolvedUserId !== null) {
            $user = User::query()->find($resolvedUserId);
            if ($resolvedCompanyId === null) {
                $resolvedCompanyId = $user?->entreprise_id;
            }
        }

        if ($creationType === 'company_diagnostic' && $resolvedUserId === null && $resolvedCompanyId !== null) {
            $resolvedUserId = User::query()
                ->where('entreprise_id', $resolvedCompanyId)
                ->value('id');
        }

        if ($creationType === 'company_diagnostic' && $resolvedCompanyId === null) {
            return response()->json([
                'message' => 'Une entreprise est requise pour enregistrer ce diagnostic.',
            ], 422);
        }

        if ($resolvedUserId === null) {
            $resolvedUserId = User::query()->value('id');
        }

        if ($resolvedUserId === null) {
            return response()->json([
                'message' => 'Aucun utilisateur disponible pour créer ce diagnostic.',
            ], 422);
        }

        $baseAnswers = is_array($validated['answers'] ?? null) ? $validated['answers'] : [];
        $answers = array_merge($baseAnswers, [
            'creation_type' => $creationType,
            'company_id' => $resolvedCompanyId,
            'questionnaire' => $questionnaire,
        ]);

        $scopeMap = [
            'questionnaire' => 'quest',
            'user_diagnostic' => 'user',
            'company_diagnostic' => 'company',
        ];
        $scope = substr((string) ($validated['scope'] ?? $scopeMap[$creationType]), 0, 10);

        $stressLevel = $validated['stress_level'] ?? 0;
        $energyLevel = $validated['energy_level'] ?? 0;
        $workPressure = $validated['work_pressure'] ?? 0;

        $diagnostic = Diagnostic::create([
            'user_id' => $resolvedUserId,
            'scope' => $scope,
            'stress_level' => $stressLevel,
            'energy_level' => $energyLevel,
            'work_pressure' => $workPressure,
            'answers' => $answers,
            'completed_at' => $validated['completed_at'] ?? now(),
        ]);

        return response()->json($diagnostic, 201);
    }

    public function delete_company_health_entry(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'company_id' => 'required|integer|min:1',
            'month' => ['required', 'regex:/^\d{4}-\d{2}$/'],
        ])->validate();

        $deleted = DB::affectingStatement(
            <<<'SQL'
                DELETE d
                FROM diagnostics d
                LEFT JOIN users u ON u.id = d.user_id
                WHERE
                    (
                        JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.creation_type')) = 'company_diagnostic'
                        OR d.scope = 'company'
                    )
                    AND COALESCE(
                        CAST(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.company_id')) AS UNSIGNED),
                        u.entreprise_id
                    ) = ?
                    AND COALESCE(
                        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.period')), 'null'),
                        DATE_FORMAT(d.created_at, '%Y-%m')
                    ) = ?
            SQL,
            [
                (int) $validated['company_id'],
                $validated['month'],
            ]
        );

        return response()->json([
            'message' => 'Entrée entreprise supprimée.',
            'deleted_count' => $deleted,
        ]);
    }

    public function delete_user_health_entry(Request $request): JsonResponse
    {
        $validated = Validator::make($request->all(), [
            'user_id' => 'required|integer|min:1',
            'month' => ['required', 'regex:/^\d{4}-\d{2}$/'],
        ])->validate();

        $deleted = DB::affectingStatement(
            <<<'SQL'
                DELETE d
                FROM diagnostics d
                WHERE
                    d.user_id = ?
                    AND (
                        JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.creation_type')) = 'user_diagnostic'
                        OR d.scope = 'user'
                    )
                    AND COALESCE(
                        NULLIF(JSON_UNQUOTE(JSON_EXTRACT(d.answers, '$.period')), 'null'),
                        DATE_FORMAT(d.created_at, '%Y-%m')
                    ) = ?
            SQL,
            [
                (int) $validated['user_id'],
                $validated['month'],
            ]
        );

        return response()->json([
            'message' => 'Entrée utilisateur supprimée.',
            'deleted_count' => $deleted,
        ]);
    }
}