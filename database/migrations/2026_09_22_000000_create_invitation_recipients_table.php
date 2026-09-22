<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitation_recipients', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('invitation_id')->constrained()->cascadeOnDelete();
            $table->string('display_name');
            $table->string('token', 64)->unique();
            $table->timestamp('archived_at')->nullable();
            $table->timestamps();
            $table->index(['invitation_id', 'archived_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitation_recipients');
    }
};
