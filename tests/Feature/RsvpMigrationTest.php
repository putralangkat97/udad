<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

test('rsvp message backfill is complete and idempotent', function () {
    $connection = 'rsvp_migration_test';
    $originalDefault = config('database.default');

    config([
        'database.default' => $connection,
        "database.connections.{$connection}" => [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ]);
    DB::purge($connection);

    try {
        $schema = Schema::connection($connection);
        $schema->create('rsvps', function (Blueprint $table) {
            $table->id();
            $table->string('invitation_key');
            $table->string('name');
            $table->string('attendance');
            $table->unsignedInteger('guest_count')->nullable();
            $table->text('message')->nullable();
            $table->timestamps();
        });
        $schema->create('wishes', function (Blueprint $table) {
            $table->id();
            $table->string('invitation_key');
            $table->unsignedBigInteger('rsvp_id')->nullable();
            $table->string('name');
            $table->text('message');
            $table->string('status');
            $table->timestamps();
        });

        $now = now();
        DB::table('rsvps')->insert([
            [
                'id' => 1,
                'invitation_key' => 'latif-aci',
                'name' => 'Legacy Guest',
                'attendance' => 'attending',
                'guest_count' => 2,
                'message' => 'A legacy blessing.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 2,
                'invitation_key' => 'another-invitation',
                'name' => 'Other Legacy Guest',
                'attendance' => 'maybe',
                'guest_count' => null,
                'message' => 'A blessing from another invitation.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'id' => 3,
                'invitation_key' => 'latif-aci',
                'name' => 'Blank Legacy Guest',
                'attendance' => 'maybe',
                'guest_count' => null,
                'message' => " \n\t",
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);

        $backfill = require base_path('database/migrations/2026_09_22_020000_backfill_rsvp_messages_as_wishes.php');
        $backfill->up();
        $backfill->up();

        expect(DB::table('wishes')->count())->toBe(2);
        expect(DB::table('wishes')->first())
            ->rsvp_id->toBe(1)
            ->message->toBe('A legacy blessing.')
            ->status->toBe('pending');
        expect(DB::table('wishes')->where('rsvp_id', 2)->first())
            ->invitation_key->toBe('another-invitation')
            ->message->toBe('A blessing from another invitation.');
    } finally {
        DB::disconnect($connection);
        DB::purge($connection);
        config(['database.default' => $originalDefault]);
    }
});

test('removing rsvp message storage can restore messages from wishes', function () {
    $connection = 'rsvp_contract_test';
    $originalDefault = config('database.default');

    config([
        'database.default' => $connection,
        "database.connections.{$connection}" => [
            'driver' => 'sqlite',
            'database' => ':memory:',
            'prefix' => '',
            'foreign_key_constraints' => true,
        ],
    ]);
    DB::purge($connection);

    try {
        $schema = Schema::connection($connection);
        $schema->create('rsvps', function (Blueprint $table) {
            $table->id();
            $table->text('message')->nullable();
        });
        $schema->create('wishes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('rsvp_id')->nullable();
            $table->text('message');
        });
        DB::table('rsvps')->insert(['id' => 1, 'message' => 'Original message']);
        DB::table('wishes')->insert(['id' => 1, 'rsvp_id' => 1, 'message' => 'Original message']);

        $contract = require base_path('database/migrations/2026_09_22_030000_remove_message_from_rsvps_table.php');
        $contract->up();
        expect(Schema::hasColumn('rsvps', 'message'))->toBeFalse();

        $contract->down();
        expect(Schema::hasColumn('rsvps', 'message'))->toBeTrue()
            ->and(DB::table('rsvps')->value('message'))->toBe('Original message');
    } finally {
        DB::disconnect($connection);
        DB::purge($connection);
        config(['database.default' => $originalDefault]);
    }
});
