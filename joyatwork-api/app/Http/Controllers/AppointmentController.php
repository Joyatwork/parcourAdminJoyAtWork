<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Appointment;
use App\Models\Practitioner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppointmentController extends Controller
{
    /**
     * Tous les rendez-vous
     */
    public function index()
    {
        $appointments = Appointment::with(['practitioner', 'employee.user'])
            ->orderBy('scheduled_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $appointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'practitioner_name' => $appointment->practitioner ? 
                        $appointment->practitioner->first_name . ' ' . $appointment->practitioner->last_name : 
                        'Praticien inconnu',
                    'practitioner_email' => $appointment->practitioner ? $appointment->practitioner->email  : 'Email inconnu',
                    'practitioner_speciality' => $appointment->practitioner ? $appointment->practitioner->specialty  : 'Speciality inconnu',
                    'practitioner_phone' => $appointment->practitioner ? $appointment->practitioner->phone  : 'Phone inconnu',
                    'practitioner_country' => $appointment->practitioner ? $appointment->practitioner->country  : 'Pays inconnu',
                    'practitioner_city' => $appointment->practitioner ? $appointment->practitioner->city  : 'City inconnu',
                    'practitioner_availability' => $appointment->practitioner ? $appointment->practitioner->availability  : 'Availability inconnu',
                    'practitioner_certifications' => $appointment->practitioner ? $appointment->practitioner->certifications  : 'certifications inconnu',
                    'practitioner_experience' => $appointment->practitioner ? $appointment->practitioner->experience_years  : 'Expercience inconnu',
                    'practitioner_rating' => $appointment->practitioner ? $appointment->practitioner->rating  : null,

                    

                    'client_name' => $appointment->employee->user->name,
                    'client_email' => $appointment->employee->user->email,
                    
                    'scheduled_at' => $appointment->scheduled_at,
                    'duration' => $appointment->duration,
                    'status' => $appointment->status,
                    'mode' => $appointment->mode ?? 'présentiel',
                    'notes' => $appointment->notes,
                ];
            })
        ]);
    }
    public function index2()
    {
        $appointments = Appointment::orderBy('scheduled_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

    /**
     * Rendez-vous par praticien
     */
    public function getAppointmentsByPractitioner($id)
{
    $appointments = DB::select("
        SELECT 
            a.id,
            a.scheduled_at,
            a.duration,
            a.status,
            a.type,
            a.mode,
            a.notes,
            u.name as client_name,
            u.email as client_email
        FROM appointments a
        LEFT JOIN employees e ON e.id = a.employee_id
        LEFT JOIN users u ON u.id = e.user_id
        WHERE a.practitioner_id = ?
        ORDER BY a.scheduled_at ASC
    ", [$id]);

    return response()->json([
        'success' => true,
        'data' => array_map(function ($appointment) {
            return [
                'id' => $appointment->id,
                'scheduled_at' => $appointment->scheduled_at,
                'duration' => $appointment->duration,
                'status' => $appointment->status,
                'type' => $appointment->type,
                'mode' => $appointment->mode ?? 'présentiel',
                'notes' => $appointment->notes,
                'client_name' => $appointment->client_name,
                'client_email' => $appointment->client_email,
            ];
        }, $appointments)
    ]);
}

     public function getAppointmentsByPractitioner3($id)
     {
         $appointments = Appointment::where('practitioner_id', $id)
             ->with(['employee.user'])
             ->orderBy('scheduled_at', 'asc')
             ->get()
             ->map(function ($appointment) {
                 return [
                     'id' => $appointment->id,
                     'scheduled_at' => $appointment->scheduled_at,
                     'duration' => $appointment->duration,
                     'status' => $appointment->status,
                     'type' => $appointment->type,
                     'mode' => $appointment->mode ?? 'présentiel',
                     'notes' => $appointment->notes,
                     'client_name' => $appointment->employee->user->name,
                     'client_email' => $appointment->employee && $appointment->employee->user ? 
                         $appointment->employee->user->email : null,
                 ];
             });
 
         return response()->json([
             'success' => true,
             'data' => $appointments
         ]);
     }

    public function getAppointmentsByPractitioner2($id)
    {
        $appointments = Appointment::where('practitioner_id', $id)
            ->orderBy('scheduled_at', 'asc')
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'scheduled_at' => $a->scheduled_at,
                    'duration' => $a->duration,
                    'status' => $a->status,
                    'type' => $a->type,
                    'mode' => $a->mode ?? 'présentiel',
                    'notes' => $a->notes,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $appointments
        ]);
    }

}