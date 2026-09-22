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
        Schema::table('rsvps', function (Blueprint $table) {
            $table->foreignId('recipient_id')
                ->nullable()
                ->after('guest_count')
                ->constrained('invitation_recipients')
                ->nullOnDelete();
        });

        Schema::table('wishes', function (Blueprint $table) {
            $table->foreignId('rsvp_id')
                ->nullable()
                ->after('invitation_key')
                ->constrained('rsvps')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wishes', function (Blueprint $table) {
            $table->dropForeign(['rsvp_id']);
            $table->dropColumn('rsvp_id');
        });

        Schema::table('rsvps', function (Blueprint $table) {
            $table->dropForeign(['recipient_id']);
            $table->dropColumn('recipient_id');
        });
    }
};
