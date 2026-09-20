<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\MediaAsset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminInvitationController extends Controller
{
    public function edit(): Response
    {
        $invitation = $this->invitation();

        return Inertia::render('admin/invitation', [
            'content' => $invitation->contentForEditing(),
            'hasDraft' => $invitation->draft_content !== null,
            'publishedAt' => $invitation->published_at?->toIso8601String(),
            'media' => $invitation->mediaAssets()->latest()->get()->map(fn (MediaAsset $asset): array => [
                'id' => $asset->id,
                'name' => $asset->original_name,
                'url' => $asset->url(),
                'mimeType' => $asset->mime_type,
                'archived' => $asset->archived_at !== null,
            ]),
        ]);
    }

    public function saveDraft(Request $request): RedirectResponse
    {
        $validated = $request->validate(['content' => ['required', 'json']]);
        $content = json_decode($validated['content'], true, 512, JSON_THROW_ON_ERROR);
        $invitation = $this->invitation();
        $invitation->update([
            'draft_content' => $content,
            'draft_updated_by' => $request->user()->id,
        ]);

        return to_route('admin.invitation.edit')->with('success', 'Draft saved.');
    }

    public function preview(): Response
    {
        $invitation = $this->invitation();

        return Inertia::render('welcome', [
            'invitation' => $invitation->contentForEditing(),
            'preview' => true,
        ]);
    }

    public function publish(Request $request): RedirectResponse
    {
        $invitation = $this->invitation();
        $content = $invitation->contentForEditing();
        $this->validatePublishable($content);

        DB::transaction(function () use ($invitation, $content, $request): void {
            $invitation->update([
                'published_content' => $content,
                'published_by' => $request->user()->id,
                'published_at' => now(),
                'draft_content' => null,
                'draft_updated_by' => null,
            ]);
        });

        return to_route('admin.invitation.edit')->with('success', 'Invitation published.');
    }

    public function uploadMedia(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,webp,mp3,wav,ogg'],
        ]);
        $invitation = $this->invitation();
        $file = $validated['file'];
        $path = $file->store('invitation-media', 'public');

        $invitation->mediaAssets()->create([
            'uploaded_by' => $request->user()->id,
            'disk' => 'public',
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'size' => $file->getSize(),
        ]);

        return to_route('admin.invitation.edit')->with('success', 'Media uploaded.');
    }

    public function archiveMedia(MediaAsset $mediaAsset): RedirectResponse
    {
        abort_unless($mediaAsset->invitation_id === $this->invitation()->id, 404);
        $mediaAsset->update(['archived_at' => now()]);

        return to_route('admin.invitation.edit')->with('success', 'Media archived.');
    }

    public function deleteMedia(MediaAsset $mediaAsset): RedirectResponse
    {
        abort_unless($mediaAsset->invitation_id === $this->invitation()->id, 404);

        if ($this->contentReferences($mediaAsset)) {
            throw ValidationException::withMessages([
                'media' => 'This asset is still referenced by the draft or published invitation.',
            ]);
        }

        Storage::disk($mediaAsset->disk)->delete($mediaAsset->path);
        $mediaAsset->delete();

        return to_route('admin.invitation.edit')->with('success', 'Media deleted.');
    }

    private function invitation(): Invitation
    {
        return Invitation::query()->firstOrCreate(
            ['key' => config('invitation.key')],
            ['published_content' => config('invitation')],
        );
    }

    private function validatePublishable(array $content): void
    {
        $errors = [];

        if (blank(data_get($content, 'cover.image'))) {
            $errors['cover.image'] = 'A cover image is required.';
        }

        if (blank(data_get($content, 'couple.bride.name')) || blank(data_get($content, 'couple.groom.name'))) {
            $errors['couple'] = 'Both couple names are required.';
        }

        $events = data_get($content, 'events', []);

        if (! is_array($events) || $events === []) {
            $errors['events'] = 'At least one event is required.';
        }

        foreach (is_array($events) ? $events : [] as $index => $event) {
            foreach (['name', 'date', 'time', 'venue'] as $field) {
                if (blank(data_get($event, $field))) {
                    $errors["events.{$index}.{$field}"] = "Event {$index} is missing {$field}.";
                }
            }

            $mapUrl = data_get($event, 'maps', data_get($event, 'map'));

            if (filled($mapUrl) && filter_var($mapUrl, FILTER_VALIDATE_URL) === false) {
                $errors["events.{$index}.map"] = "Event {$index} has an invalid map URL.";
            }
        }

        $accounts = data_get($content, 'gifts.accounts', []);

        foreach (is_array($accounts) ? $accounts : [] as $index => $account) {
            foreach (['number', 'holder'] as $field) {
                if (blank(data_get($account, $field))) {
                    $errors["gifts.accounts.{$index}.{$field}"] = "Gift account {$index} is missing {$field}.";
                }
            }
        }

        if (blank(data_get($content, 'countdown.target'))) {
            $errors['countdown.target'] = 'A countdown target is required.';
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function contentReferences(MediaAsset $mediaAsset): bool
    {
        $needle = [$mediaAsset->path, $mediaAsset->url()];

        foreach ([$this->invitation()->draft_content, $this->invitation()->published_content] as $content) {
            $serialized = json_encode($content ?? []);

            foreach ($needle as $reference) {
                if ($reference !== '' && str_contains($serialized, $reference)) {
                    return true;
                }
            }
        }

        return false;
    }
}
