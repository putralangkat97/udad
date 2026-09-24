<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use App\Models\InvitationRecipient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminInvitationRecipientController extends Controller
{
    public function index(): Response
    {
        $invitation = $this->invitation();
        $content = $invitation->contentForGuests();
        /** @var list<InvitationRecipient> $recipients */
        $recipients = $invitation->recipients()->latest()->get()->all();

        return Inertia::render('admin/recipients', [
            'recipients' => array_map(fn (InvitationRecipient $recipient): array => [
                'id' => $recipient->id,
                'displayName' => $recipient->display_name,
                'link' => route('invitation.recipient', $recipient->token),
                'message' => $this->invitationMessage($recipient, $content),
                'archived' => $recipient->archived_at !== null,
            ], $recipients),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
        ]);

        $this->invitation()->recipients()->create([
            'display_name' => $validated['display_name'],
            'token' => $this->newToken(),
        ]);

        return to_route('admin.recipients.index')->with('success', 'Recipient created.');
    }

    public function update(Request $request, InvitationRecipient $recipient): RedirectResponse
    {
        $this->assertRecipientBelongsToInvitation($recipient);

        $validated = $request->validate([
            'display_name' => ['required', 'string', 'max:255'],
        ]);

        $recipient->update(['display_name' => $validated['display_name']]);

        return to_route('admin.recipients.index')->with('success', 'Recipient updated.');
    }

    public function archive(InvitationRecipient $recipient): RedirectResponse
    {
        $this->assertRecipientBelongsToInvitation($recipient);
        $recipient->update(['archived_at' => now()]);

        return to_route('admin.recipients.index')->with('success', 'Recipient archived.');
    }

    public function rotate(InvitationRecipient $recipient): RedirectResponse
    {
        $this->assertRecipientBelongsToInvitation($recipient);

        if ($recipient->archived_at !== null) {
            throw ValidationException::withMessages([
                'recipient' => 'Archived recipients cannot rotate links.',
            ]);
        }

        $recipient->update(['token' => $this->newToken()]);

        return to_route('admin.recipients.index')->with('success', 'Recipient link rotated.');
    }

    private function invitation(): Invitation
    {
        return Invitation::importConfig();
    }

    private function assertRecipientBelongsToInvitation(InvitationRecipient $recipient): void
    {
        abort_unless($recipient->invitation_id === $this->invitation()->id, 404);
    }

    private function newToken(): string
    {
        do {
            $token = Str::random(64);
        } while (InvitationRecipient::query()->where('token', $token)->exists());

        return $token;
    }

    /** @param array<string, mixed> $content */
    private function invitationMessage(InvitationRecipient $recipient, array $content): string
    {
        $events = collect($content['events'] ?? [])
            ->map(fn (array $event): string => implode("\n", [
                'Pada: '.($event['name'] ?? ''),
                '🗓️ Tanggal: '.($event['date'] ?? ''),
                '🕛 Pukul: '.($event['time'] ?? ''),
                '📍 Lokasi: '.($event['venue'] ?? ''),
            ]))
            ->implode("\n\n");
        $names = data_get($content, 'cover.names', data_get($content, 'title', ''));
        $link = route('invitation.recipient', $recipient->token);

        return implode("\n", [
            'Yth. Bapak/Ibu/Saudara/i',
            $recipient->display_name,
            'Di Tempat',
            '',
            'Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i dan teman-teman untuk menghadiri acara,',
            '',
            '===========',
            'The Wedding Of '.$names,
            '===========',
            '',
            $events,
            '',
            'Link undangan bisa diakses lengkap di:',
            $link,
            '',
            'Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir di acara kami.',
            'Mohon maaf perihal undangan hanya dibagikan melalui pesan ini.',
            'Terima kasih banyak atas perhatiannya.',
        ]);
    }
}
