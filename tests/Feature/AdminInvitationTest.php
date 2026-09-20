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
            ->where('invitation.title', 'Preview Invitation Title'));
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
