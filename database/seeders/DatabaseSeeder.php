<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'is_admin' => true,
            ],
        );
        
        User::query()->updateOrCreate(
            ['email' => 'rahmadaniadistia16@gmail.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('12345678'),
                'is_admin' => true,
            ],
        );
    }
}
