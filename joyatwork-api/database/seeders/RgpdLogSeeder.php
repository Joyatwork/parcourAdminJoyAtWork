<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RgpdLog;
use Carbon\Carbon;

class RgpdLogSeeder extends Seeder
{
    public function run()
    {
        $examples = [
            [
                'action' => 'UPLOAD_LEGAL_DOC',
                'user_id' => null,
                'admin_email' => 'admin@joyatwork.test',
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2)
            ],
            [
                'action' => 'UPDATE_REGISTRY',
                'user_id' => null,
                'admin_email' => 'admin@joyatwork.test',
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay()
            ]
        ];

        foreach ($examples as $row) {
            RgpdLog::create($row);
        }
    }
}
