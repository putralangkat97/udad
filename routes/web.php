<?php

use App\Http\Controllers\AdminInvitationController;
use App\Http\Controllers\RsvpController;
use App\Http\Controllers\WishController;
use App\Http\Controllers\WishModerationController;
use App\Models\Invitation;
use App\Models\Wish;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $invitation = Invitation::query()->where('key', config('invitation.key'))->first();
    $wishes = Wish::query()
        ->where('invitation_key', config('invitation.key'))
        ->published()
        ->latest()
        ->get(['name', 'message']);

    return Inertia::render('welcome', [
        'invitation' => $invitation?->contentForGuests() ?: config('invitation'),
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

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/invitation', [AdminInvitationController::class, 'edit'])->name('invitation.edit');
    Route::post('/invitation/draft', [AdminInvitationController::class, 'saveDraft'])->name('invitation.draft');
    Route::get('/invitation/preview', [AdminInvitationController::class, 'preview'])->name('invitation.preview');
    Route::post('/invitation/publish', [AdminInvitationController::class, 'publish'])->name('invitation.publish');
    Route::post('/invitation/media', [AdminInvitationController::class, 'uploadMedia'])->name('invitation.media.upload');
    Route::post('/invitation/media/{mediaAsset}/archive', [AdminInvitationController::class, 'archiveMedia'])->name('invitation.media.archive');
    Route::delete('/invitation/media/{mediaAsset}', [AdminInvitationController::class, 'deleteMedia'])->name('invitation.media.delete');
});

require __DIR__.'/settings.php';
