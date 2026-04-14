<?php

namespace App\Http\Controllers;

use App\Models\CompanyAppointment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CompanyAppointmentController extends Controller
{
    public function index()
    {
        $appointments = CompanyAppointment::query()
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $appointments->map(function (CompanyAppointment $appointment) {
                $scheduled = $appointment->scheduled_at ? Carbon::parse($appointment->scheduled_at) : null;

                return [
                    'id' => $appointment->id,
                    'entreprise_id' => $appointment->entreprise_id,
                    'scheduled_at' => $appointment->scheduled_at,
                    'date' => $scheduled ? $scheduled->format('Y-m-d') : null,
                    'time' => $scheduled ? $scheduled->format('H:i') : null,
                    'details' => $appointment->notes ?? '',
                    'status' => $appointment->status,
                ];
            }),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'entreprise_id' => ['required', 'integer', 'exists:entreprises,id'],
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'details' => ['nullable', 'string', 'max:2000'],
        ]);

        $scheduledAt = Carbon::createFromFormat('Y-m-d H:i', $data['date'] . ' ' . $data['time']);

        $appointment = CompanyAppointment::create([
            'entreprise_id' => $data['entreprise_id'],
            'scheduled_at' => $scheduledAt,
            'status' => 'scheduled',
            'notes' => $data['details'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $appointment->id,
                'entreprise_id' => $appointment->entreprise_id,
                'scheduled_at' => $appointment->scheduled_at,
                'date' => $scheduledAt->format('Y-m-d'),
                'time' => $scheduledAt->format('H:i'),
                'details' => $appointment->notes ?? '',
                'status' => $appointment->status,
            ],
        ], 201);
    }

    public function update(Request $request, CompanyAppointment $appointment)
    {
        $data = $request->validate([
            'date' => ['nullable', 'date_format:Y-m-d'],
            'time' => ['nullable', 'date_format:H:i'],
            'details' => ['nullable', 'string', 'max:2000'],
            'status' => ['nullable', 'string'],
        ]);

        $date = $data['date'] ?? ($appointment->scheduled_at ? Carbon::parse($appointment->scheduled_at)->format('Y-m-d') : null);
        $time = $data['time'] ?? ($appointment->scheduled_at ? Carbon::parse($appointment->scheduled_at)->format('H:i') : null);

        if ($date && $time) {
            $appointment->scheduled_at = Carbon::createFromFormat('Y-m-d H:i', $date . ' ' . $time);
        }

        if (array_key_exists('details', $data)) {
            $appointment->notes = $data['details'];
        }

        if (!empty($data['status'])) {
            $appointment->status = $data['status'];
        }

        $appointment->save();

        $scheduled = $appointment->scheduled_at ? Carbon::parse($appointment->scheduled_at) : null;

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $appointment->id,
                'entreprise_id' => $appointment->entreprise_id,
                'scheduled_at' => $appointment->scheduled_at,
                'date' => $scheduled ? $scheduled->format('Y-m-d') : null,
                'time' => $scheduled ? $scheduled->format('H:i') : null,
                'details' => $appointment->notes ?? '',
                'status' => $appointment->status,
            ],
        ]);
    }

    public function destroy(CompanyAppointment $appointment)
    {
        $appointment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous supprimé.',
        ]);
    }
}
