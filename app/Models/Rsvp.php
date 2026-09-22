<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['invitation_key', 'name', 'attendance', 'guest_count', 'recipient_id'])]
class Rsvp extends Model
{
    public const STATUS_ATTENDING = 'attending';

    public const STATUS_NOT_ATTENDING = 'not_attending';

    public const STATUS_MAYBE = 'maybe';

    /**
     * @var list<string>
     */
    public const STATUSES = [
        self::STATUS_ATTENDING,
        self::STATUS_NOT_ATTENDING,
        self::STATUS_MAYBE,
    ];

    protected function casts(): array
    {
        return [
            'guest_count' => 'integer',
        ];
    }

    /** @return BelongsTo<InvitationRecipient, $this> */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(InvitationRecipient::class);
    }

    /** @return HasOne<Wish, $this> */
    public function wish(): HasOne
    {
        return $this->hasOne(Wish::class);
    }
}
