<?php

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
        'message' => 'We are looking forward to celebrating with you.',
    ]);
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
