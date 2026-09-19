<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRsvpRequest;
use App\Models\Rsvp;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class RsvpController extends Controller
{
    public function store(StoreRsvpRequest $request): RedirectResponse
    {
        Rsvp::create([
            'invitation_key' => config('invitation.key'),
            ...$request->validated(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Thank you! Your RSVP has been received.'),
        ]);

        return back();
    }
}
