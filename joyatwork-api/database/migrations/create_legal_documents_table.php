<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('legal_documents', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('file_url');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('legal_documents');
    }
};
