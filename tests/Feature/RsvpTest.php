<?php

use App\Models\Invitation;
use App\Models\Rsvp;
use App\Models\Wish;
use Illuminate\Support\Facades\Schema;

test('guests can submit an attending rsvp without authentication', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => 'Guest Attending',
            'attendance' => 'attending',
            'guest_count' => 2,
            'message' => 'We are looking forward to celebrating with you.',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertDatabaseHas('rsvps', [
        'invitation_key' => 'latif-aci',
        'name' => 'Guest Attending',
        'attendance' => 'attending',
        'guest_count' => 2,
    ]);
    $this->assertDatabaseHas('wishes', [
        'name' => 'Guest Attending',
        'message' => 'We are looking forward to celebrating with you.',
        'status' => Wish::STATUS_PENDING,
    ]);
});

test('an rsvp message creates a pending wish linked to the rsvp', function (string $attendance, ?int $guestCount) {
    $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => 'Guest With A Message',
            'attendance' => $attendance,
            'guest_count' => $guestCount,
            'message' => 'May your marriage be filled with joy.',
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $rsvp = Rsvp::query()->firstOrFail();

    $this->assertDatabaseHas('wishes', [
        'rsvp_id' => $rsvp->id,
        'invitation_key' => 'latif-aci',
        'name' => 'Guest With A Message',
        'message' => 'May your marriage be filled with joy.',
        'status' => Wish::STATUS_PENDING,
    ]);
})->with([
    'attending' => ['attending', 2],
    'not attending' => ['not_attending', null],
    'maybe' => ['maybe', null],
]);

test('blank rsvp messages do not create wishes', function (string $message) {
    $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => 'Guest Without A Message',
            'attendance' => 'maybe',
            'message' => $message,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertDatabaseCount('rsvps', 1);
    $this->assertDatabaseCount('wishes', 0);
})->with(['empty' => '', 'whitespace' => " \n\t"]);

test('repeated rsvp messages create separate linked wishes', function () {
    $payload = [
        'name' => 'Guest Responding',
        'attendance' => 'maybe',
        'message' => 'A separate blessing.',
    ];

    $this->from(route('home'))->post(route('rsvp.store'), $payload);
    $this->from(route('home'))->post(route('rsvp.store'), $payload);

    expect(Rsvp::query()->count())->toBe(2)
        ->and(Wish::query()->count())->toBe(2)
        ->and(Wish::query()->pluck('rsvp_id')->unique()->count())->toBe(2);
});

test('generic rsvp submissions cannot claim recipient provenance', function () {
    $recipient = Invitation::importConfig()->recipients()->create([
        'display_name' => 'Unclaimed Family',
        'token' => 'unclaimedfamilytoken',
    ]);

    $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => 'Generic RSVP Author',
            'attendance' => 'maybe',
            'message' => 'A generic blessing.',
            'recipient_token' => $recipient->token,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertDatabaseHas('rsvps', [
        'name' => 'Generic RSVP Author',
        'recipient_id' => null,
    ]);
});

test('guest-written rsvp content is stored only on wishes', function () {
    expect(Schema::hasColumn('rsvps', 'message'))->toBeFalse()
        ->and(Schema::hasColumn('wishes', 'rsvp_id'))->toBeTrue()
        ->and(Schema::hasColumn('rsvps', 'recipient_id'))->toBeTrue();
});

test('guests can submit non-attending and maybe rsvps without a guest count', function (string $attendance) {
    $response = $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => 'Guest Responding',
            'attendance' => $attendance,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertDatabaseHas('rsvps', [
        'invitation_key' => 'latif-aci',
        'name' => 'Guest Responding',
        'attendance' => $attendance,
        'guest_count' => null,
    ]);
})->with(['not_attending', 'maybe']);

test('repeated rsvp submissions are retained separately', function () {
    $payload = [
        'name' => 'Guest Responding',
        'attendance' => 'maybe',
    ];

    $response = $this->from(route('home'))->post(route('rsvp.store'), $payload);
    $response->assertSessionHasNoErrors()->assertRedirect(route('home'));

    $response = $this->from(route('home'))->post(route('rsvp.store'), $payload);
    $response->assertSessionHasNoErrors()->assertRedirect(route('home'));

    $this->assertDatabaseCount('rsvps', 2);
});

test('attending rsvps require a guest count', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => 'Guest Attending',
            'attendance' => 'attending',
        ]);

    $response
        ->assertSessionHasErrors('guest_count')
        ->assertRedirect(route('home'));

    $this->assertDatabaseCount('rsvps', 0);
});

test('attending rsvps require a positive guest count', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => 'Guest Attending',
            'attendance' => 'attending',
            'guest_count' => 0,
        ]);

    $response
        ->assertSessionHasErrors('guest_count')
        ->assertRedirect(route('home'));

    $this->assertDatabaseCount('rsvps', 0);
});

test('rsvps reject unsupported attendance statuses', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => 'Guest Responding',
            'attendance' => 'unknown',
        ]);

    $response
        ->assertSessionHasErrors('attendance')
        ->assertRedirect(route('home'));

    $this->assertDatabaseCount('rsvps', 0);
});

test('rsvps require a guest name', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'attendance' => 'maybe',
        ]);

    $response
        ->assertSessionHasErrors(['name'])
        ->assertRedirect(route('home'));

    $this->assertDatabaseCount('rsvps', 0);
});

test('rsvps reject names and messages over their length limits', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('rsvp.store'), [
            'name' => str_repeat('A', 256),
            'attendance' => 'maybe',
            'message' => str_repeat('B', 2001),
        ]);

    $response
        ->assertSessionHasErrors(['name', 'message'])
        ->assertRedirect(route('home'));

    $this->assertDatabaseCount('rsvps', 0);
});

test('public rsvp submissions are throttled', function () {
    $payload = [
        'name' => 'Guest Responding',
        'attendance' => 'maybe',
    ];

    foreach (range(1, 10) as $attempt) {
        $this->from(route('home'))->post(route('rsvp.store'), [
            ...$payload,
            'name' => $payload['name'].' '.$attempt,
        ]);
    }

    $response = $this->from(route('home'))->post(route('rsvp.store'), [
        ...$payload,
        'name' => 'Throttled Guest',
    ]);

    $response->assertTooManyRequests();
    $this->assertDatabaseCount('rsvps', 10);
});
