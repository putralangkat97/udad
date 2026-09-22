<?php

use App\Http\Controllers\AdminInvitationController;
use App\Http\Controllers\AdminInvitationRecipientController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\RsvpController;
use App\Http\Controllers\WishController;
use App\Http\Controllers\WishModerationController;
use Illuminate\Support\Facades\Route;

Route::get('/', [InvitationController::class, 'show'])->name('home');
Route::get('/invite/{token}', [InvitationController::class, 'showRecipient'])
    ->where('token', '[A-Za-z0-9]+')
    ->name('invitation.recipient');

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
    Route::get('/recipients', [AdminInvitationRecipientController::class, 'index'])->name('recipients.index');
    Route::post('/recipients', [AdminInvitationRecipientController::class, 'store'])->name('recipients.store');
    Route::patch('/recipients/{recipient}', [AdminInvitationRecipientController::class, 'update'])->name('recipients.update');
    Route::post('/recipients/{recipient}/archive', [AdminInvitationRecipientController::class, 'archive'])->name('recipients.archive');
    Route::post('/recipients/{recipient}/rotate', [AdminInvitationRecipientController::class, 'rotate'])->name('recipients.rotate');
});

require __DIR__.'/settings.php';
