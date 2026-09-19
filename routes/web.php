<?php

use App\Http\Controllers\RsvpController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'invitation' => config('invitation'),
    ]);
})->name('home');

Route::post('/rsvp', [RsvpController::class, 'store'])
    ->middleware('throttle:rsvp')
    ->name('rsvp.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
