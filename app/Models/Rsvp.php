<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['invitation_key', 'name', 'attendance', 'guest_count', 'message'])]
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
}
