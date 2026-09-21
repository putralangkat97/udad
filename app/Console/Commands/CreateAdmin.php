<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

#[Signature('app:create-admin')]
#[Description('Create an administrator account interactively.')]
class CreateAdmin extends Command
{
    public function handle(): int
    {
        $email = $this->ask('Email address');

        if (User::query()->where('email', $email)->exists()) {
            $this->error('A user with this email address already exists.');

            return self::FAILURE;
        }

        User::query()->create([
            'name' => $this->ask('Name'),
            'email' => $email,
            'password' => Hash::make($this->secret('Password')),
            'is_admin' => true,
        ]);

        $this->info('Administrator created.');

        return self::SUCCESS;
    }
}
