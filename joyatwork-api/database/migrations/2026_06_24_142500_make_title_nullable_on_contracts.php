<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contracts')) {
            Schema::table('contracts', function (Blueprint $table) {
                if (Schema::hasColumn('contracts', 'title')) {
                    $table->string('title')->nullable()->change();
                }
                if (Schema::hasColumn('contracts', 'start_date')) {
                    $table->date('start_date')->nullable()->change();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('contracts')) {
            Schema::table('contracts', function (Blueprint $table) {
                if (Schema::hasColumn('contracts', 'title')) {
                    $table->string('title')->nullable(false)->change();
                }
                if (Schema::hasColumn('contracts', 'start_date')) {
                    $table->date('start_date')->nullable(false)->change();
                }
            });
        }
    }
};
