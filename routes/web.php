<?php

use App\Http\Controllers\RsvpController;
use App\Http\Controllers\WishController;
use App\Http\Controllers\WishModerationController;
use App\Models\Wish;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $wishes = Wish::query()
        ->where('invitation_key', config('invitation.key'))
        ->published()
        ->latest()
        ->get(['name', 'message']);

    return Inertia::render('welcome', [
        'invitation' => config('invitation'),
        'wishes' => $wishes,
    ]);
})->name('home');

Route::post('/rsvp', [RsvpController::class, 'store'])
    ->middleware('throttle:rsvp')
    ->name('rsvp.store');

Route::post('/wishes', [WishController::class, 'store'])
    ->middleware('throttle:wishes')
    ->name('wishes.store');

Route::middleware('auth')->prefix('moderation')->name('moderation.')->group(function () {
    Route::get('/wishes', [WishModerationController::class, 'index'])
        ->name('wishes.index');
    Route::post('/wishes/{wish}/publish', [WishModerationController::class, 'publish'])
        ->name('wishes.publish');
    Route::post('/wishes/{wish}/reject', [WishModerationController::class, 'reject'])
        ->name('wishes.reject');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
