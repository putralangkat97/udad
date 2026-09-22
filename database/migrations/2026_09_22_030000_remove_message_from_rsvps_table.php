<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rsvps', function (Blueprint $table) {
            $table->dropColumn('message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rsvps', function (Blueprint $table) {
            $table->text('message')->nullable();
        });

        DB::table('wishes')
            ->whereNotNull('rsvp_id')
            ->orderBy('id')
            ->each(function (object $wish): void {
                DB::table('rsvps')
                    ->where('id', $wish->rsvp_id)
                    ->update(['message' => $wish->message]);
            });
    }
};
