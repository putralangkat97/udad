<?php

use App\Models\Rsvp;
use App\Models\User;
use App\Models\Wish;
use Inertia\Testing\AssertableInertia;

test('the public invitation exposes only published wishes', function () {
    Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Pending Guest',
        'message' => 'This message is waiting for review.',
        'status' => Wish::STATUS_PENDING,
    ]);
    Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Published Guest',
        'message' => 'Congratulations to you both!',
        'status' => Wish::STATUS_PUBLISHED,
    ]);
    Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Rejected Guest',
        'message' => 'This message should stay private.',
        'status' => Wish::STATUS_REJECTED,
    ]);

    $response = $this->get(route('home'));

    $response->assertInertia(function (AssertableInertia $page) {
        $page
            ->component('welcome')
            ->has('wishes', 1)
            ->where('wishes.0.name', 'Published Guest')
            ->where('wishes.0.message', 'Congratulations to you both!');
    });
});

test('published wish content is not emitted as executable html', function () {
    Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => '<img src=x onerror=alert(1)>',
        'message' => '<script>alert(1)</script>',
        'status' => Wish::STATUS_PUBLISHED,
    ]);

    $this->get(route('home'))
        ->assertDontSeeHtml('<img src=x onerror=alert(1)>')
        ->assertDontSeeHtml('<script>alert(1)</script>');
});

test('public wishes hide their rsvp source context', function () {
    $rsvp = Rsvp::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Private Context Author',
        'attendance' => Rsvp::STATUS_ATTENDING,
        'guest_count' => 2,
    ]);
    Wish::create([
        'invitation_key' => 'latif-aci',
        'rsvp_id' => $rsvp->id,
        'name' => 'Private Context Author',
        'message' => 'A published blessing.',
        'status' => Wish::STATUS_PUBLISHED,
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('wishes.0.name', 'Private Context Author')
            ->where('wishes.0.message', 'A published blessing.')
            ->missing('wishes.0.source')
            ->missing('wishes.0.attendance')
            ->missing('wishes.0.guestCount'));
});

test('pending wish content is not emitted as executable moderation html', function () {
    Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => '<img src=x onerror=alert(2)>',
        'message' => '<script>alert(2)</script>',
        'status' => Wish::STATUS_PENDING,
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('moderation.wishes.index'))
        ->assertDontSeeHtml('<img src=x onerror=alert(2)>')
        ->assertDontSeeHtml('<script>alert(2)</script>');
});

test('guests can submit a wish without authentication', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('wishes.store'), [
            'name' => 'Guest Writer',
            'message' => 'Wishing you a lifetime of happiness.',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertDatabaseHas('wishes', [
        'invitation_key' => 'latif-aci',
        'name' => 'Guest Writer',
        'message' => 'Wishing you a lifetime of happiness.',
        'status' => Wish::STATUS_PENDING,
    ]);
});

test('wish submissions require a name and message', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('wishes.store'), []);

    $response
        ->assertSessionHasErrors(['name', 'message'])
        ->assertRedirect(route('home'));

    $this->assertDatabaseCount('wishes', 0);
});

test('wish submissions reject messages over the content limit', function () {
    $response = $this
        ->from(route('home'))
        ->post(route('wishes.store'), [
            'name' => 'Guest Writer',
            'message' => str_repeat('A', 2001),
        ]);

    $response
        ->assertSessionHasErrors('message')
        ->assertRedirect(route('home'));

    $this->assertDatabaseCount('wishes', 0);
});

test('unauthenticated users cannot access wish moderation', function () {
    $wish = Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Pending Guest',
        'message' => 'Please review this message.',
        'status' => Wish::STATUS_PENDING,
    ]);

    $this->get(route('moderation.wishes.index'))
        ->assertRedirect(route('login'));

    $this->post(route('moderation.wishes.publish', $wish))
        ->assertRedirect(route('login'));

    $this->post(route('moderation.wishes.reject', $wish))
        ->assertRedirect(route('login'));
});

test('authenticated moderators can view pending wishes only', function () {
    Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Pending Guest',
        'message' => 'Please review this message.',
        'status' => Wish::STATUS_PENDING,
    ]);
    Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Published Guest',
        'message' => 'Already approved.',
        'status' => Wish::STATUS_PUBLISHED,
    ]);

    $response = $this
        ->actingAs(User::factory()->create())
        ->get(route('moderation.wishes.index'));

    $response->assertInertia(function (AssertableInertia $page) {
        $page
            ->component('moderation/wishes')
            ->has('wishes', 1)
            ->where('wishes.0.name', 'Pending Guest');
    });
});

test('moderators see the source and attendance context for rsvp wishes', function () {
    $rsvp = Rsvp::create([
        'invitation_key' => 'latif-aci',
        'name' => 'RSVP Author',
        'attendance' => Rsvp::STATUS_ATTENDING,
        'guest_count' => 3,
    ]);
    Wish::create([
        'invitation_key' => 'latif-aci',
        'rsvp_id' => $rsvp->id,
        'name' => 'RSVP Author',
        'message' => 'A blessing for the couple.',
        'status' => Wish::STATUS_PENDING,
    ]);

    $this
        ->actingAs(User::factory()->create())
        ->get(route('moderation.wishes.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('wishes.0.source', 'rsvp')
            ->where('wishes.0.attendance', Rsvp::STATUS_ATTENDING)
            ->where('wishes.0.guestCount', 3));
});

test('moderation excludes wishes linked to another invitation rsvp', function () {
    $rsvp = Rsvp::create([
        'invitation_key' => 'another-invitation',
        'name' => 'Other RSVP Author',
        'attendance' => Rsvp::STATUS_MAYBE,
    ]);
    Wish::create([
        'invitation_key' => 'latif-aci',
        'rsvp_id' => $rsvp->id,
        'name' => 'Other RSVP Author',
        'message' => 'This should not be reviewed here.',
        'status' => Wish::STATUS_PENDING,
    ]);

    $this
        ->actingAs(User::factory()->create())
        ->get(route('moderation.wishes.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('wishes', 0));
});

test('authenticated moderators can publish a pending wish', function () {
    $wish = Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Pending Guest',
        'message' => 'Please publish this message.',
        'status' => Wish::STATUS_PENDING,
    ]);

    $response = $this
        ->actingAs(User::factory()->create())
        ->post(route('moderation.wishes.publish', $wish));

    $response->assertRedirect(route('moderation.wishes.index'));
    $this->assertDatabaseHas('wishes', [
        'id' => $wish->id,
        'status' => Wish::STATUS_PUBLISHED,
    ]);
});

test('authenticated moderators can reject a pending wish', function () {
    $wish = Wish::create([
        'invitation_key' => 'latif-aci',
        'name' => 'Pending Guest',
        'message' => 'Please reject this message.',
        'status' => Wish::STATUS_PENDING,
    ]);

    $response = $this
        ->actingAs(User::factory()->create())
        ->post(route('moderation.wishes.reject', $wish));

    $response->assertRedirect(route('moderation.wishes.index'));
    $this->assertDatabaseHas('wishes', [
        'id' => $wish->id,
        'status' => Wish::STATUS_REJECTED,
    ]);
});

test('moderators cannot change a wish belonging to another invitation', function () {
    $wish = Wish::create([
        'invitation_key' => 'another-invitation',
        'name' => 'Other Guest',
        'message' => 'This belongs elsewhere.',
        'status' => Wish::STATUS_PENDING,
    ]);

    $response = $this
        ->actingAs(User::factory()->create())
        ->post(route('moderation.wishes.publish', $wish));

    $response->assertNotFound();
    $this->assertDatabaseHas('wishes', [
        'id' => $wish->id,
        'status' => Wish::STATUS_PENDING,
    ]);
});

test('public wish submissions are throttled', function () {
    $payload = [
        'name' => 'Guest Writer',
        'message' => 'A message for the couple.',
    ];

    foreach (range(1, 10) as $attempt) {
        $this->from(route('home'))->post(route('wishes.store'), [
            ...$payload,
            'name' => $payload['name'].' '.$attempt,
        ]);
    }

    $response = $this->from(route('home'))->post(route('wishes.store'), [
        ...$payload,
        'name' => 'Throttled Guest',
    ]);

    $response->assertTooManyRequests();
    $this->assertDatabaseCount('wishes', 10);
});
