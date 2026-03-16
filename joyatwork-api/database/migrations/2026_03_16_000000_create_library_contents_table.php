<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('library_contents')) {
            Schema::create('library_contents', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('type', 50);
                $table->string('format', 50)->nullable();
                $table->unsignedInteger('duration')->default(0);
                $table->json('thematic')->nullable();
                $table->json('tags')->nullable();
                $table->string('status', 30)->default('draft');
                $table->string('language', 20)->default('fr');
                $table->string('visibility', 40)->default('all');
                $table->string('intensity', 20)->default('léger');
                $table->string('level', 20)->nullable();
                $table->string('author')->default('Administrateur');
                $table->timestamp('published_at')->nullable();
                $table->timestamp('scheduled_at')->nullable();
                $table->text('thumbnail')->nullable();
                $table->text('file_url')->nullable();
                $table->json('annex_files')->nullable();
                $table->json('companies')->nullable();
                $table->boolean('practitioner_only')->default(false);
                $table->unsignedInteger('views')->default(0);
                $table->decimal('completion_rate', 5, 2)->default(0);
                $table->unsignedInteger('average_watch_time')->nullable();
                $table->decimal('rating', 3, 2)->nullable();
                $table->json('feedback')->nullable();
                $table->json('collections')->nullable();
                $table->boolean('is_pinned')->default(false);
                $table->boolean('is_hot_content')->default(false);
                $table->boolean('has_quiz')->default(false);
                $table->text('practitioner_guide')->nullable();
                $table->json('customization')->nullable();
                $table->json('keywords')->nullable();
                $table->unsignedSmallInteger('search_boost')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('library_contents');
    }
};
