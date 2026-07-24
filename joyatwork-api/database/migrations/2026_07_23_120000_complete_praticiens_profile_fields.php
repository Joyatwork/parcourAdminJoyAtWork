<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('praticiens', function (Blueprint $table) {
            if (!Schema::hasColumn('praticiens', 'email')) {
                $table->string('email')->nullable()->unique()->after('last_name');
            }
            if (!Schema::hasColumn('praticiens', 'status')) {
                $table->string('status', 30)->default('active')->after('is_verified');
            }
            if (!Schema::hasColumn('praticiens', 'suspended_at')) {
                $table->timestamp('suspended_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('praticiens', 'suspension_reason')) {
                $table->string('suspension_reason')->nullable()->after('suspended_at');
            }
            if (!Schema::hasColumn('praticiens', 'certif_iprp_path')) {
                $table->string('certif_iprp_path')->nullable()->after('suspension_reason');
            }
            if (!Schema::hasColumn('praticiens', 'certif_iprp_verified')) {
                $table->boolean('certif_iprp_verified')->default(false)->after('certif_iprp_path');
            }
            if (!Schema::hasColumn('praticiens', 'experience_years')) {
                $table->unsignedSmallInteger('experience_years')->default(0)->after('bio');
            }
            if (!Schema::hasColumn('praticiens', 'rating')) {
                $table->decimal('rating', 2, 1)->default(0)->after('experience_years');
            }
            if (!Schema::hasColumn('praticiens', 'certifications')) {
                $table->text('certifications')->nullable()->after('rating');
            }
        });
    }

    public function down(): void
    {
        Schema::table('praticiens', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropColumn([
                'email', 'status', 'suspended_at', 'suspension_reason',
                'certif_iprp_path', 'certif_iprp_verified',
                'experience_years', 'rating', 'certifications',
            ]);
        });
    }
};
