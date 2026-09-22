<?php

namespace App\Http\Controllers;

use App\Models\Wish;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WishModerationController extends Controller
{
    public function index(): Response
    {
        $wishes = Wish::query()
            ->where('invitation_key', config('invitation.key'))
            ->pending()
            ->where(function ($query) {
                $query
                    ->whereNull('rsvp_id')
                    ->orWhereHas('rsvp', fn ($rsvpQuery) => $rsvpQuery
                        ->where('invitation_key', config('invitation.key')));
            })
            ->with('rsvp:id,attendance,guest_count')
            ->latest()
            ->get(['id', 'rsvp_id', 'name', 'message', 'created_at'])
            ->map(fn (Wish $wish): array => [
                'id' => $wish->id,
                'name' => $wish->name,
                'message' => $wish->message,
                'created_at' => $wish->created_at?->toISOString(),
                'source' => $wish->rsvp_id === null ? 'direct' : 'rsvp',
                'attendance' => $wish->rsvp?->attendance,
                'guestCount' => $wish->rsvp?->guest_count,
            ]);

        return Inertia::render('moderation/wishes', [
            'wishes' => $wishes,
        ]);
    }

    public function publish(Wish $wish): RedirectResponse
    {
        $this->pendingInvitationWish($wish)->update([
            'status' => Wish::STATUS_PUBLISHED,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Wish published.'),
        ]);

        return to_route('moderation.wishes.index');
    }

    public function reject(Wish $wish): RedirectResponse
    {
        $this->pendingInvitationWish($wish)->update([
            'status' => Wish::STATUS_REJECTED,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Wish rejected.'),
        ]);

        return to_route('moderation.wishes.index');
    }

    private function pendingInvitationWish(Wish $wish): Wish
    {
        abort_unless(
            $wish->invitation_key === config('invitation.key')
                && $wish->status === Wish::STATUS_PENDING,
            404,
        );

        return $wish;
    }
}
