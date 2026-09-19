<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWishRequest;
use App\Models\Wish;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class WishController extends Controller
{
    public function store(StoreWishRequest $request): RedirectResponse
    {
        Wish::create([
            'invitation_key' => config('invitation.key'),
            'status' => Wish::STATUS_PENDING,
            ...$request->validated(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Thank you! Your wish is waiting for approval.'),
        ]);

        return back();
    }
}
