<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('praticiens', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->after('bio');
            $table->string('status')->default('active')->after('is_verified');
            $table->timestamp('suspended_at')->nullable()->after('status');
            $table->text('suspension_reason')->nullable()->after('suspended_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('praticiens', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'status', 'suspended_at', 'suspension_reason']);
        });
    }
};
