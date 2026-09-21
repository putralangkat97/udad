<?php

use App\Models\Invitation;
use App\Models\MediaAsset;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

function adminUser(): User
{
    return User::factory()->admin()->create();
}

test('uploaded photos are optimized and can be saved in invitation image fields', function (string $field) {
    Storage::fake('public');
    $admin = adminUser();
    $invitation = Invitation::importConfig();
    $published = $invitation->published_content;

    $response = $this->actingAs($admin)->postJson(route('admin.invitation.media.upload'), [
        'kind' => 'image',
        'file' => UploadedFile::fake()->image('wedding.png', 3000, 1500),
    ]);

    $response->assertCreated()->assertJsonPath('mimeType', 'image/webp')->assertJsonPath('name', 'wedding.png');
    $asset = MediaAsset::findOrFail($response->json('id'));
    Storage::disk('public')->assertExists($asset->path);
    $image = getimagesizefromstring(Storage::disk('public')->get($asset->path));
    expect($image[0])->toBe(2400);
    expect($image[1])->toBe(1200);
    expect($image['mime'])->toBe('image/webp');
    expect($asset->size)->toBe(Storage::disk('public')->size($asset->path));

    $content = $published;
    data_set($content, $field, $response->json('url'));
    $this->post(route('admin.invitation.draft'), ['content' => json_encode($content)])
        ->assertRedirect(route('admin.invitation.edit'));

    expect(data_get($invitation->fresh()->draft_content, $field))->toBe($asset->url());
    expect($invitation->fresh()->published_content)->toBe($published);
})->with(['cover.image', 'couple.bride.photo', 'couple.groom.photo', 'gallery.0.src']);

test('image fields reject invalid or oversized uploads without creating media', function (string $invalid) {
    Storage::fake('public');
    $file = match ($invalid) {
        'audio' => UploadedFile::fake()->create('song.mp3', 10, 'audio/mpeg'),
        'size' => UploadedFile::fake()->image('large.jpg')->size(10241),
        'dimensions' => UploadedFile::fake()->image('wide.png', 8001, 1),
    };

    $this->actingAs(adminUser())->postJson(route('admin.invitation.media.upload'), [
        'kind' => 'image',
        'file' => $file,
    ])->assertUnprocessable()->assertJsonValidationErrors('file');

    $this->assertDatabaseCount('media_assets', 0);
    expect(Storage::disk('public')->allFiles())->toBe([]);
})->with(['audio', 'size', 'dimensions']);

test('small uploaded photos retain their dimensions', function () {
    Storage::fake('public');

    $response = $this->actingAs(adminUser())->postJson(route('admin.invitation.media.upload'), [
        'kind' => 'image',
        'file' => UploadedFile::fake()->image('portrait.jpg', 120, 180),
    ])->assertCreated();

    $asset = MediaAsset::findOrFail($response->json('id'));
    $image = getimagesizefromstring(Storage::disk('public')->get($asset->path));
    expect([$image[0], $image[1]])->toBe([120, 180]);
});

test('only admins can open invitation content management', function () {
    $this->get(route('admin.invitation.edit'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('admin.invitation.edit'))
        ->assertForbidden();

    $this->actingAs(adminUser())
        ->get(route('admin.invitation.edit'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('admin/invitation')
            ->has('content')
            ->where('hasDraft', false));
});

test('config import is idempotent and preserves managed content', function () {
    $invitation = Invitation::importConfig();
    $invitation->update(['published_content' => ['title' => 'Managed title']]);

    $imported = Invitation::importConfig();

    expect(Invitation::query()->where('key', config('invitation.key'))->count())
        ->toBe(1)
        ->and($imported->fresh()->published_content['title'])
        ->toBe('Managed title');
});

test('managed invitation starts with the complete config publication', function () {
    expect(Invitation::importConfig()->published_content)
        ->toEqual(config('invitation'));
});

test('public invitation falls back to config when no managed version exists', function () {
    Invitation::query()->where('key', config('invitation.key'))->delete();

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('welcome')
            ->where('invitation.title', config('invitation.title')));
});

test('guests and non-admins cannot preview or publish a draft', function () {
    $this->get(route('admin.invitation.preview'))->assertRedirect(route('login'));
    $this->post(route('admin.invitation.publish'))->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('admin.invitation.preview'))
        ->assertForbidden();

    $this->actingAs(User::factory()->create())
        ->post(route('admin.invitation.publish'))
        ->assertForbidden();
});

test('non-admins cannot save or upload managed invitation content', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('admin.invitation.draft'), [
            'content' => json_encode(config('invitation')),
        ])
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('admin.invitation.media.upload'), [
            'file' => UploadedFile::fake()->image('ornament.png'),
        ])
        ->assertForbidden();
});

test('admins can save a draft without changing the public invitation', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;
    data_set($content, 'title', 'Draft Invitation Title');

    $this->actingAs($admin)
        ->post(route('admin.invitation.draft'), ['content' => json_encode($content)])
        ->assertRedirect(route('admin.invitation.edit'));

    $this->assertDatabaseHas('invitations', [
        'id' => $invitation->id,
        'draft_updated_by' => $admin->id,
    ]);
    expect(Invitation::find($invitation->id)->published_content['title'])
        ->toBe(config('invitation.title'));
});

test('admins can edit general couple event and opening content as an isolated draft', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;

    data_set($content, 'title', 'Draft title');
    data_set($content, 'timezone', 'Asia/Jakarta');
    data_set($content, 'couple.bride.name', 'Draft bride');
    data_set($content, 'couple.groom.name', 'Draft groom');
    data_set($content, 'events', [
        [
            'name' => 'Ceremony',
            'date' => 'Monday, 5 October 2026',
            'time' => '08.00 WIB',
            'venue' => 'Draft venue',
            'maps' => 'https://maps.example.test/ceremony',
        ],
    ]);
    data_set($content, 'opening.quote', 'Draft quote');
    data_set($content, 'opening.reference', 'Draft reference');

    $this->actingAs($admin)
        ->post(route('admin.invitation.draft'), ['content' => json_encode($content)])
        ->assertRedirect(route('admin.invitation.edit'));

    $draft = Invitation::findOrFail($invitation->id)->draft_content;

    expect($draft['title'])->toBe('Draft title')
        ->and($draft['couple']['bride']['name'])->toBe('Draft bride')
        ->and($draft['events'][0]['venue'])->toBe('Draft venue')
        ->and($draft['opening']['quote'])->toBe('Draft quote')
        ->and($invitation->fresh()->published_content['title'])
        ->toBe(config('invitation.title'));
});

test('draft content must be a JSON object while incomplete objects remain saveable', function () {
    $admin = adminUser();

    $this->actingAs($admin)
        ->post(route('admin.invitation.draft'), ['content' => json_encode(['title' => ''])])
        ->assertRedirect(route('admin.invitation.edit'));

    $this->actingAs($admin)
        ->post(route('admin.invitation.draft'), ['content' => json_encode('not an object')])
        ->assertSessionHasErrors('content');
});

test('admins can save gifts gallery story and audio changes as one draft', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;

    data_set($content, 'audio', '/storage/invitation-media/reception.mp3');
    data_set($content, 'gifts.intro', 'Draft gift instructions');
    data_set($content, 'gifts.accounts', [
        ['bank' => 'BCA', 'number' => '1234567890', 'holder' => 'DRAFT HOLDER'],
    ]);
    data_set($content, 'gallery', []);
    data_set($content, 'story.entries', []);

    $this->actingAs($admin)
        ->post(route('admin.invitation.draft'), ['content' => json_encode($content)])
        ->assertRedirect(route('admin.invitation.edit'));

    $draft = Invitation::findOrFail($invitation->id)->draft_content;

    expect($draft['audio'])->toBe('/storage/invitation-media/reception.mp3')
        ->and($draft['gifts']['intro'])->toBe('Draft gift instructions')
        ->and($draft['gifts']['accounts'][0]['number'])->toBe('1234567890')
        ->and($draft['gallery'])->toBe([])
        ->and($draft['story']['entries'])->toBe([])
        ->and($invitation->fresh()->published_content['gifts']['intro'])
        ->toBe(config('invitation.gifts.intro'));
});

test('admins can preview the draft through the invitation renderer', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;
    data_set($content, 'title', 'Preview Invitation Title');

    $this->actingAs($admin)->post(route('admin.invitation.draft'), [
        'content' => json_encode($content),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.invitation.preview'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('welcome')
            ->where('preview', true)
            ->where('invitation.title', 'Preview Invitation Title'));

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('invitation.title', config('invitation.title'))
            ->missing('preview'));
});

test('publishing makes the complete draft public atomically', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;
    data_set($content, 'title', 'Published Invitation Title');

    $this->actingAs($admin)->post(route('admin.invitation.draft'), [
        'content' => json_encode($content),
    ]);
    $this->actingAs($admin)
        ->post(route('admin.invitation.publish'))
        ->assertRedirect(route('admin.invitation.edit'));

    $this->get(route('home'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('welcome')
            ->where('invitation.title', 'Published Invitation Title'));
    expect(Invitation::find($invitation->id)->draft_content)->toBeNull();
});

test('published version exposes publisher identity and timestamp to admins', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();

    $this->actingAs($admin)->post(route('admin.invitation.draft'), [
        'content' => json_encode($invitation->published_content),
    ]);
    $this->actingAs($admin)
        ->post(route('admin.invitation.publish'))
        ->assertRedirect(route('admin.invitation.edit'));

    $this->actingAs($admin)
        ->get(route('admin.invitation.edit'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('publishedBy', $admin->name)
            ->has('publishedAt'));
});

test('publish validation preserves the previous public version', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;
    data_set($content, 'couple.groom.name', '');
    data_set($content, 'events', []);

    $this->actingAs($admin)->post(route('admin.invitation.draft'), [
        'content' => json_encode($content),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.invitation.publish'))
        ->assertSessionHasErrors(['couple', 'events']);

    expect(Invitation::find($invitation->id)->published_content['couple']['groom']['name'])
        ->toBe(config('invitation.couple.groom.name'));
});

test('an incomplete draft cannot publish the previous public version', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();

    $this->actingAs($admin)->post(route('admin.invitation.draft'), [
        'content' => json_encode((object) []),
    ])->assertRedirect(route('admin.invitation.edit'));

    $this->actingAs($admin)
        ->post(route('admin.invitation.publish'))
        ->assertSessionHasErrors(['cover.image', 'couple', 'events', 'countdown.target']);

    expect(Invitation::findOrFail($invitation->id)->published_content['title'])
        ->toBe(config('invitation.title'));
});

test('publish validation rejects malformed gift account numbers', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;
    data_set($content, 'gifts.accounts', [
        ['bank' => 'BCA', 'number' => '123-INVALID', 'holder' => 'Holder'],
    ]);

    $this->actingAs($admin)->post(route('admin.invitation.draft'), [
        'content' => json_encode($content),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.invitation.publish'))
        ->assertSessionHasErrors('gifts.accounts.0.number');
});

test('publish validation rejects missing required media references', function () {
    $admin = adminUser();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;
    data_set($content, 'audio', '');
    data_set($content, 'cover.image', '');
    data_set($content, 'couple.bride.photo', '');
    data_set($content, 'countdown.frame', '');

    $this->actingAs($admin)->post(route('admin.invitation.draft'), [
        'content' => json_encode($content),
    ]);

    $this->actingAs($admin)
        ->post(route('admin.invitation.publish'))
        ->assertSessionHasErrors([
            'audio',
            'cover.image',
            'couple.bride.photo',
            'countdown.frame',
        ]);
});

test('admins can archive and delete an unreferenced media asset', function () {
    Storage::fake('public');
    $admin = adminUser();

    $this->actingAs($admin)->post(route('admin.invitation.media.upload'), [
        'file' => UploadedFile::fake()->image('ornament.png'),
    ])->assertRedirect(route('admin.invitation.edit'));

    $asset = MediaAsset::query()->latest()->first();
    expect($asset)->not->toBeNull();

    $this->actingAs($admin)->post(route('admin.invitation.media.archive', $asset))
        ->assertRedirect(route('admin.invitation.edit'));

    $this->actingAs($admin)->delete(route('admin.invitation.media.delete', $asset))
        ->assertRedirect(route('admin.invitation.edit'));

    expect($asset->fresh())->toBeNull();
});

test('media library exposes metadata and protects referenced assets', function () {
    Storage::fake('public');
    $admin = adminUser();

    $this->actingAs($admin)->post(route('admin.invitation.media.upload'), [
        'file' => UploadedFile::fake()->image('frame.png', 120, 80),
    ])->assertRedirect(route('admin.invitation.edit'));

    $asset = MediaAsset::query()->latest()->firstOrFail();
    $invitation = Invitation::query()->where('key', config('invitation.key'))->firstOrFail();
    $content = $invitation->published_content;
    data_set($content, 'opening.frame', $asset->path);

    $this->actingAs($admin)->post(route('admin.invitation.draft'), [
        'content' => json_encode($content),
    ]);

    expect(Invitation::findOrFail($invitation->id)->draft_content['opening']['frame'])
        ->toBe($asset->path);

    $this->actingAs($admin)
        ->get(route('admin.invitation.edit'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('media.0.name', 'frame.png')
            ->where('media.0.mimeType', 'image/png')
            ->where('media.0.size', $asset->size)
            ->where('media.0.archived', false));

    $this->actingAs($admin)
        ->delete(route('admin.invitation.media.delete', $asset))
        ->assertSessionHasErrors('media');

    expect($asset->fresh())->not->toBeNull();
});

test('media upload rejects unsupported files and non-admins', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('admin.invitation.media.upload'), [
            'file' => UploadedFile::fake()->create('script.php', 1, 'text/x-php'),
        ])
        ->assertForbidden();

    $this->actingAs(adminUser())
        ->post(route('admin.invitation.media.upload'), [
            'file' => UploadedFile::fake()->create('script.php', 1, 'text/x-php'),
        ])
        ->assertSessionHasErrors('file');
});
