<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRsvpRequest;
use App\Models\InvitationRecipient;
use App\Models\Rsvp;
use App\Models\Wish;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RsvpController extends Controller
{
    public function store(StoreRsvpRequest $request): RedirectResponse
    {
        $data = $request->validated();

        return $this->createRsvp($data);
    }

    public function storeRecipient(StoreRsvpRequest $request, string $token): RedirectResponse
    {
        $recipient = InvitationRecipient::query()
            ->where('token', $token)
            ->whereNull('archived_at')
            ->whereHas('invitation', fn ($query) => $query->where('key', config('invitation.key')))
            ->firstOrFail();

        return $this->createRsvp($request->validated(), $recipient);
    }

    /** @param array<string, mixed> $data */
    private function createRsvp(array $data, ?InvitationRecipient $recipient = null): RedirectResponse
    {
        $message = trim((string) ($data['message'] ?? ''));

        unset($data['message']);

        DB::transaction(function () use ($data, $message, $recipient): void {
            $rsvp = Rsvp::create([
                'invitation_key' => config('invitation.key'),
                ...$data,
                'recipient_id' => $recipient?->id,
            ]);

            if ($message !== '') {
                Wish::create([
                    'invitation_key' => config('invitation.key'),
                    'rsvp_id' => $rsvp->id,
                    'name' => $rsvp->name,
                    'message' => $message,
                    'status' => Wish::STATUS_PENDING,
                ]);
            }
        });

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Thank you! Your RSVP has been received.'),
        ]);

        return back();
    }
}
