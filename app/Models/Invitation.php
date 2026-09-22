<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['key', 'draft_content', 'published_content', 'draft_updated_by', 'published_by', 'published_at'])]
class Invitation extends Model
{
    protected function casts(): array
    {
        return [
            'draft_content' => 'array',
            'published_content' => 'array',
            'published_at' => 'datetime',
        ];
    }

    public static function importConfig(): self
    {
        return static::query()->firstOrCreate(
            ['key' => config('invitation.key')],
            [
                'published_content' => config('invitation'),
                'published_at' => now(),
            ],
        );
    }

    /** @return HasMany<MediaAsset, $this> */
    public function mediaAssets(): HasMany
    {
        return $this->hasMany(MediaAsset::class);
    }

    /** @return HasMany<InvitationRecipient, $this> */
    public function recipients(): HasMany
    {
        return $this->hasMany(InvitationRecipient::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }

    public function contentForGuests(): array
    {
        return $this->published_content ?: config('invitation');
    }

    public function contentForEditing(): array
    {
        return $this->draft_content !== null
            ? $this->draft_content
            : $this->contentForGuests();
    }
}
