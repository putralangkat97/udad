<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
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

    public function mediaAssets(): HasMany
    {
        return $this->hasMany(MediaAsset::class);
    }

    public function contentForGuests(): array
    {
        return $this->published_content ?: config('invitation');
    }

    public function contentForEditing(): array
    {
        return $this->draft_content ?: $this->contentForGuests();
    }
}
