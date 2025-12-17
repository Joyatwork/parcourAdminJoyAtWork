$ErrorActionPreference = "Stop"

$MigrationName = "$(Get-Date -Format "yyyy_MM_dd_HHmmss")_create_companies_table.php"
$MigrationPath = "..\joyatwork-api\database\migrations\$MigrationName"

$Content = @'
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sector')->nullable();
            $table->string('location')->nullable();
            $table->integer('employees')->default(0);
            $table->string('phone')->nullable();
            $table->string('email')->unique();
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->json('wellness_programs')->nullable();
            $table->string('status')->default('En négociation');
            $table->decimal('contract_value', 10, 2)->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
'@

Set-Content -Path $MigrationPath -Value $Content
Write-Host "Created migration: $MigrationPath" -ForegroundColor Green

Write-Host "Running migration..." -ForegroundColor Yellow
Set-Location "..\joyatwork-api"
php artisan migrate --force
Write-Host "Migration completed!" -ForegroundColor Green
