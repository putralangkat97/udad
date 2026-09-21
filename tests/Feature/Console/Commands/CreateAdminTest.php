<?php

use App\Models\User;

test('creates an administrator from interactive input', function () {
    $this->artisan('app:create-admin')
        ->expectsQuestion('Email address', 'admin@example.com')
        ->expectsQuestion('Name', 'Wedding Admin')
        ->expectsQuestion('Password', 'a-secure-password')
        ->expectsOutput('Administrator created.')
        ->assertExitCode(0);

    $this->assertDatabaseHas('users', [
        'name' => 'Wedding Admin',
        'email' => 'admin@example.com',
        'is_admin' => true,
    ]);

    expect(User::query()->sole()->password)->not->toBe('a-secure-password');
});

test('does not replace an existing user', function () {
    $existingUser = User::factory()->create(['email' => 'admin@example.com']);

    $this->artisan('app:create-admin')
        ->expectsQuestion('Email address', 'admin@example.com')
        ->expectsOutput('A user with this email address already exists.')
        ->assertExitCode(1);

    $this->assertDatabaseCount('users', 1);
    $this->assertModelExists($existingUser);
});
