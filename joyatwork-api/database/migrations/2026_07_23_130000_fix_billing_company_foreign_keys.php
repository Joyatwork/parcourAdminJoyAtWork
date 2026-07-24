<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = ['wallets', 'orders', 'credits', 'usages', 'invoices'];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropForeign($tableName.'_entreprise_id_foreign');
                $table->foreign('entreprise_id')
                    ->references('id')
                    ->on('entreprises')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $table->dropForeign($tableName.'_entreprise_id_foreign');
                $table->foreign('entreprise_id')
                    ->references('id')
                    ->on('companies')
                    ->cascadeOnDelete();
            });
        }
    }
};
