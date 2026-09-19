<?php

namespace App\Http\Requests;

use App\Models\Rsvp;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRsvpRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'attendance' => ['required', Rule::in(Rsvp::STATUSES)],
            'guest_count' => [
                'exclude_unless:attendance,attending',
                'required',
                'integer',
                'min:1',
            ],
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
