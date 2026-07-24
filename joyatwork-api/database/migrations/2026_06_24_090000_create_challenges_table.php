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
        if (Schema::hasTable('challenges')) {
            return;
        }

        Schema::create('challenges', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();

            $table->foreignId('category_id')->nullable()->constrained('challenge_category')->nullOnDelete();
            $table->foreignId('type_id')->nullable()->constrained('challenge_type')->nullOnDelete();
            $table->foreignId('intensity_id')->nullable()->constrained('challenge_intensity')->nullOnDelete();

            $table->unsignedInteger('points')->default(0);
            $table->unsignedInteger('duration')->nullable();
            $table->string('objective')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('participants')->default(0);
            $table->float('completion_rate', 5, 2)->default(0);
            $table->string('pack_thematique')->nullable();
            $table->foreignId('pack_id')->nullable()->constrained('challenge_packs')->nullOnDelete();

            $table->string('image_path')->nullable();
            $table->string('video_path')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('challenges');
    }
};
