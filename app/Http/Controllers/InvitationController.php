<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\InvitationRecipient;
use App\Models\Wish;
use Inertia\Inertia;
use Inertia\Response;

class InvitationController extends Controller
{
    public function show(): Response
    {
        return $this->render();
    }

    public function showRecipient(string $token): Response
    {
        $recipient = InvitationRecipient::query()
            ->where('token', $token)
            ->firstOrFail();

        return $this->render(
            $recipient->archived_at === null ? $recipient->display_name : null,
            $recipient->invitation,
        );
    }

    private function render(?string $recipientDisplayName = null, ?Invitation $invitation = null): Response
    {
        $invitation ??= Invitation::query()->where('key', config('invitation.key'))->first();
        $invitationKey = $invitation?->key ?: config('invitation.key');
        $wishes = Wish::query()
            ->where('invitation_key', $invitationKey)
            ->published()
            ->latest()
            ->get(['name', 'message']);

        return Inertia::render('welcome', [
            'invitation' => $invitation?->contentForGuests() ?: config('invitation'),
            'wishes' => $wishes,
            'recipientDisplayName' => $recipientDisplayName,
        ]);
    }
}
