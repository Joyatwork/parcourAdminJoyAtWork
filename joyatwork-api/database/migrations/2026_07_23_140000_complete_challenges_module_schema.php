<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('challenges', function (Blueprint $table) {
            if (!Schema::hasColumn('challenges', 'description')) $table->text('description')->nullable();
            if (!Schema::hasColumn('challenges', 'category_id')) $table->unsignedBigInteger('category_id')->nullable()->index();
            if (!Schema::hasColumn('challenges', 'type_id')) $table->unsignedBigInteger('type_id')->nullable()->index();
            if (!Schema::hasColumn('challenges', 'intensity_id')) $table->unsignedBigInteger('intensity_id')->nullable()->index();
            if (!Schema::hasColumn('challenges', 'duration')) $table->string('duration')->nullable();
            if (!Schema::hasColumn('challenges', 'participants')) $table->unsignedInteger('participants')->default(0);
            if (!Schema::hasColumn('challenges', 'pack_thematique')) $table->string('pack_thematique')->nullable();
            if (!Schema::hasColumn('challenges', 'image_path')) $table->string('image_path')->nullable();
            if (!Schema::hasColumn('challenges', 'video_path')) $table->string('video_path')->nullable();
        });

        Schema::table('challenge_user', function (Blueprint $table) {
            if (!Schema::hasColumn('challenge_user', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('challenge_id')->index();
            }
        });

        if (!Schema::hasTable('challenge_citations_theme')) {
            Schema::create('challenge_citations_theme', function (Blueprint $table) {
                $table->id();
                $table->string('theme')->unique();
            });
        }

        if (!Schema::hasTable('challenge_citations')) {
            Schema::create('challenge_citations', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('theme_id');
                $table->string('auteur')->nullable();
                $table->text('citation');
                $table->text('benefice')->nullable();
                $table->string('musique_url')->nullable();
                $table->string('video_url')->nullable();
                $table->foreign('theme_id')->references('id')->on('challenge_citations_theme')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('challenge_citations');
        Schema::dropIfExists('challenge_citations_theme');
        Schema::table('challenge_user', fn (Blueprint $table) => $table->dropColumn('user_id'));
        Schema::table('challenges', fn (Blueprint $table) => $table->dropColumn([
            'description', 'category_id', 'type_id', 'intensity_id', 'duration',
            'participants', 'pack_thematique', 'image_path', 'video_path',
        ]));
    }
};
