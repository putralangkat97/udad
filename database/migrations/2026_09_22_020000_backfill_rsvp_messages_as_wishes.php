<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('rsvps')
            ->whereNotNull('message')
            ->orderBy('id')
            ->each(function (object $rsvp): void {
                $message = trim((string) $rsvp->message);

                if ($message === '' || DB::table('wishes')->where('rsvp_id', $rsvp->id)->exists()) {
                    return;
                }

                DB::table('wishes')->insert([
                    'invitation_key' => $rsvp->invitation_key,
                    'rsvp_id' => $rsvp->id,
                    'name' => $rsvp->name,
                    'message' => $message,
                    'status' => 'pending',
                    'created_at' => $rsvp->created_at,
                    'updated_at' => $rsvp->updated_at,
                ]);
            });
    }

    /**
     * The migrated Wishes contain guest content and are intentionally retained
     * if this data migration is rolled back.
     */
    public function down(): void {}
};
