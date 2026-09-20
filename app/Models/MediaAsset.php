<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['invitation_id', 'uploaded_by', 'disk', 'path', 'original_name', 'mime_type', 'size', 'archived_at'])]
class MediaAsset extends Model
{
    protected function casts(): array
    {
        return ['archived_at' => 'datetime'];
    }

    public function invitation(): BelongsTo
    {
        return $this->belongsTo(Invitation::class);
    }

    public function url(): string
    {
        return asset('storage/'.$this->path);
    }
}
