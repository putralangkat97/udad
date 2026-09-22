<?php

use App\Models\Invitation;
use App\Models\InvitationRecipient;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

function recipientAdmin(): User
{
    return User::factory()->admin()->create();
}

test('only admins can manage invitation recipients', function () {
    $this->get(route('admin.recipients.index'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('admin.recipients.index'))
        ->assertForbidden();

    $this->actingAs(recipientAdmin())
        ->get(route('admin.recipients.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/recipients')
            ->has('recipients'));
});

test('admins can create a recipient and open its personalized invitation', function () {
    $admin = recipientAdmin();

    $this->actingAs($admin)
        ->post(route('admin.recipients.store'), [
            'display_name' => 'Mr. and Mrs. Smith',
        ])
        ->assertRedirect(route('admin.recipients.index'));

    $recipient = InvitationRecipient::query()->firstOrFail();

    expect($recipient->display_name)->toBe('Mr. and Mrs. Smith')
        ->and($recipient->token)->toMatch('/^[A-Za-z0-9]+$/')
        ->and(strlen($recipient->token))->toBeGreaterThanOrEqual(40);

    $this->actingAs($admin)
        ->get(route('admin.recipients.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('recipients.0.displayName', 'Mr. and Mrs. Smith')
            ->where('recipients.0.link', route('invitation.recipient', $recipient->token))
            ->where('recipients.0.archived', false));

    $this->get(route('invitation.recipient', $recipient->token))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('welcome')
            ->where('recipientDisplayName', 'Mr. and Mrs. Smith'));
});

test('recipient display names may be duplicated but cannot be blank', function () {
    $admin = recipientAdmin();
    $payload = ['display_name' => 'The Smith Family'];

    $this->actingAs($admin)
        ->post(route('admin.recipients.store'), $payload)
        ->assertRedirect(route('admin.recipients.index'));

    $this->actingAs($admin)
        ->post(route('admin.recipients.store'), $payload)
        ->assertRedirect(route('admin.recipients.index'));

    expect(InvitationRecipient::query()->count())->toBe(2);

    $this->actingAs($admin)
        ->post(route('admin.recipients.store'), ['display_name' => ''])
        ->assertSessionHasErrors('display_name');
});

test('generic, archived, and unknown recipient invitations have distinct fallback behavior', function () {
    $invitation = Invitation::importConfig();
    $recipient = $invitation->recipients()->create([
        'display_name' => 'Archived Family',
        'token' => 'archivedrecipienttoken',
        'archived_at' => now(),
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('welcome')
            ->where('recipientDisplayName', null));

    $this->get(route('invitation.recipient', $recipient->token))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('welcome')
            ->where('recipientDisplayName', null));

    $this->get(route('invitation.recipient', 'does-not-exist'))
        ->assertNotFound();
});

test('admins can edit and archive recipients without publishing invitation content', function () {
    $admin = recipientAdmin();
    $invitation = Invitation::importConfig();
    $recipient = $invitation->recipients()->create([
        'display_name' => 'Original Name',
        'token' => 'lifecyclerecipienttoken',
    ]);
    $published = $invitation->published_content;

    $this->actingAs($admin)
        ->patch(route('admin.recipients.update', $recipient), [
            'display_name' => 'Updated Name',
        ])
        ->assertRedirect(route('admin.recipients.index'));

    expect($recipient->fresh()->display_name)->toBe('Updated Name');

    $this->actingAs($admin)
        ->patch(route('admin.recipients.update', $recipient), [
            'display_name' => '',
        ])
        ->assertSessionHasErrors('display_name');

    $this->actingAs($admin)
        ->post(route('admin.recipients.archive', $recipient))
        ->assertRedirect(route('admin.recipients.index'));

    expect($recipient->fresh()->archived_at)->not->toBeNull()
        ->and($invitation->fresh()->published_content)->toEqual($published)
        ->and($invitation->fresh()->draft_content)->toBeNull();
});

test('admins can rotate a recipient token and the old link stops being personalized', function () {
    $admin = recipientAdmin();
    $invitation = Invitation::importConfig();
    $recipient = $invitation->recipients()->create([
        'display_name' => 'Rotating Family',
        'token' => 'oldrecipienttoken',
    ]);

    $this->actingAs($admin)
        ->post(route('admin.recipients.rotate', $recipient))
        ->assertRedirect(route('admin.recipients.index'));

    $rotated = $recipient->fresh();

    expect($rotated->token)->not->toBe('oldrecipienttoken');

    $this->get(route('invitation.recipient', 'oldrecipienttoken'))
        ->assertNotFound();

    $this->get(route('invitation.recipient', $rotated->token))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('recipientDisplayName', 'Rotating Family'));
});

test('recipient names containing commas remain intact on personalized invitations', function () {
    $invitation = Invitation::importConfig();
    $recipient = $invitation->recipients()->create([
        'display_name' => 'Smith, John and Jane',
        'token' => 'commarecipienttoken',
    ]);

    $this->get(route('invitation.recipient', $recipient->token))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('recipientDisplayName', 'Smith, John and Jane'));
});

test('non-admins cannot mutate invitation recipients', function () {
    $recipient = Invitation::importConfig()->recipients()->create([
        'display_name' => 'Protected Family',
        'token' => 'protectedrecipienttoken',
    ]);
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.recipients.store'), ['display_name' => 'Blocked'])
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('admin.recipients.update', $recipient), ['display_name' => 'Blocked'])
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('admin.recipients.archive', $recipient))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('admin.recipients.rotate', $recipient))
        ->assertForbidden();
});

test('recipient personalization remains independent from rsvp submissions', function () {
    $invitation = Invitation::importConfig();
    $recipient = $invitation->recipients()->create([
        'display_name' => 'RSVP Family',
        'token' => 'rsvpindependenttoken',
    ]);

    $this->from(route('invitation.recipient', $recipient->token))
        ->post(route('rsvp.store'), [
            'name' => 'RSVP Participant',
            'attendance' => 'attending',
            'guest_count' => 2,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('invitation.recipient', $recipient->token));

    $this->assertDatabaseHas('rsvps', [
        'invitation_key' => config('invitation.key'),
        'name' => 'RSVP Participant',
    ]);
    expect($recipient->fresh()->display_name)->toBe('RSVP Family');
});
