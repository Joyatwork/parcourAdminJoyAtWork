<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = \App\Models\Appointment::with('practitioner')
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'user_id' => $appointment->employee_id, // Mapping employee_id to user_id for frontend compatibility
                    'specialist_id' => $appointment->practitioner_id,
                    'scheduled_at' => $appointment->scheduled_at,
                    'type' => $appointment->mode,
                    'status' => $appointment->status,
                    'price_cents' => $appointment->price_cents,
                    'price_euros' => $appointment->price_euros,
                    'notes' => $appointment->notes,
                    'specialist_name' => $appointment->practitioner ?
                        $appointment->practitioner->first_name . ' ' . $appointment->practitioner->last_name :
                        'Praticien inconnu',
                    'specialist_email' => $appointment->practitioner ? $appointment->practitioner->email : null,
                    'specialist_phone' => $appointment->practitioner ? $appointment->practitioner->phone : null,
                    'date' => $appointment->scheduled_at ? $appointment->scheduled_at->format('Y-m-d') : null,
                    'time' => $appointment->scheduled_at ? $appointment->scheduled_at->format('H:i') : null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }
}
